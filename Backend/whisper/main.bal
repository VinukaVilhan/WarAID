import ballerina/http;
import ballerina/mime;
import ballerinax/openai.audio;

configurable string openAIToken = ?;

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost:5173"],
        allowCredentials: false,
        allowHeaders: ["Content-Type"],
        allowMethods: ["POST", "OPTIONS"]
    }
}
service /transcribe on new http:Listener(8080) {
    resource function post audio(http:Request request) returns json|error {
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
}