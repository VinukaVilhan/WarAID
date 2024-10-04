import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/mime;
import ballerinax/aws.s3;

// Configuration for AWS S3 and server
configurable string accessKeyId = ?;
configurable string secretAccessKey = ?;
configurable string region = ?;
configurable string bucketName = ?;
configurable int port = 8080;

// AWS S3 client configuration
s3:ConnectionConfig amazonS3Config = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
};

// Initialize S3 client
s3:Client amazonS3Client = check new (amazonS3Config);

// Service definition
service / on new http:Listener(port) {
    // CORS preflight handler
    resource function options upload() returns http:Response {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return response;
    }

    // File upload handler
    resource function post upload(http:Request req) returns http:Response|error {
        log:printInfo("Received upload request");
        http:Response response = new;
        
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        // Handle multipart form data
        mime:Entity[]|http:ClientError bodyParts = req.getBodyParts();
        if (bodyParts is mime:Entity[]) {
            string username = "anonymous";
            byte[] fileContent = [];
            string fileName = "";
            
            // Process form parts
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition contentDisposition = part.getContentDisposition();
                
                if (contentDisposition.name == "username") {
                    byte[]|error usernameBytes = part.getByteArray();
                    if (usernameBytes is byte[]) {
                        username = check string:fromBytes(usernameBytes);
                    }
                } else if (contentDisposition.name == "file") {
                    byte[]|error content = part.getByteArray();
                    if (content is byte[]) {
                        fileContent = content;
                        fileName = contentDisposition.fileName is string ? contentDisposition.fileName : "unnamed.txt";
                    }
                }
            }

            if (fileContent.length() == 0) {
                response.statusCode = 400;
                response.setTextPayload("No file content found");
                return response;
            }

            // Create unique filename with username and timestamp
            string uniqueFileName = username + "/" + fileName;
            
            log:printInfo(string `Attempting to upload file: ${uniqueFileName} for user: ${username}`);

            // Upload to S3
            error? createObjectResponse = amazonS3Client->createObject(
                bucketName,
                uniqueFileName,
                fileContent
            );

            if (createObjectResponse is error) {
                log:printError("Error uploading file to S3", createObjectResponse);
                response.statusCode = 500;
                response.setTextPayload("Error uploading file: " + createObjectResponse.message());
            } else {
                log:printInfo(string `File '${uniqueFileName}' uploaded successfully to bucket '${bucketName}'`);
                response.statusCode = 200;
                response.setTextPayload("File uploaded successfully");
            }
            
            return response;
        }
        
        response.statusCode = 400;
        response.setTextPayload("Error processing multipart request");
        return response;
    }

    // Audio transcription handler
    resource function post transcribe/audio (http:Request req) returns http:Response|error {
        log:printInfo("Received audio transcription request");
        http:Response response = new;
        
        // Set CORS headers
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        mime:Entity[]|http:ClientError bodyParts = req.getBodyParts();
        if (bodyParts is mime:Entity[]) {
            string username = "anonymous";
            byte[] audioContent = [];
            
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition contentDisposition = part.getContentDisposition();
                
                if (contentDisposition.name == "username") {
                    byte[]|error usernameBytes = part.getByteArray();
                    if (usernameBytes is byte[]) {
                        username = check string:fromBytes(usernameBytes);
                    }
                } else if (contentDisposition.name == "audio") {
                    byte[]|error content = part.getByteArray();
                    if (content is byte[]) {
                        audioContent = content;
                    }
                }
            }

            if (audioContent.length() == 0) {
                response.statusCode = 400;
                response.setJsonPayload({
                });
                return response;
            }

            // Save audio file to S3
            string audioFileName = string `${username}/audio/_audio.webm`;
            
            error? createObjectResponse = amazonS3Client->createObject(
                bucketName,
                audioFileName,
                audioContent
            );

            if (createObjectResponse is error) {
                log:printError("Error uploading audio to S3", createObjectResponse);
                response.statusCode = 500;
                response.setJsonPayload({
                });
                return response;
            }

            // For now, return a placeholder response
            // In a real implementation, you would send the audio to a transcription service
            json transcriptionResponse = {
                transcription: "Audio transcription will be implemented here.",
                audioFile: audioFileName,
                username: username,
                status: "success"
            };
            
            response.setJsonPayload(transcriptionResponse);
            return response;
        }
        
        response.statusCode = 400;
        response.setJsonPayload({
        });
        return response;
    }

    // CORS preflight handler for audio transcription
    resource function options transcribe_audio() returns http:Response {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        return response;
    }
}

public function main() returns error? {
    io:println("Starting server...");
    io:println("Server configuration:");
    io:println("- Port: " + port.toString());
    io:println("- S3 Bucket: " + bucketName);
    io:println("- AWS Region: " + region);
    io:println("Server started successfully");
}