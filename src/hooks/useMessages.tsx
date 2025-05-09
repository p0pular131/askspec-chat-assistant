
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/use-toast';

export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

// Interface for raw message data from the database
interface RawDatabaseMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
}

// Helper function to validate if a string is a valid UUID
const isUUID = (str: string | null): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
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

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to convert raw message data to our DatabaseMessage interface
  const convertRawMessage = (rawMessage: RawDatabaseMessage): DatabaseMessage => {
    // Validate that role is either 'user' or 'assistant'
    const validRole = (rawMessage.role === 'user' || rawMessage.role === 'assistant') 
      ? rawMessage.role 
      : 'user'; // Default to user if for some reason we get an invalid role
      
    return {
      id: rawMessage.id,
      conversation_id: rawMessage.conversation_id,
      content: rawMessage.content,
      role: validRole,
      created_at: rawMessage.created_at
    };
  };

  const loadMessages = useCallback(async (convoId: string) => {
    try {
      // Check if convoId is a valid UUID before making the request
      if (!isUUID(convoId)) {
        console.log('Invalid or empty conversation ID, not loading messages');
        setMessages([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      const fetchMessages = async () => {
        const { data: rawData, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', convoId)
          .order('created_at');
        
        if (error) throw error;
        return rawData;
      };
      
      // Use retry logic for fetching messages
      const rawData = await fetchWithRetry(fetchMessages, 3, 1000);
      
      // Transform the raw data to match our DatabaseMessage interface
      const transformedMessages = (rawData || []).map(convertRawMessage);
      setMessages(transformedMessages);
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

  const addMessage = async (content: string, role: 'user' | 'assistant', convoId: string) => {
    try {
      // Validate conversation ID first
      if (!isUUID(convoId)) {
        throw new Error('Invalid conversation ID');
      }

      const newMessage = {
        conversation_id: convoId,
        content,
        role,
      };
      
      const addMessageToDb = async () => {
        const { data: rawMessage, error } = await supabase
          .from('messages')
          .insert(newMessage)
          .select();
          
        if (error) throw error;
        return rawMessage;
      };
      
      // Use retry logic for adding messages
      const rawMessage = await fetchWithRetry(addMessageToDb, 2, 800);
      
      // Update local state with the newly added message
      if (rawMessage && rawMessage[0]) {
        const transformedMessage = convertRawMessage(rawMessage[0]);
        setMessages(prevMessages => [...prevMessages, transformedMessage]);
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
                conversationId,
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
      
      console.log("Got response from OpenAI:", response?.substring(0, 100) + "...");
      return response;
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
    if (conversationId) {
      loadMessages(conversationId);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [conversationId, loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
    callOpenAI,
  };
}
