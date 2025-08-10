import axios from 'axios';
import { ChatResponse } from '@/types';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const postChatMessage = async (sessionId: string, message: string): Promise<ChatResponse> => {
  try {
    const response = await apiClient.post('/api/v1/chat/', {
      session_id: sessionId,
      message: message,
    });
    return response.data;
  } catch (error) {
    console.error("Error in postChatMessage:", error);
    throw new Error("Failed to get a response from the server. Please try again.");
  }
};