import React, { useState, useRef } from 'react';
import { Mic, MicOff, FileText, Loader } from 'lucide-react';

function DocumentationTool() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState('');
  const [transcription, setTranscription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
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
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    try {
      const response = await fetch('http://localhost:8080/transcribe/audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setTranscription(data.transcription);
    } catch (error) {
      console.error('Error sending audio for transcription:', error);
      setTranscription('Error transcribing audio. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Audio Transcription</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-blue-500 hover:bg-blue-600'
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
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            } transition duration-300 ease-in-out`}
          >
            <FileText className="w-5 h-5 mr-2" />
            Transcribe Audio
          </button>
        </div>

        {audioURL && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Recorded Audio:</h3>
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
            <h3 className="text-lg font-semibold mb-2 text-gray-700">Transcription:</h3>
            <p className="p-4 bg-gray-100 rounded-md text-gray-800 whitespace-pre-wrap">{transcription}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentationTool;