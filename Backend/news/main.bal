import ballerina/http;
import ballerina/log;

configurable string apiKey = ?;

public function main() returns error? {

    // Create a new HTTP client
    http:Client newsApiClient = check new("https://api.worldnewsapi.com");

    // Define the headers as a map
    map<string> headers = { "x-api-key": apiKey };

    // Send a GET request with headers
    http:Response response = check newsApiClient->get("/search-news?text=earth+quake&language=en&earliest-publish-date=2024-04-01", headers);

    // Check if the response is OK (status code 200)
    if (response.statusCode == 200) {
        // Get the JSON data from the response
        json jsonResponse = check response.getJsonPayload();
        log:printInfo("News Data: " + jsonResponse.toString());
    } else {
        log:printError("HTTP error! Status: " + response.statusCode.toString());
    }
}
