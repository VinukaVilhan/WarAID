import ballerina/http;
import ballerina/jwt;
import ballerina/log;

// Updated JWT Validator configuration
jwt:ListenerJwtAuthProvider jwtValidator = new({
    issuer: "https://api.asgardeo.io/t/dana/oauth2/token",  // Updated issuer
    audience: "h14EPNFXyNu73kfxGTk_bEcgjfUa", // Your client ID
    signatureConfig: {
        jwksConfig: {
            url: "https://api.asgardeo.io/t/dana/oauth2/jwks"
        }
    }
});

listener http:Listener securedEP = new(8060);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowCredentials: true,
        allowHeaders: ["Authorization", "Content-Type"],
        allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        exposeHeaders: ["Content-Length", "Content-Type"]
    }
}
service /secured on securedEP {
    resource function get admin(http:Request req) returns http:Response|error {
        log:printInfo("Received request to /secured/admin");
        
        string|error authHeader = req.getHeader("Authorization");
        if authHeader is error {
            log:printError("Missing Authorization header");
            return createResponse(400, "Missing Authorization header");
        }

        log:printInfo("Authorization header: " + authHeader);

        if !authHeader.startsWith("Bearer ") {
            log:printError("Invalid Authorization header format");
            return createResponse(400, "Invalid Authorization header format");
        }

        string token = authHeader.substring(7);
        log:printInfo("Extracted token: " + token);

        var validationResult = jwtValidator.authenticate(token);

        if validationResult is jwt:Payload {
            log:printInfo("Token validation successful");
            return createResponse(200, "Authorized as Admin");
        } else {
            log:printError("Token validation failed: " + validationResult.toString());
            return createResponse(401, "Unauthorized");
        }
    }
}

function createResponse(int statusCode, string payload) returns http:Response {
    http:Response res = new;
    res.statusCode = statusCode;
    res.setTextPayload(payload);
    return res;
}