import ballerina/http;
import ballerina/sql;
import ballerinax/java.jdbc;
import ballerinax/mysql.driver as _;
import ballerina/websocket;
import ballerina/io;

// Database configuration (unchanged)
configurable string host = ?;
configurable string port = ?;
configurable string username = ?;
configurable string password = ?;
configurable string database = ?;

string jdbcUrl = string `jdbc:mysql://${host}:${port}/${database}`;

listener websocket:Listener alertListener = new websocket:Listener(9091);
isolated map<websocket:Caller> clientsMap = {}; // Ensure this is accessible globally

// This service is for clients to get registered. Once registered, clients will get notified about the alerts.
service /subscribe on alertListener {
    resource function get [string name](http:Request req) returns websocket:Service|websocket:UpgradeError {
        return new UserService(name);
    }
}

service class UserService {
    *websocket:Service;

    final string userName;

    public isolated function init(string username) {
        self.userName = username;
    }

    remote function onOpen(websocket:Caller caller) returns websocket:Error? {
        string welcomeMsg = "Hi " + self.userName + "! You have successfully connected to the alert service.";
        io:println(welcomeMsg);
        
        // Register the client in the clientsMap
        lock {
            clientsMap[caller.getConnectionId()] = caller; // Make sure this line is inside the lock
        }
    }

    remote isolated function onClose(websocket:Caller caller, int statusCode, string reason) {
        lock {
            _ = clientsMap.remove(caller.getConnectionId());
            io:println(self.userName + " disconnected from the alert service.");
        }
    }
}

// Function to perform the broadcasting of alert messages.
isolated function broadcast(string msg) {
    lock {
        // Iterate through the keys of the clientsMap and access the websocket:Caller objects
        foreach string connectionId in clientsMap.keys() {
            websocket:Caller? con = clientsMap[connectionId]; // Get the caller object
            if con is websocket:Caller {
                websocket:Error? err = con->writeMessage(msg);
                if err is websocket:Error {
                    io:println("Error sending message: " + err.message());
                }
            }
        }
    }
}

// Initialize the database
function initDatabase(sql:Client dbClient) returns error? {
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS ALERTS1 (
        ID INT AUTO_INCREMENT PRIMARY KEY,
        DESCRIPTION TEXT NOT NULL,
        CATEGORY VARCHAR(255)
    )`);
}

// CORS configuration at the service level
@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"], // Specify allowed origins
        allowCredentials: true, // Allow credentials (cookies, authorization headers, etc.)
        allowHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Specify allowed methods
        exposeHeaders: ["Content-Length", "Content-Type"] // Specify headers to expose
    }
}

service /api on new http:Listener(8070) {
    final sql:Client dbClient;

    function init() returns error? {
        self.dbClient = check new jdbc:Client(jdbcUrl, username, password);
        check initDatabase(self.dbClient);
    }

    resource function get alerts(string? category) returns Alert[]|error {
        sql:ParameterizedQuery query;
        if category is string {
            query = `SELECT * FROM ALERTS1 WHERE CATEGORY = ${category}`;
        } else {
            query = `SELECT * FROM ALERTS1`;
        }
        stream<Alert, sql:Error?> alertStream = self.dbClient->query(query);
        return from Alert alert in alertStream
               select alert;
    }

    resource function get alerts/[int id]() returns Alert|http:NotFound|error {
        Alert|error alert = self.dbClient->queryRow(`SELECT * FROM ALERTS1 WHERE ID = ${id}`);
        if alert is Alert {
            return alert;
        }
        return http:NOT_FOUND;
    }

    resource function post alerts(@http:Payload NewAlert newAlert) returns AlertCreated|error {
        sql:ExecutionResult result = check self.dbClient->execute(`
            INSERT INTO ALERTS1 (DESCRIPTION, CATEGORY) 
            VALUES (${newAlert.description}, ${newAlert.category})
        `);
        int|string? alertId = result.lastInsertId;
        if alertId is int {
            Alert alert = {
                id: alertId,
                description: newAlert.description,
                category: newAlert.category
            };

            // Broadcast the alert message to all connected clients
            string broadcastMessage = "New Alert: " + newAlert.description;
            broadcast(broadcastMessage);

            return {body: alert};
        }
        return error("Error occurred while inserting the alert");
    }

    // In your `put alerts/[int id]` function
    resource function put alerts/[int id](@http:Payload NewAlert updatedAlert) returns Alert|http:NotFound|error {
        sql:ExecutionResult result = check self.dbClient->execute(`
            UPDATE ALERTS1 
            SET DESCRIPTION = ${updatedAlert.description}, 
                CATEGORY = ${updatedAlert.category} 
            WHERE ID = ${id}
        `);
        if result.affectedRowCount > 0 {
            // Broadcast the update message to all connected clients
            string broadcastMessage = "Updated Alert: " + updatedAlert.description;
            broadcast(broadcastMessage);

            return {
                id: id,
                description: updatedAlert.description,
                category: updatedAlert.category
            };
        }
        return http:NOT_FOUND;
    }

    resource function delete alerts/[int id]() returns http:Ok|http:NotFound|error {
        sql:ExecutionResult result = check self.dbClient->execute(`DELETE FROM ALERTS1 WHERE ID = ${id}`);
        if result.affectedRowCount > 0 {
            return http:OK;
        }
        return http:NOT_FOUND;
    }
}
