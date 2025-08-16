'use client';

import { useChat } from '@/hooks/useChat';
import { Sidebar } from '@/components/Sidebar';
import { ChatInput } from '@/components/ChatInput';
import { ChatMessage } from '@/components/ChatMessage';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import { LoadingIndicator } from '@/components/LoadingIndicator'; 

export default function Home() {
  const isIndonesian =
    typeof navigator !== 'undefined' && (
      (navigator.language && navigator.language.toLowerCase().startsWith('id')) ||
      (Array.isArray(navigator.languages) && navigator.languages.some(l => l.toLowerCase().startsWith('id')))
    );

  const {
    messages,
    input,
    isLoading,
    suggestedQuestions,
    chatContainerRef,
    setInput,
    handleSend,
  } = useChat();

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  const isAiResponding = isLoading || messages[messages.length - 1]?.isStreaming === true;

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 font-sans">
      <Sidebar />
      <main className="flex-1 flex flex-col pl-20 pr-4 md:pr-8 py-6">
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto custom-scrollbar pr-4">
          <div className="max-w-5xl mx-auto h-full">
            {messages.length === 0 && !isLoading ? (
              <WelcomeScreen onSuggestedQuestionClick={handleSuggestedQuestion} />
            ) : (
              <div className="space-y-10 pb-8">
                {messages.map((msg) => (
                  <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && <LoadingIndicator />}
              </div>
            )}
          </div>
        </div>
        <div className="pt-4 max-w-5xl mx-auto w-full">
          {suggestedQuestions.length > 0 && !isAiResponding && (
            <div className="flex flex-wrap gap-2 mb-4 animate-fade-in">
              {suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedQuestion(q)}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 text-sm py-1.5 px-3 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <ChatInput
            input={input}
            setInput={setInput}
            handleSend={handleSend}
            isResponding={isAiResponding}
          />
           <p className="text-xs text-gray-500 text-center mt-3">
            {isIndonesian
              ? 'AI bisa saja keliru. Pertimbangkan untuk memeriksa informasi penting. Ini adalah proyek portofolio oleh Fadhil Ahmad Hidayat.'
              : 'AI can make mistakes. Consider checking important information. This is a portfolio project by Fadhil Ahmad Hidayat.'}
          </p>
        </div>
      </main>
    </div>
  );
}