import ballerina/http;

configurable string openaiEndpointUrl = ?;
configurable string openaiDeploymentName = ?;
configurable string openaiApiKey = ?;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowCredentials: false,
        allowHeaders: ["Content-Type", "Authorization"],
        allowMethods: ["POST", "OPTIONS"],
        maxAge: 84900
    }
}
service /chatbot on new http:Listener(8080) {
    resource function post chat(@http:Payload json userMessage) returns json|error {
        http:Client openAIClient = check new (openaiEndpointUrl);

        json payload = {
            "messages": [
                {"role": "system", "content": "You are a helpful assistant who is an expert in First Aid in war environments. Always give the answers in a organized manner."}, 
                {"role": "user", "content": check userMessage.content}
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
            return responsePayload;
        } else {
            return error("Error: " + res.statusCode.toString() + " - " + res.reasonPhrase);
        }
    }
}