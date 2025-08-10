import { Bot } from 'lucide-react';

export const LoadingIndicator = () => (
  <div className="flex items-start gap-4 animate-fade-in">
    <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border border-white/10 bg-gray-800">
      <Bot className="h-5 w-5 text-blue-400" />
    </div>
    <div className="flex items-center space-x-1.5 pt-2.5">
      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
      <div className="h-1.5 w-1.5 bg-blue-400 rounded-full animate-pulse"></div>
    </div>
  </div>
);