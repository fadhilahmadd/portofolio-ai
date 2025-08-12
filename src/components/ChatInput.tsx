"use client";

import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  handleSend: () => void;
  isResponding: boolean; // Renamed for clarity
}

export const ChatInput = ({ input, setInput, handleSend, isResponding }: ChatInputProps) => {
  const isIndonesian =
    typeof navigator !== 'undefined' && (
      (navigator.language && navigator.language.toLowerCase().startsWith('id')) ||
      (Array.isArray(navigator.languages) && navigator.languages.some(l => l.toLowerCase().startsWith('id')))
    );

  const placeholder = isIndonesian ? 'Tulis pertanyaan di sini' : 'Enter a prompt here';

  return (
    <div className="relative">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 focus:border-blue-500 focus:ring-0 rounded-full py-3 pl-6 pr-14 text-white placeholder-gray-500 transition-colors"
        disabled={isResponding}
      />
      <button
        onClick={handleSend}
        disabled={isResponding || input.trim() === ''}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-gray-700 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-full transition-colors"
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};