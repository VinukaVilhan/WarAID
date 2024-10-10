import ballerina/http;
import ballerina/sql;
import ballerinax/java.jdbc;
import ballerinax/mysql.driver as _;

// Database configuration (unchanged)
configurable string host = ?;
configurable string port = ?;
configurable string username = ?;
configurable string password = ?;
configurable string database = ?;

string jdbcUrl = string `jdbc:mysql://${host}:${port}/${database}`;

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

service /api on new http:Listener(9090) {
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
            return {body: alert};
        }
        return error("Error occurred while inserting the alert");
    }

    resource function put alerts/[int id](@http:Payload NewAlert updatedAlert) returns Alert|http:NotFound|error {
        sql:ExecutionResult result = check self.dbClient->execute(`
            UPDATE ALERTS1 
            SET DESCRIPTION = ${updatedAlert.description}, 
                CATEGORY = ${updatedAlert.category} 
            WHERE ID = ${id}
        `);
        if result.affectedRowCount > 0 {
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
