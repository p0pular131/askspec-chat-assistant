
import { supabase } from '../integrations/supabase/client';
import { DatabaseMessage } from '../types/conversation';

export const getNextMessageId = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('messages')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Error getting next message ID:', error);
    return Date.now();
  }
  
  return (data && data.length > 0) ? data[0].id + 1 : 1;
};

export const loadConversationMessages = async (sessionId: number): Promise<DatabaseMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  if (data) {
    return data.map(message => ({
      ...message,
      input_text: message.input_text || '',
      role: (message.role === 'user' || message.role === 'assistant') 
        ? message.role 
        : 'user',
    }));
  }

  return [];
};

export const insertMessage = async (
  sessionId: number,
  text: string,
  role: 'user' | 'assistant'
): Promise<void> => {
  const nextId = await getNextMessageId();

  const { error } = await supabase
    .from('messages')
    .insert({
      id: nextId,
      session_id: sessionId,
      input_text: text,
      role: role
    });

  if (error) {
    throw error;
  }
};
