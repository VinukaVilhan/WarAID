import ballerina/http;
import ballerina/sql;
import ballerinax/java.jdbc;
import ballerinax/mysql.driver as _; // Add this line to import the MySQL driver

// MySQL database connection details (Replace with your AWS MySQL details)
configurable string host = ?;
configurable string port = ?;
configurable string username = ?;
configurable string password = ?;
configurable string database = ?;
// MySQL JDBC URL format
string jdbcUrl = string `jdbc:mysql://${host}:${port}/${database}`;

function initDatabase(sql:Client dbClient) returns error? {
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS LOCATIONS (
        LOCID INT AUTO_INCREMENT PRIMARY KEY, 
        LONGITUDE REAL NOT NULL, 
        LATITUDE REAL NOT NULL,  
        LOCATIONTYPE VARCHAR(255), 
        DISTRICTNAME VARCHAR(255)
    )`);
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowCredentials: true,
        allowHeaders: ["*"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
}

service /api on new http:Listener(9090) {
    final sql:Client dbClient;

    function init() returns error? {
        // Initialize MySQL JDBC client with AWS RDS MySQL details
        self.dbClient = check new jdbc:Client(jdbcUrl, username, password);
        check initDatabase(self.dbClient); // Ensure the table is created
    }

    resource function post locations(NewLocation newLocation) returns LocationAdded|error {
        sql:ExecutionResult result = check self.dbClient->execute(`
            INSERT INTO LOCATIONS (LONGITUDE, LATITUDE, LOCATIONTYPE, DISTRICTNAME) 
            VALUES (${newLocation.longitude}, ${newLocation.latitude}, ${newLocation.locationType}, ${newLocation.districtName})
        `);
        int|string? locId = result.lastInsertId;
        if locId is int {
            Location location = {locId: locId, ...newLocation};
            return {body: location};
        }
        return error("Error occurred while retrieving the location id");
    }

    resource function get locations/[int locId]() returns Location|http:NotFound {
        Location|error location = self.dbClient->queryRow(`SELECT * FROM LOCATIONS WHERE LOCID = ${locId}`);
        if location is Location {
            return location;
        }
        return http:NOT_FOUND;
    }

    resource function delete locations/[int locId]() returns http:NoContent|error {
        _ = check self.dbClient->execute(`DELETE FROM LOCATIONS WHERE LOCID = ${locId}`);
        return http:NO_CONTENT;
    }

    // New resource function to get all locations
    resource function get locations() returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`SELECT * FROM LOCATIONS`);
        return from Location location in locationStream
            select location;
    }

    // New resource function to filter locations by district name
    resource function get locations/byDistrict(string districtName) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`SELECT * FROM LOCATIONS WHERE DISTRICTNAME = ${districtName}`);
        return from Location location in locationStream
            select location;
    }

    // New resource function to filter locations by location type
    resource function get locations/byType(string locationType) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`SELECT * FROM LOCATIONS WHERE LOCATIONTYPE = ${locationType}`);
        return from Location location in locationStream
            select location;
    }

    // New resource function to filter locations by both district name and location type
    resource function get locations/byDistrictAndType(string districtName, string locationType) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`
        SELECT * FROM LOCATIONS WHERE DISTRICTNAME = ${districtName} AND LOCATIONTYPE = ${locationType}
    `);
        return from Location location in locationStream
            select location;
    }

}
