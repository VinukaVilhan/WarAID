// import React, { useState, useRef } from 'react';
// import { Mic, MicOff, FileText, Loader } from 'lucide-react';

// function DocumentationTool() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [audioURL, setAudioURL] = useState('');
//   const [transcription, setTranscription] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const mediaRecorderRef = useRef(null);
//   const audioChunksRef = useRef([]);

//   const startRecording = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//       mediaRecorderRef.current = new MediaRecorder(stream);
//       audioChunksRef.current = [];

//       mediaRecorderRef.current.ondataavailable = (event) => {
//         if (event.data.size > 0) {
//           audioChunksRef.current.push(event.data);
//         }
//       };

//       mediaRecorderRef.current.onstop = () => {
//         const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//         const audioUrl = URL.createObjectURL(audioBlob);
//         setAudioURL(audioUrl);
//       };

//       mediaRecorderRef.current.start();
//       setIsRecording(true);
//     } catch (error) {
//       console.error('Error accessing microphone:', error);
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorderRef.current && isRecording) {
//       mediaRecorderRef.current.stop();
//       setIsRecording(false);
//     }
//   };

//   const sendAudioForTranscription = async () => {
//     if (audioChunksRef.current.length === 0) return;

//     setIsLoading(true);
//     const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
//     const formData = new FormData();
//     formData.append('audio', audioBlob, 'audio.webm');

//     try {
//       const response = await fetch('http://localhost:8080/transcribe/audio', {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       setTranscription(data.transcription);
//     } catch (error) {
//       console.error('Error sending audio for transcription:', error);
//       setTranscription('Error transcribing audio. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md my-auto">
//       <h2 className="text-3xl font-bold mb-6 text-gray-800">Audio Transcription</h2>
//       <div className="space-y-4">
//         <div className="flex space-x-4">
//           <button
//             onClick={isRecording ? stopRecording : startRecording}
//             className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
//               isRecording
//                 ? 'bg-red-500 hover:bg-red-600'
//                 : 'bg-blue-500 hover:bg-blue-600'
//             } transition duration-300 ease-in-out`}
//           >
//             {isRecording ? (
//               <>
//                 <MicOff className="w-5 h-5 mr-2" />
//                 Stop Recording
//               </>
//             ) : (
//               <>
//                 <Mic className="w-5 h-5 mr-2" />
//                 Start Recording
//               </>
//             )}
//           </button>
//           <button
//             onClick={sendAudioForTranscription}
//             disabled={!audioURL || isLoading}
//             className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
//               !audioURL || isLoading
//                 ? 'bg-gray-300 cursor-not-allowed'
//                 : 'bg-green-500 hover:bg-green-600'
//             } transition duration-300 ease-in-out`}
//           >
//             <FileText className="w-5 h-5 mr-2" />
//             Transcribe Audio
//           </button>
//         </div>

//         {audioURL && (
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold mb-2 text-gray-700">Recorded Audio:</h3>
//             <audio src={audioURL} controls className="w-full" />
//           </div>
//         )}

//         {isLoading && (
//           <div className="flex items-center justify-center space-x-2 text-blue-500">
//             <Loader className="w-6 h-6 animate-spin" />
//             <p className="text-lg">Transcribing audio...</p>
//           </div>
//         )}

//         {transcription && (
//           <div className="mt-6">
//             <h3 className="text-lg font-semibold mb-2 text-gray-700">Transcription:</h3>
//             <p className="p-4 bg-gray-100 rounded-md text-gray-800 whitespace-pre-wrap">{transcription}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default DocumentationTool;

// import React, { useState } from "react";
// import { Upload, FileText, Loader } from "lucide-react";

// function FileUploadTool() {
//     const [file, setFile] = useState(null);
//     const [isUploading, setIsUploading] = useState(false);
//     const [uploadStatus, setUploadStatus] = useState("");

//     const handleFileChange = (event) => {
//         setFile(event.target.files[0]);
//     };

//     const uploadFile = async () => {
//         if (!file) {
//             setUploadStatus("Please select a file first.");
//             return;
//         }

//         setIsUploading(true);
//         setUploadStatus("");

//         const formData = new FormData();
//         formData.append("file", file);

//         try {
//             const response = await fetch("http://localhost:8080/upload", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorText = await response.text();
//                 throw new Error(
//                     `HTTP error! status: ${response.status}, message: ${errorText}`
//                 );
//             }

//             const result = await response.text();
//             setUploadStatus(result);
//         } catch (error) {
//             console.error("Error uploading file:", error);
//             setUploadStatus(`Error uploading file: ${error.message}`);
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md my-auto">
//             <h2 className="text-3xl font-bold mb-6 text-gray-800">
//                 File Upload to S3
//             </h2>
//             <div className="space-y-4">
//                 <div className="flex flex-col space-y-4">
//                     <input
//                         type="file"
//                         onChange={handleFileChange}
//                         className="file:mr-4 file:py-2 file:px-4
//             file:rounded-full file:border-0
//             file:text-sm file:font-semibold
//             file:bg-violet-50 file:text-violet-700
//             hover:file:bg-violet-100"
//                     />
//                     <button
//                         onClick={uploadFile}
//                         disabled={!file || isUploading}
//                         className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
//                             !file || isUploading
//                                 ? "bg-gray-300 cursor-not-allowed"
//                                 : "bg-blue-500 hover:bg-blue-600"
//                         } transition duration-300 ease-in-out`}
//                     >
//                         {isUploading ? (
//                             <>
//                                 <Loader className="w-5 h-5 mr-2 animate-spin" />
//                                 Uploading...
//                             </>
//                         ) : (
//                             <>
//                                 <Upload className="w-5 h-5 mr-2" />
//                                 Upload to S3
//                             </>
//                         )}
//                     </button>
//                 </div>

//                 {file && (
//                     <div className="mt-4">
//                         <h3 className="text-lg font-semibold mb-2 text-gray-700">
//                             Selected File:
//                         </h3>
//                         <p className="flex items-center text-gray-600">
//                             <FileText className="w-5 h-5 mr-2" />
//                             {file.name}
//                         </p>
//                     </div>
//                 )}

//                 {uploadStatus && (
//                     <div className="mt-6">
//                         <h3 className="text-lg font-semibold mb-2 text-gray-700">
//                             Upload Status:
//                         </h3>
//                         <p className="p-4 bg-gray-100 rounded-md text-gray-800">
//                             {uploadStatus}
//                         </p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// }

// export default FileUploadTool;

import React, { useState, useRef } from "react";
import { Mic, MicOff, FileText, Loader, Upload } from "lucide-react";

function CombinedTool() {
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

    // Functions for audio recording and transcription
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

    // Functions for file upload
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
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
        } catch (error) {
            console.error("Error uploading file:", error);
            setUploadStatus(`Error uploading file: ${error.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md my-auto">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
                Audio Transcription & File Upload
            </h2>

            {/* Audio Recording and Transcription */}
            <div className="space-y-4">
                <div className="flex space-x-4">
                    <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                            isRecording
                                ? "bg-red-500 hover:bg-red-600"
                                : "bg-blue-500 hover:bg-blue-600"
                        } transition duration-300 ease-in-out`}
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
                        } transition duration-300 ease-in-out`}
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Transcribe Audio
                    </button>
                </div>

                {audioURL && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">
                            Recorded Audio:
                        </h3>
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
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">
                            Transcription:
                        </h3>
                        <p className="p-4 bg-gray-100 rounded-md text-gray-800 whitespace-pre-wrap">
                            {transcription}
                        </p>
                    </div>
                )}
            </div>

            <hr className="my-8" />

            {/* File Upload */}
            <div className="space-y-4">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
                />
                <button
                    onClick={uploadFile}
                    disabled={!file || isUploading}
                    className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
                        !file || isUploading
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-500 hover:bg-blue-600"
                    } transition duration-300 ease-in-out`}
                >
                    {isUploading ? (
                        <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload className="w-5 h-5 mr-2" />
                            Upload to S3
                        </>
                    )}
                </button>

                {file && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">
                            Selected File:
                        </h3>
                        <p className="flex items-center text-gray-600">
                            <FileText className="w-5 h-5 mr-2" />
                            {file.name}
                        </p>
                    </div>
                )}

                {uploadStatus && (
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">
                            Upload Status:
                        </h3>
                        <p className="p-4 bg-gray-100 rounded-md text-gray-800">
                            {uploadStatus}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CombinedTool;
