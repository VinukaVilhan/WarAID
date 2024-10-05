import React, { useState, useRef, useEffect } from "react";
import {
    Mic,
    MicOff,
    Loader,
    Upload,
    Download,
    Trash2,
    Image,
    Music,
    Video,
    File,
    FileArchive,
    FileText,
} from "lucide-react";
import { useAuthContext } from "@asgardeo/auth-react";

function DocumentationTool() {
    const { state, signIn } = useAuthContext();
    const username = state.username || "anonymous";
    const isAuthenticated = state.isAuthenticated;

    // State for audio recording and transcription
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState("");
    const [transcription, setTranscription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // State for file uploading
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");
    const [isUploadingTranscription, setIsUploadingTranscription] =
        useState(false);
    const [transcriptionUploadStatus, setTranscriptionUploadStatus] =
        useState("");

    // State for S3 objects
    const [s3Objects, setS3Objects] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    // Add new state for delete operation
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteStatus, setDeleteStatus] = useState("");

    // Fetch S3 objects for the current user
    const fetchS3Objects = async () => {
        if (!username) return;

        try {
            const response = await fetch(
                `http://localhost:8080/s3objects/${encodeURIComponent(
                    username
                )}`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setS3Objects(data);
        } catch (error) {
            console.error("Error fetching S3 objects:", error);
            setErrorMessage(`Error fetching S3 objects: ${error.message}`);
        }
    };

    // Fetch objects when username changes
    useEffect(() => {
        if (username && isAuthenticated) {
            fetchS3Objects();
        }
    }, [username, isAuthenticated]);

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
            await fetchS3Objects(); // Refresh the file list
        } catch (error) {
            console.error("Error uploading transcription:", error);
            setTranscriptionUploadStatus(
                `Error uploading transcription: ${error.message}`
            );
        } finally {
            setIsUploadingTranscription(false);
        }
    };

    // File upload functions
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setUploadStatus(""); // Clear previous status
    };

    const uploadFile = async () => {
        if (!file) {
            setUploadStatus("Please select a file first.");
            return;
        }

        setIsUploading(true);
        setUploadStatus("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("username", username);

        try {
            const response = await fetch("http://localhost:8080/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                );
            }

            const result = await response.text();
            setUploadStatus(result);
            await fetchS3Objects(); // Refresh the file list
            setFile(null); // Clear the file input

            // Reset the file input element
            const fileInput = document.querySelector('input[type="file"]');
            if (fileInput) {
                fileInput.value = "";
            }
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus(`Error uploading file: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const downloadFile = async (fileName) => {
        try {
            const response = await fetch(
                `http://localhost:8080/download/${fileName}`,
                { method: "GET" }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Get the blob from the response
            const blob = await response.blob();

            // Create a temporary URL for the blob
            const url = window.URL.createObjectURL(blob);

            // Create a temporary anchor element
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName.split("/").pop(); // Get just the filename without the path

            // Append to document, click, and cleanup
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Error downloading file:", error);
            setErrorMessage(`Error downloading file: ${error.message}`);
        }
    };

    // File deletion function
    const deleteFile = async (fileName) => {
        if (!confirm(`Are you sure you want to delete ${fileName}?`)) {
            return;
        }

        setIsDeleting(true);
        setDeleteStatus("");

        try {
            const response = await fetch(
                `http://localhost:8080/delete/${encodeURIComponent(
                    username
                )}/${encodeURIComponent(fileName)}`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();
            setDeleteStatus(result);
            await fetchS3Objects(); // Refresh the file list
        } catch (error) {
            console.error("Error deleting file:", error);
            setDeleteStatus(`Error deleting file: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    // Utility function to return appropriate icon based on file extension
    function getFileIcon(fileName) {
        const extension = fileName.split(".").pop().toLowerCase();

        switch (extension) {
            case "txt":
                return FileText;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return Image;
            case "mp3":
            case "wav":
                return Music;
            case "mp4":
            case "avi":
            case "mov":
                return Video;
            case "zip":
            case "rar":
            case "7z":
                return FileArchive;
            case "pdf":
                return FileText;
            default:
                return File; // Default file icon
        }
    }

    // If not authenticated, show login button
    if (!isAuthenticated) {
        return (
            <div className="max-w-2xl mx-auto my-4 p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    You need to log in to use the documentation tool
                </h2>
                <button
                    onClick={() => signIn()}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-300"
                >
                    Log in
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto my-4 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Documentation Tool
            </h2>

            {/* Audio Recording Section */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    Audio Recording & Transcription
                </h3>
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <button
                            onClick={
                                isRecording ? stopRecording : startRecording
                            }
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

            {/* File Upload Section */}
            <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    File Upload
                </h3>
                <div className="space-y-4">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                    <button
                        onClick={uploadFile}
                        disabled={isUploading || !file}
                        className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                            isUploading || !file
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                        } transition duration-300`}
                        aria-label="Upload File"
                    >
                        {isUploading ? (
                            <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                Upload File
                            </>
                        )}
                    </button>
                    {uploadStatus && (
                        <p className="mt-2 text-gray-600">{uploadStatus}</p>
                    )}
                </div>
            </div>

            {/* S3 Objects Section */}
            <div>
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                    Your Files
                </h3>
                {errorMessage && (
                    <div className="bg-red-100 border border-red-400 text-red-700 p-2 rounded mb-4">
                        {errorMessage}
                    </div>
                )}
                {deleteStatus && (
                    <div className="bg-green-100 border border-green-400 text-green-700 p-2 rounded mb-4">
                        {deleteStatus}
                    </div>
                )}
                {s3Objects.length > 0 ? (
                    <div className="overflow-x-auto">
                        <ul className="space-y-4">
                            {s3Objects.map((object, index) => {
                                const IconComponent = getFileIcon(object.name);

                                return (
                                    <li
                                        key={object.name}
                                        className={`flex justify-between items-center p-4 border rounded-lg ${
                                            index % 2 === 0
                                                ? "bg-white"
                                                : "bg-gray-50"
                                        }`}
                                    >
                                        <div className="flex items-center space-x-4 flex-1">
                                            {/* Render the file icon */}
                                            <IconComponent className="w-6 h-6 text-gray-500" />

                                            <span className="font-medium">
                                                {object.name.split("/").pop()}
                                            </span>
                                            <span className="text-gray-500 text-sm ml-2">
                                                {formatFileSize(object.size)}
                                            </span>
                                        </div>
                                        <div className="flex space-x-2">
                                            {/* Download button */}
                                            <button
                                                onClick={() =>
                                                    downloadFile(object.name)
                                                }
                                                className="flex items-center space-x-1 p-2 text-green-600 hover:text-green-800 border border-green-600 rounded-lg"
                                                title="Download file"
                                                aria-label={`Download ${object.name}`}
                                            >
                                                <Download className="w-5 h-5" />
                                                <span>Download</span>
                                            </button>
                                            {/* Delete button */}
                                            <button
                                                onClick={() =>
                                                    deleteFile(object.name)
                                                }
                                                className="flex items-center space-x-1 p-2 text-red-600 hover:text-red-800 border border-red-600 rounded-lg"
                                                title="Delete file"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <Loader className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-5 h-5" />
                                                )}
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ) : (
                    <p className="text-gray-600">No files uploaded yet.</p>
                )}
            </div>
        </div>
    );
}

// Utility function to format file sizes
function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default DocumentationTool;
