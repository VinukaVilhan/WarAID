import ballerina/http;
import ballerina/io;
import ballerina/log;
import ballerina/mime;
import ballerinax/aws.s3;

configurable string accessKeyId = ?;
configurable string secretAccessKey = ?;
configurable string region = ?;
configurable string bucketName = ?;
configurable int port = 8080;

s3:ConnectionConfig amazonS3Config = {
    accessKeyId: accessKeyId,
    secretAccessKey: secretAccessKey,
    region: region
};

s3:Client amazonS3Client = check new (amazonS3Config);

service / on new http:Listener(port) {
    
    // This resource handles the file upload process.
    resource function post upload(http:Request req) returns http:Response|error {
        log:printInfo("Received upload request");
        
        http:Response response = new;
        
        // Extract body parts from the incoming multipart request
        mime:Entity[]|http:ClientError bodyParts = req.getBodyParts();
        if (bodyParts is mime:Entity[]) {
            foreach mime:Entity part in bodyParts {
                mime:ContentDisposition contentDisposition = part.getContentDisposition();
                if (contentDisposition.name == "file") {
                    byte[]|error fileContent = part.getByteArray();
                    if (fileContent is byte[]) {
                        // Extract the file name from the content disposition
                        string fileName = contentDisposition.fileName is string ? contentDisposition.fileName : "unnamed.txt";
                        log:printInfo(string `Attempting to upload file: ${fileName} to bucket: ${bucketName}`);
                        
                        // Attempt to upload the file to the S3 bucket
                        error? createObjectResponse = amazonS3Client->createObject(bucketName, fileName, fileContent);
                        if (createObjectResponse is error) {
                            log:printError("Error uploading file to S3", createObjectResponse);
                            response.statusCode = 500;
                            response.setTextPayload("Error uploading file: " + createObjectResponse.message());
                        } else {
                            log:printInfo(string `File '${fileName}' uploaded successfully to bucket '${bucketName}'`);
                            response.statusCode = 200;
                            response.setTextPayload("File uploaded successfully");
                        }
                        
                        // Set CORS headers to allow cross-origin requests
                        response.setHeader("Access-Control-Allow-Origin", "*");
                        response.setHeader("Access-Control-Allow-Methods", "POST");
                        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
                        
                        return response;
                    } else {
                        log:printError("Error reading file content", fileContent);
                        response.statusCode = 400;
                        response.setTextPayload("Error reading file content");
                        return response;
                    }
                }
            }
            response.statusCode = 400;
            response.setTextPayload("No file found in the request");
            return response;
        } else {
            response.statusCode = 400;
            response.setTextPayload("Error processing multipart request");
            return response;
        }
    }
}

public function main() returns error? {
    io:println("Server started on port: " + port.toString());
    io:println("Using S3 bucket: " + bucketName);
    io:println("AWS Region: " + region);
}
