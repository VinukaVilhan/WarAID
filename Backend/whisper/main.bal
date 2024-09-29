import ballerina/io;
import ballerinax/openai.audio;

configurable string openAIToken = ?;
configurable string AUDIO_FILE_PATH = ?;

public function main() returns error? {
    // Creates a request to transcribe the audio file to text (English)
    audio:CreateTranscriptionRequest transcriptionReq = {
        file: {fileContent: check io:fileReadBytes(AUDIO_FILE_PATH), fileName: "lg.mp3"},
        model: "whisper-1"
    };

    // Transcribes the audio file to text (English)
    audio:Client openAIAudio = check new ({auth: {token: openAIToken}});
    audio:CreateTranscriptionResponse transcriptionRes = check openAIAudio->/audio/transcriptions.post(transcriptionReq);
    io:println("Transcribed text: ", transcriptionRes.text);
}