"use client";

import { Mic, StopCircle } from 'lucide-react';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

interface RecordButtonProps {
  onStop: (audioBlob: Blob) => void;
  isResponding: boolean;
}

export const RecordButton = ({ onStop, isResponding }: RecordButtonProps) => {
  const { isRecording, startRecording, stopRecording } = useAudioRecorder(onStop);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <button
      onClick={handleToggleRecording}
      disabled={isResponding}
      className={`p-2 rounded-full transition-colors ${
        isRecording 
          ? 'bg-red-600 hover:bg-red-700' 
          : 'bg-gray-700 hover:bg-blue-600'
      } disabled:bg-gray-600 disabled:cursor-not-allowed`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? <StopCircle className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
    </button>
  );
};