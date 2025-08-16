/**
 * Parses a multipart/mixed response.
 * @param response - The fetch response object.
 * @returns An object containing the JSON data and the audio blob.
 */
async function parseMultipartResponse(response: Response): Promise<{ jsonData: any; audioBlob: Blob | null }> {
  const contentType = response.headers.get('Content-Type');
  const boundary = contentType?.match(/boundary=(.*)/)?.[1];

  if (!boundary) {
    throw new Error('Multipart response missing boundary');
  }

  const arrayBuffer = await response.arrayBuffer();
  const decoder = new TextDecoder();
  const dataView = new DataView(arrayBuffer);
  const text = decoder.decode(dataView);
  const parts = text.split(`--${boundary}`);
  
  let jsonData: any = null;
  let audioBlob: Blob | null = null;
  
  // A more robust way to find the start of the binary data
  const boundaryBytes = `--${boundary}`.split('').map(c => c.charCodeAt(0));

  for (const part of parts) {
    if (part.includes('Content-Type: application/json')) {
      const jsonContent = part.split('\r\n\r\n')[1].trim();
      if(jsonContent) jsonData = JSON.parse(jsonContent);
    } else if (part.includes('Content-Type: audio/mpeg')) {
      const contentIndex = text.indexOf(part);
      const headersEndIndex = text.indexOf('\r\n\r\n', contentIndex) + 4;
      const partStartIndex = headersEndIndex;
      
      let partEndIndex = -1;
      // Find the next boundary in the original buffer
      for (let i = partStartIndex; i < arrayBuffer.byteLength - boundaryBytes.length; i++) {
        let found = true;
        for (let j = 0; j < boundaryBytes.length; j++) {
          if (dataView.getUint8(i + j) !== boundaryBytes[j]) {
            found = false;
            break;
          }
        }
        if (found) {
          partEndIndex = i - 2; // -2 for the \r\n before the boundary
          break;
        }
      }
      
      if (partEndIndex === -1) {
         partEndIndex = arrayBuffer.byteLength - (boundaryBytes.length + 4); // --boundary--
      }

      const audioData = arrayBuffer.slice(partStartIndex, partEndIndex);
      audioBlob = new Blob([audioData], { type: 'audio/mpeg' });
      break; 
    }
  }

  return { jsonData, audioBlob };
}


/**
 * Sends a chat request with optional audio and handles different response types.
 *
 * @param formData - The form data containing the session_id, message, and optional audio_file.
 * @param onToken - A callback function that is called for each token received from the stream.
 * @param onFinal - A callback function that is called when the final message (with metadata) is received.
 * @param onError - A callback function that is called when an error occurs.
 */
export const sendChatRequest = async (
  formData: FormData,
  onToken: (token: string) => void,
  onFinal: (finalData: { suggested_questions?: string[]; mailto?: string, audioUrl?: string }) => void,
  onError: (error: Error) => void
) => {
  try {
    const response = await fetch(`/api/chat`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody || 'An error occurred'}`);
    }

    const contentType = response.headers.get('Content-Type');

    if (contentType?.includes('multipart/mixed')) {
      const { jsonData, audioBlob } = await parseMultipartResponse(response);
      const audioUrl = audioBlob ? URL.createObjectURL(audioBlob) : undefined;
      
      onToken(jsonData.ai_response);
      onFinal({
        suggested_questions: jsonData.suggested_questions,
        mailto: jsonData.mailto,
        audioUrl,
      });

    } else if (contentType?.includes('application/json')) {
        const data = await response.json();
        onToken(data.ai_response);
        onFinal({
            suggested_questions: data.suggested_questions,
            mailto: data.mailto,
        });
    } else {
        // Handle streaming text response
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
    }
  } catch (error) {
    console.error("Error in sendChatRequest:", error);
    onError(error instanceof Error ? error : new Error("An unknown error occurred."));
  }
};