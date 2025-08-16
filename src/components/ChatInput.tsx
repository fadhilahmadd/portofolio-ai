"use client";

import { Send } from 'lucide-react';
import { RecordButton } from './RecordButton';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: (message?: string, audioBlob?: Blob) => void;
  isResponding: boolean;
}

export const ChatInput = ({ input, setInput, handleSend, isResponding }: ChatInputProps) => {
  const isIndonesian =
    typeof navigator !== 'undefined' && (
      (navigator.language && navigator.language.toLowerCase().startsWith('id')) ||
      (Array.isArray(navigator.languages) && navigator.languages.some(l => l.toLowerCase().startsWith('id')))
    );

  const placeholder = isIndonesian ? 'Tulis pertanyaan atau gunakan mikrofon' : 'Enter a prompt or use the microphone';

  const handleAudioStop = (audioBlob: Blob) => {
    handleSend(undefined, audioBlob);
  };

  return (
    <div className="relative flex items-center gap-2">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend(input)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-0 rounded-full py-3 pl-6 pr-24 text-white placeholder-gray-500 transition-colors"
        disabled={isResponding}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <RecordButton onStop={handleAudioStop} isResponding={isResponding} />
        <button
          onClick={() => handleSend(input)}
          disabled={isResponding || input.trim() === ''}
          className="p-2 bg-gray-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};