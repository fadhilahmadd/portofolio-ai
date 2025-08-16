import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '@/types';
import { sendChatRequest } from '@/lib/api';

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

  const handleSend = async (messageText: string = input, audioBlob?: Blob) => {
    const textToSend = messageText.trim();
    if ((textToSend === '' && !audioBlob) || isLoading || !sessionId) return;

    const userMessage: Message = { id: uuidv4(), sender: 'user', text: textToSend || "Audio message" };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setSuggestedQuestions([]);

    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('message', textToSend); // Always send the message field
    formData.append('include_audio_response', 'true');
    if (audioBlob) {
      formData.append('audio_file', audioBlob, 'recording.wav');
    }

    let isFirstToken = true;
    const aiMessageId = uuidv4();

    await sendChatRequest(
      formData,
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
        
        setMessages(prev => prev.map(msg => {
          if (msg.id === aiMessageId) {
            const updatedMsg = { ...msg, isStreaming: false, audioUrl: finalData.audioUrl };
            
            if (finalData.mailto) {
              updatedMsg.text += `\n\n[Click here to send an email](${finalData.mailto})`;
            }
            
            return updatedMsg;
          }
          return msg;
        }));
      },
      (err) => {
        setIsLoading(false);
        const errorMessage = err instanceof Error 
          ? `I apologize, but an error occurred: ${err.message}`
          : "I apologize, but I'm encountering a technical issue at the moment. Please try again in a little while.";
        
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