import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/mime;
import ballerinax/aws.s3;
import ballerinax/openai.audio;

// Configuration for AWS S3 and OpenAI
configurable string accessKeyId = ?;
configurable string secretAccessKey = ?;
configurable string region = ?;
configurable string bucketName = ?;
configurable string openAIToken = ?;
configurable int port = 8080;

// AWS S3 client configuration
s3:ConnectionConfig amazonS3Config = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
};

// Initialize S3 client
s3:Client amazonS3Client = check new (amazonS3Config);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["*"],
        allowCredentials: false,
        allowHeaders: ["Content-Type"],
        allowMethods: ["POST", "GET", "OPTIONS"]
    }
}
service / on new http:Listener(port) {
    // File upload handler
    resource function post upload(http:Request req) returns http:Response|error {
        log:printInfo("Received upload request");
        http:Response response = new;
        
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        mime:Entity[]|http:ClientError bodyParts = req.getBodyParts();
        if (bodyParts is mime:Entity[]) {
            string username = "";
            byte[] fileContent = [];
            string fileName = "";
            
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

            if (username == "") {
                response.statusCode = 400;
                response.setTextPayload("Username is required");
                return response;
            }

            if (fileContent.length() == 0) {
                response.statusCode = 400;
                response.setTextPayload("No file content found");
                return response;
            }

            string uniqueFileName = username + "/" + fileName;
            log:printInfo(string `Attempting to upload file: ${uniqueFileName} for user: ${username}`);

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

    // S3 Objects Retrieval Handler
    resource function get s3objects/[string username]() returns error|http:Response {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        var listObjectsResponse = amazonS3Client->listObjects(bucketName, prefix = username);
        if (listObjectsResponse is s3:S3Object[]) {
            json[] objects = [];
            foreach var s3Object in listObjectsResponse {
                objects.push({
                    name: s3Object.objectName,
                    size: s3Object.objectSize
                });
            }
            response.setJsonPayload(objects);
            return response;
        } else {
            log:printError("Error: " + listObjectsResponse.toString());
            return error("Failed to retrieve S3 objects");
        }
    }

    // Audio transcription handler
    resource function post transcribe/audio(http:Request request) returns json|error {
        mime:Entity[] bodyParts = check request.getBodyParts();
        if bodyParts.length() == 0 {
            return error("No file uploaded");
        }

        mime:Entity audioPart = bodyParts[0];
        byte[] audioBytes = check audioPart.getByteArray();
        string? contentType = audioPart.getContentType();
        
        mime:ContentDisposition contentDisposition = audioPart.getContentDisposition();
        string fileName = contentDisposition.fileName is string ? contentDisposition.fileName : "audio.webm";

        if contentType is string {
            if !contentType.startsWith("audio/") {
                return error("Invalid content type. Expected audio file.");
            }
        } else {
            return error("Content type not specified");
        }

        audio:CreateTranscriptionRequest transcriptionReq = {
            file: {fileContent: audioBytes, fileName: fileName},
            model: "whisper-1"
        };

        audio:Client openAIAudio = check new ({auth: {token: openAIToken}});
        audio:CreateTranscriptionResponse|error transcriptionRes = openAIAudio->/audio/transcriptions.post(transcriptionReq);

        if transcriptionRes is error {
            return error("Error in transcription: " + transcriptionRes.message());
        }

        return {transcription: transcriptionRes.text};
    }

    // File download handler
    resource function get download/[string username]/[string filename](http:Request req) returns http:Response|error {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        string objectPath = username + "/" + filename;
        log:printInfo(string `Attempting to download file: ${objectPath}`);

        var getObjectResponse = amazonS3Client->getObject(bucketName, objectPath);
        if (getObjectResponse is stream<byte[], io:Error?>) {
            byte[] fileContent = [];
            var result = getObjectResponse.forEach(function(byte[] chunk) {
                fileContent.push(...chunk);
            });

            if (result is error) {
                log:printError("Error reading file stream", result);
                response.statusCode = 500;
                response.setTextPayload("Error downloading file: " + result.message());
                return response;
            }

            response.setHeader("Content-Type", "application/octet-stream");
            response.setHeader("Content-Disposition", string `attachment; filename="${filename}"`);
            response.setBinaryPayload(fileContent);
            return response;
        } else {
            log:printError("Error getting object from S3", getObjectResponse);
            response.statusCode = 404;
            response.setTextPayload("File not found or error accessing file");
            return response;
        }
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