import ballerina/http;
import ballerina/sql;
import ballerinax/java.jdbc;
import ballerinax/mysql.driver as _; 

// MySQL database connection 
configurable string host = ?;
configurable string port = ?;
configurable string username = ?;
configurable string password = ?;
configurable string database = ?;
// MySQL JDBC URL 
string jdbcUrl = string `jdbc:mysql://${host}:${port}/${database}`;

function initDatabase(sql:Client dbClient) returns error? {
    _ = check dbClient->execute(`CREATE TABLE IF NOT EXISTS LOCATIONS (
        LOCID INT AUTO_INCREMENT PRIMARY KEY, 
        LONGITUDE REAL NOT NULL, 
        LATITUDE REAL NOT NULL,  
        LOCATIONTYPE VARCHAR(255), 
        DISTRICTNAME VARCHAR(255),
        COUNTRYNAME VARCHAR(255)
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
        // Initialize MySQL JDBC client with AWS RDS MySQL details
        self.dbClient = check new jdbc:Client(jdbcUrl, username, password);
        check initDatabase(self.dbClient); // Ensure the table is created
    }

    resource function post locations(@http:Payload NewLocation newLocation) returns LocationAdded|error {
        sql:ExecutionResult result = check self.dbClient->execute(`
            INSERT INTO LOCATIONS (LONGITUDE, LATITUDE, LOCATIONTYPE, DISTRICTNAME, COUNTRYNAME) 
            VALUES (${newLocation.longitude}, ${newLocation.latitude}, ${newLocation.locationType}, ${newLocation.districtName},${newLocation.countryName})
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

    resource function delete locations/[int locId]() returns http:Ok|error {
        sql:ExecutionResult result = check self.dbClient->execute(`DELETE FROM LOCATIONS WHERE LOCID = ${locId}`);
        if result.affectedRowCount > 0 {
            return http:OK;
        }
        return error("Error occurred while deleting the location");
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

    resource function get locations/byCountry(string countryName) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`SELECT * FROM LOCATIONS WHERE COUNTRYNAME = ${countryName}`);
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
    resource function get locations/byCountryAndDistrict(string countryName, string districtName) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`
        SELECT * FROM LOCATIONS WHERE COUNTRYNAME = ${countryName} AND DISTRICTNAME = ${districtName} 
    `);
        return from Location location in locationStream
            select location;
    }

    resource function get locations/byCountryAndType(string countryName, string locationType) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`
        SELECT * FROM LOCATIONS WHERE COUNTRYNAME = ${countryName} AND LOCATIONTYPE = ${locationType} 
    `);
        return from Location location in locationStream
            select location;
    }

    resource function get locations/byCountryAndDistrictAndType(string countryName, string districtName, string locationType) returns Location[]|error {
        stream<Location, sql:Error?> locationStream = self.dbClient->query(`
        SELECT * FROM LOCATIONS WHERE COUNTRYNAME = ${countryName} AND DISTRICTNAME = ${districtName} AND LOCATIONTYPE = ${locationType} 
    `);
        return from Location location in locationStream
            select location;
    }

    // New endpoint to get districts by country
    resource function get districts/byCountry(string countryName) returns string[]|error {
        stream<record { string DISTRICTNAME; }, sql:Error?> districtStream = self.dbClient->query(`
            SELECT DISTINCT DISTRICTNAME 
            FROM LOCATIONS 
            WHERE COUNTRYNAME = ${countryName}
            ORDER BY DISTRICTNAME
        `);
        
        string[] districts = [];
        check from record { string DISTRICTNAME; } district in districtStream
            do {
                districts.push(district.DISTRICTNAME);
            };
        return districts;
    }


}