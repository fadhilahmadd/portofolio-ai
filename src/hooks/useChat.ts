import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';
import { postChatMessage } from '@/lib/api';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSessionId(uuidv4());
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
    });
  }, [messages]);

  const handleSend = async (messageText: string = input) => {
    if (messageText.trim() === '' || isLoading || !sessionId) return;

    const userMessage: Message = { id: uuidv4(), sender: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setSuggestedQuestions([]);

    try {
      const { response, suggested_questions } = await postChatMessage(sessionId, messageText);
      setIsLoading(false); 

      // --- Start of Streaming Logic ---
      const aiMessageId = uuidv4();
      const initialAiMessage: Message = { id: aiMessageId, sender: 'ai', text: '', isStreaming: true };
      setMessages(prev => [...prev, initialAiMessage]);

      let streamedText = '';
      const interval = setInterval(() => {
        if (streamedText.length < response.length) {
          streamedText = response.substring(0, streamedText.length + 1);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: streamedText } : msg
          ));
        } else {
          clearInterval(interval);
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
          ));
          if (suggested_questions) {
            setSuggestedQuestions(suggested_questions);
          }
           setIsLoading(false);
        }
      }, 20); // Adjust speed of streaming here
      // --- End of Streaming Logic ---

    } catch (err: any) {
      const errorMessage = "I apologize, but I'm encountering a technical issue at the moment. Please try again in a little while.";
      setError(errorMessage);
      setMessages(prev => [...prev, { id: uuidv4(), sender: 'ai', text: errorMessage }]);
      setIsLoading(false);
    }
  };

  return {
    messages,
    input,
    isLoading,
    error,
    suggestedQuestions,
    chatContainerRef,
    setInput,
    handleSend,
  };
};