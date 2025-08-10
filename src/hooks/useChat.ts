import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';
import { streamChatResponse } from '@/lib/api';

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

    let isFirstToken = true;
    const aiMessageId = uuidv4();

    await streamChatResponse(
      sessionId,
      messageText,
      (token) => {
        if (isFirstToken) {
          setIsLoading(false);
          const initialAiMessage: Message = { id: aiMessageId, sender: 'ai', text: token, isStreaming: true };
          setMessages(prev => [...prev, initialAiMessage]);
          isFirstToken = false;
        } else {
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, text: msg.text + token } : msg
          ));
        }
      },
      (finalData) => {
        if (finalData.suggested_questions) {
          setSuggestedQuestions(finalData.suggested_questions);
        }
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
        ));
      },
      (err) => {
        setIsLoading(false);
        const errorMessage = "I apologize, but I'm encountering a technical issue at the moment. Please try again in a little while.";
        setError(errorMessage);
        
        if (isFirstToken) {
          setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: errorMessage, isStreaming: false }]);
        } else {
          setMessages(prev => prev.map(msg => 
              msg.id === aiMessageId ? { ...msg, text: errorMessage, isStreaming: false } : msg
          ));
        }
      }
    );
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
