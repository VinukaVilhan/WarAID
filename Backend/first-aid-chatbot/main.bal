import ballerina/http;
import ballerina/io;

configurable string openaiEndpointUrl = ?;
configurable string openaiDeploymentName = ?;
configurable string openaiApiKey = ?;

public function main() returns error? {
    http:Client openAIClient = check new (openaiEndpointUrl);

    json payload = {
        "messages": [
            {"role": "system", "content": "You are a helpful assistant who is an expert in First Aid in war environments."}, 
            {"role": "user", "content": "How do I treat an arm injured by a shell bomb?"}
        ],
        "max_tokens": 800,
        "temperature": 0.7,
        "top_p": 0.95,
        "frequency_penalty": 0,
        "presence_penalty": 0,
        "stop": null
    };

    http:Request req = new;
    req.setHeader("api-key", openaiApiKey);
    req.setPayload(payload);

    string path = string `/openai/deployments/${openaiDeploymentName}/chat/completions?api-version=2024-05-01-preview`;
    
    http:Response res = check openAIClient->post(path, req);
    
    if (res.statusCode == 200) {
        json responsePayload = check res.getJsonPayload();
        io:println(responsePayload.toJsonString());
    } else {
        io:println("Error: ", res.statusCode, " - ", res.reasonPhrase);
    }
}