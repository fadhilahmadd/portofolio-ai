"use client";

import { Bot } from 'lucide-react';

interface WelcomeScreenProps {
  onSuggestedQuestionClick: (question: string) => void;
}

export const WelcomeScreen = ({ onSuggestedQuestionClick }: WelcomeScreenProps) => {
  const isIndonesian =
    typeof navigator !== 'undefined' && (
      (navigator.language && navigator.language.toLowerCase().startsWith('id')) ||
      (Array.isArray(navigator.languages) && navigator.languages.some(l => l.toLowerCase().startsWith('id')))
    );

  const headingText = isIndonesian
    ? 'Saya Asisten Fadhil, bagaimana saya dapat membantu hari ini?'
    : "I'm Fadhil Assistant, How can I help you today?";

  const exampleQuestions = isIndonesian
    ? [
        'Apa saja keahlian teknis utama Fadhil?',
        'Ceritakan tentang proyek "Nutrichef".',
        'Apa peran Fadhil di PT. SKI ABIYOSOFT?',
      ]
    : [
        "What are Fadhil's main technical skills?",
        'Tell me about the "Nutrichef" project.',
        'What was his role at PT. SKI ABIYOSOFT?',
      ];

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div className="relative mb-4">
        <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur-lg opacity-60"></div>
        <div className="relative p-4 bg-gray-900 border border-white/10 rounded-full">
          <Bot className="h-12 w-12 text-blue-400" />
        </div>
      </div>
      <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-200 to-gray-400">
        {headingText}
      </h1>
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {exampleQuestions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSuggestedQuestionClick(q)}
            className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all duration-300 text-left"
          >
            <p className="font-semibold text-gray-300">{q}</p>
          </button>
        ))}
      </div>
    </div>
  );
};