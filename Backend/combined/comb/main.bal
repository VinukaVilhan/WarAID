// import ballerina/http;
// import ballerina/io;
// import ballerina/log;
// import ballerina/mime;
// import ballerinax/aws.s3;
// import ballerinax/openai.audio;

// // Configuration for AWS S3 and OpenAI
// configurable string accessKeyId = ?;
// configurable string secretAccessKey = ?;
// configurable string region = ?;
// configurable string bucketName = ?;
// configurable string openAIToken = ?;
// configurable int port = 8080;

// // AWS S3 client configuration
// s3:ConnectionConfig amazonS3Config = {
//     accessKeyId: accessKeyId,
//     secretAccessKey: secretAccessKey,
//     region: region
// };

// // Initialize S3 client
// s3:Client amazonS3Client = check new (amazonS3Config);

// @http:ServiceConfig {
//     cors: {
//         allowOrigins: ["*"],
//         allowCredentials: false,
//         allowHeaders: ["Content-Type"],
//         allowMethods: ["POST", "GET", "OPTIONS"]
//     }
// }

// service / on new http:Listener(port) {
//     // File upload handler
//     resource function post upload(http:Request req) returns http:Response|error {
//         log:printInfo("Received upload request");
//         http:Response response = new;
        
//         response.setHeader("Access-Control-Allow-Origin", "*");
//         response.setHeader("Access-Control-Allow-Methods", "POST");
//         response.setHeader("Access-Control-Allow-Headers", "Content-Type");

//         mime:Entity[]|http:ClientError bodyParts = req.getBodyParts();
//         if (bodyParts is mime:Entity[]) {
//             string username = "";
//             byte[] fileContent = [];
//             string fileName = "";
            
//             foreach mime:Entity part in bodyParts {
//                 mime:ContentDisposition contentDisposition = part.getContentDisposition();
                
//                 if (contentDisposition.name == "username") {
//                     byte[]|error usernameBytes = part.getByteArray();
//                     if (usernameBytes is byte[]) {
//                         username = check string:fromBytes(usernameBytes);
//                     }
//                 } else if (contentDisposition.name == "file") {
//                     byte[]|error content = part.getByteArray();
//                     if (content is byte[]) {
//                         fileContent = content;
//                         fileName = contentDisposition.fileName is string ? contentDisposition.fileName : "unnamed.txt";
//                     }
//                 }
//             }

//             if (username == "") {
//                 response.statusCode = 400;
//                 response.setTextPayload("Username is required");
//                 return response;
//             }

//             if (fileContent.length() == 0) {
//                 response.statusCode = 400;
//                 response.setTextPayload("No file content found");
//                 return response;
//             }

//             string uniqueFileName = username + "/" + fileName;
//             log:printInfo(string `Attempting to upload file: ${uniqueFileName} for user: ${username}`);

//             error? createObjectResponse = amazonS3Client->createObject(
//                 bucketName,
//                 uniqueFileName,
//                 fileContent
//             );

//             if (createObjectResponse is error) {
//                 log:printError("Error uploading file to S3", createObjectResponse);
//                 response.statusCode = 500;
//                 response.setTextPayload("Error uploading file: " + createObjectResponse.message());
//             } else {
//                 log:printInfo(string `File '${uniqueFileName}' uploaded successfully to bucket '${bucketName}'`);
//                 response.statusCode = 200;
//                 response.setTextPayload("File uploaded successfully");
//             }
            
//             return response;
//         }
        
//         response.statusCode = 400;
//         response.setTextPayload("Error processing multipart request");
//         return response;
//     }

//     // S3 Objects Retrieval Handler
//     resource function get s3objects/[string username]() returns error|http:Response {
//         http:Response response = new;
//         response.setHeader("Access-Control-Allow-Origin", "*");
//         response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//         response.setHeader("Access-Control-Allow-Headers", "Content-Type");

//         var listObjectsResponse = amazonS3Client->listObjects(bucketName, prefix = username);
//         if (listObjectsResponse is s3:S3Object[]) {
//             json[] objects = [];
//             foreach var s3Object in listObjectsResponse {
//                 objects.push({
//                     name: s3Object.objectName,
//                     size: s3Object.objectSize
//                 });
//             }
//             response.setJsonPayload(objects);
//             return response;
//         } else {
//             log:printError("Error: " + listObjectsResponse.toString());
//             return error("Failed to retrieve S3 objects");
//         }
//     }

//     // Audio transcription handler
//     resource function post transcribe/audio(http:Request request) returns json|error {
//         mime:Entity[] bodyParts = check request.getBodyParts();
//         if bodyParts.length() == 0 {
//             return error("No file uploaded");
//         }

//         mime:Entity audioPart = bodyParts[0];
//         byte[] audioBytes = check audioPart.getByteArray();
//         string? contentType = audioPart.getContentType();
        
//         mime:ContentDisposition contentDisposition = audioPart.getContentDisposition();
//         string fileName = contentDisposition.fileName is string ? contentDisposition.fileName : "audio.webm";

//         if contentType is string {
//             if !contentType.startsWith("audio/") {
//                 return error("Invalid content type. Expected audio file.");
//             }
//         } else {
//             return error("Content type not specified");
//         }

//         audio:CreateTranscriptionRequest transcriptionReq = {
//             file: {fileContent: audioBytes, fileName: fileName},
//             model: "whisper-1"
//         };

//         audio:Client openAIAudio = check new ({auth: {token: openAIToken}});
//         audio:CreateTranscriptionResponse|error transcriptionRes = openAIAudio->/audio/transcriptions.post(transcriptionReq);

//         if transcriptionRes is error {
//             return error("Error in transcription: " + transcriptionRes.message());
//         }

//         return {transcription: transcriptionRes.text};
//     }

//     // File download handler
//     resource function get download/[string username]/[string filename](http:Request req) returns http:Response|error {
//         http:Response response = new;
//         response.setHeader("Access-Control-Allow-Origin", "*");
//         response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//         response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
//         string objectPath = username + "/" + filename;
//         log:printInfo(string `Attempting to download file: ${objectPath}`);

//         var getObjectResponse = amazonS3Client->getObject(bucketName, objectPath);
//         if (getObjectResponse is stream<byte[], io:Error?>) {
//             byte[] fileContent = [];
//             var result = getObjectResponse.forEach(function(byte[] chunk) {
//                 fileContent.push(...chunk);
//             });

//             if (result is error) {
//                 log:printError("Error reading file stream", result);
//                 response.statusCode = 500;
//                 response.setTextPayload("Error downloading file: " + result.message());
//                 return response;
//             }

//             response.setHeader("Content-Type", "application/octet-stream");
//             response.setHeader("Content-Disposition", string `attachment; filename="${filename}"`);
//             response.setBinaryPayload(fileContent);
//             return response;
//         } else {
//             log:printError("Error getting object from S3", getObjectResponse);
//             response.statusCode = 404;
//             response.setTextPayload("File not found or error accessing file");
//             return response;
//         }
//     }

//     // New Resource: View Image
//     resource function get view/[string username]/[string filename](http:Request req) returns http:Response|error {
//         http:Response response = new;
//         // Optionally, set CORS headers if needed
//         response.setHeader("Access-Control-Allow-Origin", "*");
//         response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
//         response.setHeader("Access-Control-Allow-Headers", "Content-Type");

//         string objectPath = username + "/" + filename;
//         log:printInfo(string `Attempting to view file: ${objectPath}`);

//         var getObjectResponse = amazonS3Client->getObject(bucketName, objectPath);
//         if (getObjectResponse is stream<byte[], io:Error?>) {
//             byte[] fileContent = [];
//             var result = getObjectResponse.forEach(function(byte[] chunk) {
//                 fileContent.push(...chunk);
//             });

//             if (result is error) {
//                 log:printError("Error reading file stream", result);
//                 response.statusCode = 500;
//                 response.setTextPayload("Error viewing file: " + result.message());
//                 return response;
//             }

//             // Determine the Content-Type based on file extension
//             string contentType = "png";

//             response.setHeader("Content-Type", contentType);
//             // Do NOT set Content-Disposition for inline display
//             response.setBinaryPayload(fileContent);
//             return response;
//         } else {
//             log:printError("Error getting object content from S3", getObjectResponse);
//             response.statusCode = 500;
//             response.setTextPayload("Error accessing file content");
//             return response;
//         }
//     }
// }




// public function main() returns error? {
//     io:println("Starting server...");
//     io:println("Server configuration:");
//     io:println("- Port: " + port.toString());
//     io:println("- S3 Bucket: " + bucketName);
//     io:println("- AWS Region: " + region);
//     io:println("Server started successfully");
// }



import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/mime;
import ballerina/regex;
import ballerinax/aws.s3;
import ballerinax/openai.audio;
import ballerina/time;

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

// Define supported content types
final readonly & map<string> contentTypes = {
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "webp": "image/webp",
    "pdf": "application/pdf",
    "txt": "text/plain"
};

// @http:ServiceConfig {
//     cors: {
//         allowOrigins: ["http://localhost:5173"],
//         allowCredentials: false,
//         allowHeaders: ["Content-Type"],
//         allowMethods: ["POST", "GET", "OPTIONS"]
//     }
// }


@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"], // Add your frontend origin
        allowCredentials: false,
        allowHeaders: ["*"],  // Allow all headers
        allowMethods: ["GET", "POST", "DELETE", "OPTIONS", "HEAD"],
        exposeHeaders: ["*"]
    }
}


service / on new http:Listener(port) {
    private final s3:Client s3Client;
    private final audio:Client audioClient;

    function init() returns error? {
        self.s3Client = check new (amazonS3Config);
        self.audioClient = check new ({auth: {token: openAIToken}});
        log:printInfo("Service initialized successfully");
    }

    // Helper function to generate timestamp-based filename
    private function getCurrentTimestamp() returns string {
        time:Utc currentTime = time:utcNow();
        string timestamp = currentTime.toString();
        return timestamp;
    }

    // File upload handler
    resource function post upload(http:Request req) returns string|error {
        log:printInfo("Received upload request");
        http:Response response = new;
        
        // Set CORS headers
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

            // Validate input
            if (username == "") {
                response.statusCode = 400;
                response.setTextPayload("Username is required");
                return response.getTextPayload();
            }

            if (fileContent.length() == 0) {
                response.statusCode = 400;
                response.setTextPayload("No file content found");
                return response.getTextPayload();
            }

            string uniqueFileName = string `${username}/${fileName}`;
            log:printInfo(string `Attempting to upload file: ${uniqueFileName} for user: ${username}`);

            error? createObjectResponse = self.s3Client->createObject(
                bucketName,
                uniqueFileName,
                fileContent
            );

            if (createObjectResponse is error) {
                log:printError("Error uploading file to S3", createObjectResponse);
                response.statusCode = 500;
                response.setTextPayload("Error uploading file: " + createObjectResponse.message());
                return response.getTextPayload();
            }

            log:printInfo(string `File '${uniqueFileName}' uploaded successfully to bucket '${bucketName}'`);
            response.statusCode = 200;
            response.setTextPayload("File uploaded successfully");
            
            return response.getTextPayload();
        }
        
        response.statusCode = 400;
        response.setTextPayload("Error processing multipart request");
        return response.getTextPayload();
    }

    // S3 Objects Retrieval Handler
    resource function get s3objects/[string username]() returns http:Response|error {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        var listObjectsResponse = self.s3Client->listObjects(bucketName, prefix = username);
        if (listObjectsResponse is s3:S3Object[]) {
            json[] objects = from var obj in listObjectsResponse
                select {
                    name: obj.objectName,
                    size: obj.objectSize,
                    lastModified: obj.lastModified.toString()
                };
            
            response.setJsonPayload(objects);
            return response;
        }
        
        log:printError("Error listing objects", listObjectsResponse);
        response.statusCode = 500;
        response.setTextPayload("Failed to retrieve S3 objects");
        return response;
    }

    // Audio transcription handler
    resource function post transcribe/audio(http:Request request) returns http:Response|error {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");

        mime:Entity[] bodyParts = check request.getBodyParts();
        if bodyParts.length() == 0 {
            response.statusCode = 400;
            response.setTextPayload("No file uploaded");
            return response;
        }

        mime:Entity audioPart = bodyParts[0];
        byte[] audioBytes = check audioPart.getByteArray();
        string? contentType = audioPart.getContentType();
        
        mime:ContentDisposition contentDisposition = audioPart.getContentDisposition();
        string originalFileName = contentDisposition.fileName is string ? contentDisposition.fileName : "audio.webm";

        if contentType is string {
            if !contentType.startsWith("audio/") {
                response.statusCode = 400;
                response.setTextPayload("Invalid content type. Expected audio file.");
                return response;
            }
        } else {
            response.statusCode = 400;
            response.setTextPayload("Content type not specified");
            return response;
        }

        // Generate timestamp-based filename for transcription
        string timestamp = self.getCurrentTimestamp();
        string transcriptionFileName = timestamp + "-transcription.txt";

        audio:CreateTranscriptionRequest transcriptionReq = {
            file: {fileContent: audioBytes, fileName: originalFileName},
            model: "whisper-1"
        };

        audio:CreateTranscriptionResponse|error transcriptionRes = self.audioClient->/audio/transcriptions.post(transcriptionReq);

        if transcriptionRes is error {
            response.statusCode = 500;
            response.setTextPayload("Error in transcription: " + transcriptionRes.message());
            return response;
        }

        response.setJsonPayload({
            transcription: transcriptionRes.text,
            fileName: transcriptionFileName
        });
        return response;
    }

    // File download handler
    resource function get download/[string username]/[string filename](http:Request req) returns http:Response|error {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        string objectPath = filename;
        log:printInfo(string `Attempting to download file: ${objectPath}`);



        stream<byte[], io:Error?>|error downloadResponse = amazonS3Client->getObject(bucketName, objectPath);
        if (downloadResponse is error) {
            log:printError("Error downloading object: " + downloadResponse.toString());
        } else {
            log:printInfo("Successfully downloaded object to " + objectPath);
        }
        
        return response;
    }


    // File delete handler
    resource function delete delete/[string username]/[string filename](http:Request req) returns http:Response|error {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
        response.setHeader("Access-Control-Allow-Methods", "DELETE,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");

        string objectPath = string `${filename}`;

        log:printInfo(string `Attempting to delete file: ${objectPath}`);


        error? deleteObjectResponse = amazonS3Client->deleteObject(bucketName, objectPath);
        if (deleteObjectResponse is error) {
            log:printError("Error: " + deleteObjectResponse.toString());
        } else {
            log:printInfo("Successfully deleted object");
        }

        return response;
    }
    


    

    // View file handler (for images and PDFs)
    resource function get view/[string username]/[string filename](http:Request req) returns http:Response|error {
        http:Response response = new;
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        string objectPath = string `${username}/${filename}`;
        log:printInfo(string `Attempting to view file: ${objectPath}`);

        var getObjectResponse = self.s3Client->getObject(bucketName, objectPath);
        if (getObjectResponse is stream<byte[], io:Error?>) {
            byte[] fileContent = [];
            error? result = getObjectResponse.forEach(function(byte[] chunk) {
                fileContent.push(...chunk);
            });

            if (result is error) {
                log:printError("Error reading file stream", result);
                response.statusCode = 500;
                response.setTextPayload("Error viewing file: " + result.message());
                return response;
            }

            // Get file extension and determine content type
            string[] parts = regex:split(filename, "\\.");
            string extension = parts.length() > 1 ? parts[parts.length() - 1].toLowerAscii() : "";
            
            // Use a predefined contentTypes map, or fallback to "application/octet-stream"
            string contentType = contentTypes[extension] ?: "application/octet-stream";

            response.setHeader("Content-Type", contentType);
            response.setBinaryPayload(fileContent);
            return response;
        }
        
        log:printError("Error getting object from S3", getObjectResponse);
        response.statusCode = 404;
        response.setTextPayload("File not found or error accessing file");
        return response;
    }
}

public function main() returns error? {
    log:printInfo("Starting server...");
    log:printInfo(string `Server configuration:
    - Port: ${port}
    - S3 Bucket: ${bucketName}
    - AWS Region: ${region}
    Server started successfully`);


}