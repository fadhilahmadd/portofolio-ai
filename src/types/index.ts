export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isStreaming?: boolean; // Added for the streaming effect
}

export interface ChatResponse {
  response: string;
  suggested_questions?: string[];
}