import ballerina/http;
import ballerina/log;

configurable string apiKey = ?;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"]
    }
}
service / on new http:Listener(8060) {
    resource function get news() returns json|error {
        log:printInfo("Received request for WarAID news");
        
        // Create a new HTTP client
        http:Client newsApiClient = check new("https://newsapi.org", timeout = 60);

        // Define the headers as a map
        map<string> headers = { "X-Api-Key": apiKey };

        string queryParams = "/v2/everything?q=(Israel+OR+Hamas+OR+Gaza+OR+Palestinian+OR+war+OR+conflict+OR+humanitarian+OR+ceasefire+OR+refugees)&sortBy=relevance&pageSize=100&sources=bbc-news,cnn,al-jazeera-english,axios,reuters,nbc-news,the-new-york-times,the-guardian,associated-press,forbes,financial-times,newsweek,huffpost,the-washington-post,national-geographic,latimes,politico,bloomberg,cbs-news,sky-news,the-wall-street-journal,dailymail,independent,voa-news,the-economist,the-hill,fortune,buzzfeed,npr,the-hindu,indian-express";

        log:printInfo("Sending request to NewsAPI");
        
        // Send a GET request with headers
        http:Response|error response = newsApiClient->get(queryParams, headers);

        if (response is error) {
            log:printError("Error calling NewsAPI", 'error = response);
            return error("Failed to fetch news: " + response.message());
        }

        // Check if the response is OK (status code 200)
        if (response.statusCode == 200) {
            log:printInfo("Received successful response from NewsAPI");
            // Get the JSON data from the response
            json|error jsonResponse = response.getJsonPayload();
            if (jsonResponse is error) {
                log:printError("Error parsing JSON response", 'error = jsonResponse);
                return error("Failed to parse news data");
            }
            return jsonResponse;
        } else {
            log:printError("HTTP error from NewsAPI", statusCode = response.statusCode);
            return error("Failed to fetch news: HTTP " + response.statusCode.toString());
        }
    }
}