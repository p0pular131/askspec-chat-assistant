import { supabase } from '../integrations/supabase/client';
import { DatabaseMessage } from '../types/messages';
import { fetchWithRetry, isValidId } from '../utils/fetchUtils';
import { toast } from '../components/ui/use-toast';
import { responseModules } from '../modules/responseModules';

/**
 * Loads messages for a given session ID
 */
export const loadMessagesForSession = async (sessionIdStr: string): Promise<DatabaseMessage[]> => {
  try {
    // Check if sessionId is a valid number before making the request
    if (!isValidId(sessionIdStr)) {
      console.log('Invalid or empty session ID, not loading messages');
      return [];
    }
    
    const sesId = parseInt(sessionIdStr);
    
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
    
    return typedData;
  } catch (err) {
    console.error('Error loading messages:', err);
    toast({
      title: "메시지 로딩 실패",
      description: "메시지를 불러오는 데 문제가 발생했습니다. 다시 시도해주세요.",
      variant: "destructive",
    });
    throw err;
  }
};

/**
 * Get the next available ID for a new message
 */
export const getNextMessageId = async (): Promise<number> => {
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

/**
 * Add a new message to the database
 */
export const addMessageToDatabase = async (
  content: string, 
  role: 'user' | 'assistant', 
  sessionIdStr: string
): Promise<DatabaseMessage | null> => {
  try {
    // Validate session ID first
    if (!isValidId(sessionIdStr)) {
      throw new Error('Invalid session ID');
    }
    
    // Use db-helpers edge function for creating messages to bypass RLS
    const { data, error } = await supabase.functions.invoke('db-helpers', {
      body: { 
        action: 'create_message',
        data: {
          session_id: parseInt(sessionIdStr),
          input_text: content,
          role: role
        }
      }
    });
    
    if (error) {
      console.error('Error creating message with edge function:', error);
      throw error;
    }
    
    if (!data || data.error) {
      console.error('Error in edge function response:', data?.error || 'Unknown error');
      throw new Error(data?.error || 'Failed to create message');
    }
    
    // Return the newly added message with proper typing
    if (data && data[0]) {
      const typedData: DatabaseMessage = {
        ...data[0],
        role: (data[0].role === 'user' || data[0].role === 'assistant') 
          ? data[0].role as 'user' | 'assistant' 
          : 'user', // Default to 'user' if invalid
        created_at: data[0].created_at || new Date().toISOString()
      };
      return typedData;
    }
    return null;
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

/**
 * Call OpenAI or appropriate response module based on chat mode
 */
export const processMessage = async (
  messages: { role: string; content: string }[], 
  chatMode: string,
  sessionId: string | null,
  expertiseLevel: string = 'intermediate'
): Promise<string> => {
  try {
    console.log("Processing with chat mode:", chatMode);
    
    // Use the appropriate response module based on chatMode
    if (responseModules[chatMode]) {
      const responseModule = responseModules[chatMode];
      // Get the last user message content
      // Replace findLast with alternative since it's not supported in older ES versions
      const lastUserMessage = messages
        .filter(msg => msg.role === 'user')
        .reduce((prev, current) => current, undefined);
      
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
