
import { supabase } from '../integrations/supabase/client';
import { DatabaseMessage } from '../types/messages';

// Load messages for a specific session
export async function loadMessagesForSession(sessionId: string): Promise<DatabaseMessage[]> {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('session_id', parseInt(sessionId, 10)) // Convert string sessionId to number
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      throw error;
    }
    const typedData = data as DatabaseMessage[];
    
    // Ensure the data conforms to DatabaseMessage type
    return (typedData || []).map(item => ({
      ...item,
      role: item.role === 'user' || item.role === 'assistant' ? item.role : 'user',
      chat_mode: item.chat_mode || '범용 검색' // Ensure chat_mode is always present
    }));
  } catch (error) {
    console.error('Error in loadMessagesForSession:', error);
    throw error;
  }
}

// Add a new message to the database
export async function addMessageToDatabase(
  content: string, 
  role: 'user' | 'assistant', 
  sessionId: string,
  chatMode: string = '범용 검색'
): Promise<DatabaseMessage | null> {
  try {
    // Use the edge function to add messages to bypass RLS policies
    const { data, error } = await supabase.functions.invoke('db-helpers', {
      body: { 
        action: 'create_new_message',
        data: {
          input_text: content,
          role: role,
          session_id: parseInt(sessionId, 10), // Convert string sessionId to number
          chat_mode: chatMode // Store the chat mode with the message
        }
      }
    });
    
    if (error) {
      console.error('Error adding message with edge function:', error);
      throw error;
    }
    
    if (!data || data.error) {
      console.error('Error in edge function response:', data?.error || 'Unknown error');
      throw new Error(data?.error || 'Failed to add message');
    }
    
    // Ensure the returned data conforms to DatabaseMessage type
    const message = data[0];
    return message ? {
      ...message,
      role: message.role === 'user' || message.role === 'assistant' ? message.role : 'user',
      chat_mode: message.chat_mode || chatMode // Ensure chat_mode is properly set
    } as DatabaseMessage : null;
  } catch (error) {
    console.error('Error in addMessageToDatabase:', error);
    throw error;
  }
}

// Process a message with the OpenAI API
export async function processMessage(
  messages: { role: string; content: string }[],
  chatMode: string = '범용 검색',
  sessionId: string | null = null,
  expertiseLevel: string = 'intermediate'
): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        chatMode,
        sessionId,
        expertiseLevel
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error('Error in processMessage:', error);
    throw error;
  }
}
