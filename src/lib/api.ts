/**
 * A helper function to find the index of a subarray (needle) in a Uint8Array (haystack).
 * @param haystack The array to search in.
 * @param needle The array to search for.
 * @param offset The starting position for the search.
 * @returns The index of the first occurrence of the needle, or -1 if not found.
 */
function findSubarray(haystack: Uint8Array, needle: Uint8Array, offset: number = 0): number {
    for (let i = offset; i <= haystack.length - needle.length; i++) {
        let found = true;
        for (let j = 0; j < needle.length; j++) {
            if (haystack[i + j] !== needle[j]) {
                found = false;
                break;
            }
        }
        if (found) return i;
    }
    return -1;
}

/**
 * Parses a multipart/mixed response containing JSON and a file blob by operating on bytes.
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
  const uint8Array = new Uint8Array(arrayBuffer);
  const boundaryBytes = new TextEncoder().encode(`--${boundary}`);
  const headerEndBytes = new Uint8Array([13, 10, 13, 10]); // \r\n\r\n

  let jsonData: any = null;
  let audioBlob: Blob | null = null;
  let currentIndex = findSubarray(uint8Array, boundaryBytes);

  while (currentIndex !== -1) {
    const nextIndex = findSubarray(uint8Array, boundaryBytes, currentIndex + boundaryBytes.length);
    if (nextIndex === -1) break;

    const partStart = currentIndex + boundaryBytes.length;
    
    // Check for the final boundary marker `--`
    if (uint8Array[partStart + 2] === 45 && uint8Array[partStart + 3] === 45) {
        break;
    }
    
    const headerEndIndexInPart = findSubarray(uint8Array, headerEndBytes, partStart);
    if (headerEndIndexInPart === -1) {
        currentIndex = nextIndex;
        continue;
    }

    const headerText = new TextDecoder().decode(uint8Array.slice(partStart, headerEndIndexInPart)).trim();
    const bodyStart = headerEndIndexInPart + headerEndBytes.length;
    const bodyEnd = nextIndex - 2; // Exclude the trailing \r\n
    const body = uint8Array.slice(bodyStart, bodyEnd);
    
    if (headerText.includes('Content-Type: application/json')) {
      jsonData = JSON.parse(new TextDecoder().decode(body));
    } else if (headerText.includes('Content-Type: audio/mpeg')) {
      audioBlob = new Blob([body], { type: 'audio/mpeg' });
    }

    currentIndex = nextIndex;
  }
  
  if (!jsonData) {
      throw new Error("Failed to parse JSON part from multipart response");
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