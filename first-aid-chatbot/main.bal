import ballerina/http;
import ballerina/log;

final string GOOGLE_API_KEY = "AIzaSyD785AjidwGdXkvMxlbMPjoCd0y--9I5Q0"; // Replace with your actual API key

http:Client googleApiClient = check new("https://generativelanguage.googleapis.com");

service /chatbot on new http:Listener(8080) {

    // Add an OPTIONS resource to handle preflight CORS requests
    resource function options generateContent(http:Caller caller, http:Request req) returns error? {
        http:Response res = new;
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        check caller->respond(res);
    }

    // Main resource to handle POST requests
    resource function post generateContent(http:Caller caller, http:Request req) returns error? {
        json|error input = req.getJsonPayload();
        if input is json {
            string query = input.toString();
            
            http:Request googleReq = new;
            googleReq.setPayload({
                "contents": [{
                    "parts": [{"text": query}]
                }]
            });
            googleReq.setHeader("Content-Type", "application/json");

            // Send the request to the Google API
            http:Response googleRes = check googleApiClient->post("/v1beta/models/gemini-1.5-flash-latest:generateContent?key=" + GOOGLE_API_KEY, googleReq);
            json googleData = check googleRes.getJsonPayload();

            // Log the response from the Google API for debugging
            log:printInfo("Google API Response: " + googleData.toString());

            // Prepare the response with CORS headers
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
            res.setPayload(googleData);
            check caller->respond(res);
        } else {
            http:Response res = new;
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setPayload({ message: "Invalid input" });
            check caller->respond(res);
        }
    }
}
