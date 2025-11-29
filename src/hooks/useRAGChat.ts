import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface UseRAGChatOptions {
  projectId: string;
  onError?: (error: Error) => void;
}

export function useRAGChat({ projectId, onError }: UseRAGChatOptions) {
  const { getAuthHeaders } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      // Add user message
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);

      // Create assistant message placeholder
      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        const response = await fetch(`/api/rag/projects/${projectId}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ message: content.trim() }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error('Response body is not readable');
        }

        let accumulatedContent = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                if (parsed.done) {
                  // Stream complete
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, isStreaming: false }
                        : msg
                    )
                  );
                  break;
                }

                if (parsed.content) {
                  accumulatedContent += parsed.content;

                  // Update assistant message with accumulated content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (parseError) {
                console.error('Failed to parse SSE data:', parseError);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            console.log('Request aborted');
          } else {
            console.error('Chat error:', error);
            onError?.(error);

            // Update assistant message with error
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      content: `Fel: ${error.message}`,
                      isStreaming: false,
                    }
                  : msg
              )
            );
          }
        }
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [projectId, isStreaming, getAuthHeaders, onError]
  );

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    clearMessages,
  };
}
