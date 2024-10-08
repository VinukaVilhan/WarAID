// AudioTranscription.js
import React, { useState, useRef } from "react";
import {
    Mic,
    MicOff,
    Loader,
    FileText,
} from "lucide-react";

function AudioTranscription({ username, onUploadTranscription }) {
    // State for audio recording and transcription
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    const [transcription, setTranscription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // State for transcription uploading
    const [isUploadingTranscription, setIsUploadingTranscription] = useState(false);
    const [transcriptionUploadStatus, setTranscriptionUploadStatus] = useState("");

    // Audio recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, {
                    type: "audio/webm",
                });
                const audioUrl = URL.createObjectURL(audioBlob);
                setAudioURL(audioUrl);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            alert("Unable to access microphone. Please check your permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const sendAudioForTranscription = async () => {
        if (audioChunksRef.current.length === 0) return;

        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("audio", audioBlob, "audio.webm");
        formData.append("username", username);

        try {
            const response = await fetch(
                "http://localhost:8080/transcribe/audio",
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTranscription(data.transcription);
        } catch (error) {
            console.error("Error sending audio for transcription:", error);
            setTranscription("Error transcribing audio. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const uploadTranscription = async () => {
        if (!transcription) {
            setTranscriptionUploadStatus("No transcription to upload.");
            return;
        }

        setIsUploadingTranscription(true);
        setTranscriptionUploadStatus("");

        const formData = new FormData();
        formData.append(
            "file",
            new Blob([transcription], { type: "text/plain" }),
            "transcription.txt"
        );
        formData.append("username", username);

        try {
            const response = await fetch("http://localhost:8080/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            setTranscriptionUploadStatus(result);
            setTranscription(""); // Clear transcription after successful upload
            onUploadTranscription(); // Notify parent to refresh S3 objects
        } catch (error) {
            console.error("Error uploading transcription:", error);
            setTranscriptionUploadStatus(
                `Error uploading transcription: ${error.message}`
            );
        } finally {
            setIsUploadingTranscription(false);
        }
    };

    return (
        <div className="mb-8">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">
                Audio Recording & Transcription
            </h3>
            <div className="space-y-4">
                <div className="flex space-x-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                            isRecording
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-blue-500 hover:bg-blue-600"
                        } transition duration-300`}
                        aria-label={
                            isRecording
                                ? "Stop Recording"
                                : "Start Recording"
                        }
                    >
                        {isRecording ? (
                            <>
                                <MicOff className="w-5 h-5 mr-2" />
                                Stop Recording
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5 mr-2" />
                                Start Recording
                            </>
                        )}
                    </button>

                    <button
                        onClick={sendAudioForTranscription}
                        disabled={!audioURL || isLoading}
                        className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                            !audioURL || isLoading
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                        } transition duration-300`}
                        aria-label="Transcribe Audio"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Transcribe Audio
                    </button>
                </div>

                {audioURL && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold mb-2 text-gray-700">
                            Recorded Audio:
                        </h4>
                        <audio src={audioURL} controls className="w-full" />
                    </div>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center space-x-2 text-blue-500">
                        <Loader className="w-6 h-6 animate-spin" />
                        <p className="text-lg">Transcribing audio...</p>
                    </div>
                )}

                {transcription && (
                    <div className="mt-4">
                        <h4 className="text-lg font-semibold mb-2 text-gray-700">
                            Transcription:
                        </h4>
                        <p className="border border-gray-300 p-4 rounded-md bg-gray-50">
                            {transcription}
                        </p>
                        <button
                            onClick={uploadTranscription}
                            disabled={isUploadingTranscription}
                            className={`mt-4 flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                                isUploadingTranscription
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600"
                            } transition duration-300`}
                            aria-label="Upload Transcription"
                        >
                            {isUploadingTranscription ? (
                                <Loader className="w-5 h-5 animate-spin" />
                            ) : (
                                "Upload Transcription"
                            )}
                        </button>
                        {transcriptionUploadStatus && (
                            <p className="mt-2 text-gray-600">
                                {transcriptionUploadStatus}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AudioTranscription;
