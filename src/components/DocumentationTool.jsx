import React, { useState, useEffect } from "react";
import {
    Loader,
    Upload,
    Download,
    Trash2,
    Image as ImageIcon,
    Music,
    Video,
    File,
    FileArchive,
    FileText,
} from "lucide-react";
import { useAuthContext } from "@asgardeo/auth-react";
import AudioTranscription from "./AudioTranscription"; // Ensure this component exists
import Modal from "react-modal";

// Set the app element for accessibility (screen readers)
Modal.setAppElement("#root");

function DocumentationTool() {
    const { state, signIn } = useAuthContext();
    const username = state.sub || "anonymous";
    const isAuthenticated = state.isAuthenticated;

    // State for file uploading
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

    // State for S3 objects
    const [s3Objects, setS3Objects] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");

    // State for delete operation
    const [isDeleting, setIsDeleting] = useState({});
    const [deleteStatus, setDeleteStatus] = useState("");

    // State for modal
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState("");

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

    // Fetch objects when username or authentication status changes
    useEffect(() => {
        if (username && isAuthenticated) {
            fetchS3Objects();
        }
    }, [username, isAuthenticated]);

    // Handle file selection
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
        setUploadStatus(""); // Clear previous status
    };

    // Upload file to S3 via Ballerina server
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

    // Download file from S3 via Ballerina server
    const downloadFile = async (fileName) => {
        try {
            const response = await fetch(
                `http://localhost:8080/download/${encodeURIComponent(
                    username
                )}/${encodeURIComponent(fileName)}`,
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

    // Delete file from S3 via Ballerina server
    const deleteFile = async (fileName) => {
        if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) {
            return;
        }

        setIsDeleting((prev) => ({ ...prev, [fileName]: true })); // Set specific file as deleting
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
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                );
            }

            let result = "";
            await response.text();
            if (response.status === 200) {
                result = "File deleted successfully";
            } else {
                result = "File deletion failed";
            }

            setDeleteStatus(result);
            await fetchS3Objects(); // Refresh the file list
        } catch (error) {
            console.error("Error deleting file:", error);
            setDeleteStatus(`Error deleting file: ${error.message}`);
        } finally {
            setIsDeleting((prev) => ({ ...prev, [fileName]: false })); // Reset specific file
        }
    };

    // Determine appropriate icon based on file extension
    function getFileIcon(fileName) {
        const extension = fileName.split(".").pop().toLowerCase();

        switch (extension) {
            case "txt":
                return FileText;
            case "jpg":
            case "jpeg":
            case "png":
            case "gif":
                return ImageIcon;
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

    // Check if the file is an image
    function isImageFile(fileName) {
        const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp"];
        const extension = fileName.split(".").pop().toLowerCase();
        return imageExtensions.includes(extension);
    }

    // Open modal with the image source
    const openModal = (src) => {
        setModalImageSrc(src);
        setModalIsOpen(true);
    };

    // Close the modal
    const closeModal = () => {
        setModalIsOpen(false);
        setModalImageSrc("");
    };

    // Format file size for display
    function formatFileSize(bytes) {
        if (bytes === 0) return "0 Bytes";

        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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

            {/* Audio Recording & Transcription Section */}
            <AudioTranscription
                username={username}
                onUploadTranscription={fetchS3Objects}
            />

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
                                const isImage = isImageFile(object.name);

                                return (
                                    <li
                                        key={object.name}
                                        className={`flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg ${
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
                                        {isImage && (
                                            <div className="mt-4 md:mt-0">
                                                <img
                                                    src={`http://localhost:8080/view/${encodeURIComponent(
                                                        username
                                                    )}/${encodeURIComponent(
                                                        object.name
                                                            .split("/")
                                                            .pop()
                                                    )}`}
                                                    alt={object.name}
                                                    className="w-32 h-32 object-cover rounded-md shadow cursor-pointer mr-4"
                                                    loading="lazy"
                                                    onClick={() =>
                                                        openModal(
                                                            `http://localhost:8080/view/${encodeURIComponent(
                                                                username
                                                            )}/${encodeURIComponent(
                                                                object.name
                                                                    .split("/")
                                                                    .pop()
                                                            )}`
                                                        )
                                                    }
                                                />
                                            </div>
                                        )}
                                        <div className="flex space-x-2 mt-4 md:mt-0">
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
                                                disabled={
                                                    isDeleting[object.name]
                                                } // Check if specific file is deleting
                                            >
                                                {isDeleting[object.name] ? (
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

            {/* Modal for Image Preview */}
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Image Preview"
                className="fixed inset-0 flex items-center justify-center p-4"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
            >
                <div className="relative bg-white rounded-lg shadow-lg p-4 max-w-full max-h-full overflow-auto">
                    <button
                        onClick={closeModal}
                        className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-2 focus:outline-none"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                    {modalImageSrc && (
                        <img
                            src={modalImageSrc}
                            alt="Preview"
                            className="max-w-full max-h-screen object-contain mx-auto"
                        />
                    )}
                </div>
            </Modal>
        </div>
    );
}

export default DocumentationTool;
