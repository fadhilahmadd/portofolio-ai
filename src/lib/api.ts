/**
 * Establishes a connection to the chat API endpoint and streams the response.
 * This function uses the Fetch API to handle Server-Sent Events (SSE).
 *
 * @param sessionId - The unique identifier for the chat session.
 * @param message - The user's message.
 * @param onToken - A callback function that is called for each token received from the stream.
 * @param onFinal - A callback function that is called when the final message (with metadata) is received.
 * @param onError - A callback function that is called when an error occurs.
 */
export const streamChatResponse = async (
  sessionId: string,
  message: string,
  onToken: (token: string) => void,
  onFinal: (finalData: { suggested_questions?: string[]; mailto?: string }) => void,
  onError: (error: Error) => void
) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        message: message,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataContent = line.substring(6).trim();
          if (dataContent) {
            try {
              const data = JSON.parse(dataContent);
              if (data.token) {
                onToken(data.token);
              } else {
                onFinal(data);
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', dataContent, e);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Error in streamChatResponse:", error);
    onError(error instanceof Error ? error : new Error("An unknown error occurred."));
  }
};
