import ReactMarkdown from 'react-markdown';
import { Bot, User } from 'lucide-react';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

const BlinkingCursor = () => <span className="animate-blink">▍</span>;

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.sender === 'user';
  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center border border-white/10 ${isUser ? 'bg-blue-600' : 'bg-gray-800'}`}>
        {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5 text-blue-400" />}
      </div>
      <div className="prose prose-invert prose-p:my-0 max-w-3xl text-gray-300">
        <ReactMarkdown>{message.text}</ReactMarkdown>
        {message.isStreaming && <BlinkingCursor />}
      </div>
    </div>
  );
};