
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/use-toast';
import { responseModules } from '../modules/responseModules';

export interface DatabaseMessage {
  id: number;
  session_id: number;
  input_text: string;
  response_json: any;
  role: 'user' | 'assistant';
  created_at: string;
}

// Helper function to validate if a string is a valid number
const isValidId = (str: string | null): boolean => {
  if (!str) return false;
  return !isNaN(parseInt(str));
};

// Retry function with exponential backoff
const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, delay * 1.5);
  }
};

export function useMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (sessionIdStr: string) => {
    try {
      // Check if sessionId is a valid number before making the request
      if (!isValidId(sessionIdStr)) {
        console.log('Invalid or empty session ID, not loading messages');
        setMessages([]);
        setLoading(false);
        return;
      }
      
      const sesId = parseInt(sessionIdStr);
      setLoading(true);
      setError(null);
      
      const fetchMessages = async () => {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sesId)
          .order('created_at');
        
        if (error) throw error;
        return data;
      };
      
      // Use retry logic for fetching messages
      const data = await fetchWithRetry(fetchMessages, 3, 1000);
      
      // Ensure that the role is cast to the expected type
      const typedData = (data || []).map(msg => ({
        ...msg,
        role: (msg.role as 'user' | 'assistant') || 'user'
      }));
      
      setMessages(typedData);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast({
        title: "메시지 로딩 실패",
        description: "메시지를 불러오는 데 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Get the next available ID for a new message
  const getNextMessageId = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error('Error getting next message ID:', error);
      return Date.now(); // Default to timestamp if there's an error
    }
    
    return (data && data.length > 0) ? data[0].id + 1 : 1;
  };

  const addMessage = async (content: string, role: 'user' | 'assistant', sessionIdStr: string) => {
    try {
      // Validate session ID first
      if (!isValidId(sessionIdStr)) {
        throw new Error('Invalid session ID');
      }

      const sesId = parseInt(sessionIdStr);
      const nextId = await getNextMessageId();
      
      const newMessage = {
        id: nextId,
        session_id: sesId,
        role: role,
        input_text: content,
        response_json: role === 'assistant' ? { text: content } : null
      };
      
      const addMessageToDb = async () => {
        const { data, error } = await supabase
          .from('messages')
          .insert(newMessage)
          .select();
          
        if (error) throw error;
        return data;
      };
      
      // Use retry logic for adding messages
      const data = await fetchWithRetry(addMessageToDb, 2, 800);
      
      // Update local state with the newly added message with proper typing
      if (data && data[0]) {
        const typedData: DatabaseMessage = {
          ...data[0],
          role: (data[0].role === 'user' || data[0].role === 'assistant') 
            ? data[0].role as 'user' | 'assistant' 
            : 'user', // Default to 'user' if invalid
          created_at: data[0].created_at || new Date().toISOString()
        };
        setMessages(prevMessages => [...prevMessages, typedData]);
      }
    } catch (err) {
      console.error('Error adding message:', err);
      toast({
        title: "메시지 추가 실패",
        description: "메시지를 추가하는 데 문제가 발생했습니다.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const callOpenAI = async (
    messages: { role: string; content: string }[], 
    chatMode: string,
    expertiseLevel: string = 'intermediate'
  ) => {
    try {
      console.log("Processing with chat mode:", chatMode);
      
      // Use the appropriate response module based on chatMode
      if (responseModules[chatMode]) {
        const responseModule = responseModules[chatMode];
        // Get the last user message content
        const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
        const content = lastUserMessage ? lastUserMessage.content : '';
        
        // Process with the module
        return await responseModule.process(content, expertiseLevel);
      } else {
        // Fallback to OpenAI API if no module found
        console.log("Calling OpenAI with messages:", messages);
        
        // Increase timeout to 90 seconds
        const timeoutMs = 90000; 
        
        const apiCallWithTimeout = async () => {
          try {
            const callApi = async () => {
              const { data, error } = await supabase.functions.invoke('chat-completion', {
                body: {
                  messages,
                  chatMode,
                  sessionId,
                  expertiseLevel,
                  max_tokens: 2000, // Explicitly set max tokens
                }
              });
              
              if (error) {
                console.error('Error invoking chat-completion function:', error);
                throw new Error(error.message || 'Failed to call OpenAI API');
              }
              
              if (!data || !data.response) {
                throw new Error('No response received from the API');
              }
              
              return data.response;
            };
            
            // Use retry logic for API calls
            return await fetchWithRetry(callApi, 2, 1000);
          } catch (err) {
            console.error('Error in API call:', err);
            throw err;
          }
        };
        
        // Create a promise that rejects after timeoutMs
        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => reject(new Error('API request timed out after 90 seconds')), timeoutMs);
        });
        
        // Race the API call against the timeout
        const response = await Promise.race([
          apiCallWithTimeout(),
          timeoutPromise
        ]);
        
        console.log("Got response:", response?.substring(0, 100) + "...");
        return response;
      }
    } catch (err) {
      console.error('Error calling OpenAI:', err);
      toast({
        title: "AI 응답 오류",
        description: "AI 응답을 생성하는 데 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [sessionId, loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
    callOpenAI,
  };
}
