import ballerina/http;
import ballerina/log;

configurable string apiKey = ?;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service / on new http:Listener(8080) {
    resource function get news() returns json|error {
        log:printInfo("Received request for WarAID news");
        
        // Create a new HTTP client
        http:Client newsApiClient = check new("https://api.worldnewsapi.com", timeout = 30);

        // Define the headers as a map
        map<string> headers = { "x-api-key": apiKey };

        string queryParams = string `/search-news?
        text=(Israel+AND+Hamas)+OR+(Gaza+AND+war)+OR+(Palestinian+AND+conflict)+OR+(humanitarian+AND+crisis)
        &entities=
        &language=en
        &sort=publish-time
        &sort-direction=DESC
        &number=30`;

        log:printInfo("Sending request to World News API");
        
        // Send a GET request with headers
        http:Response|error response = newsApiClient->get(queryParams, headers);

        if (response is error) {
            log:printError("Error calling World News API", 'error = response);
            return error("Failed to fetch news: " + response.message());
        }

        // Check if the response is OK (status code 200)
        if (response.statusCode == 200) {
            log:printInfo("Received successful response from World News API");
            // Get the JSON data from the response
            json|error jsonResponse = response.getJsonPayload();
            if (jsonResponse is error) {
                log:printError("Error parsing JSON response", 'error = jsonResponse);
                return error("Failed to parse news data");
            }
            return jsonResponse;
        } else {
            log:printError("HTTP error from World News API", statusCode = response.statusCode);
            return error("Failed to fetch news: HTTP " + response.statusCode.toString());
        }
    }
}