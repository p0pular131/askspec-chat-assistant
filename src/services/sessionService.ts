
import { supabase } from '../integrations/supabase/client';
import { Session } from '../types/conversation';

export const createNewSession = async (): Promise<Session | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('db-helpers', {
      body: { 
        action: 'create_new_session',
        data: {
          user_id: 123
        }
      }
    });
    
    if (error) {
      console.error('Error creating session with edge function:', error);
      throw error;
    }
    
    if (!data || data.error) {
      console.error('Error in edge function response:', data?.error || 'Unknown error');
      throw new Error(data?.error || 'Failed to create session');
    }
    
    if (data && data[0]) {
      return data[0] as Session;
    }
    
    // Fallback to client-side session creation
    const nextId = await getNextSessionId();
    return {
      id: nextId,
      user_id: 123,
      created_at: new Date().toISOString(),
      session_name: null
    };
    
  } catch (error) {
    console.error("Error creating session:", error);
    return null;
  }
};

export const getNextSessionId = async (): Promise<number> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('id')
    .order('id', { ascending: false })
    .limit(1);
    
  if (error) {
    console.error('Error getting next session ID:', error);
    return Date.now();
  }
  
  return (data && data.length > 0) ? data[0].id + 1 : 1;
};

export const loadSessions = async (): Promise<Session[]> => {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (data) {
    return data.map(session => ({
      ...session,
      user_id: session.user_id || 123
    }));
  }

  return [];
};

export const updateSessionName = async (sessionId: number, sessionName: string): Promise<boolean> => {
  const { error } = await supabase
    .from('sessions')
    .update({ session_name: sessionName })
    .eq('id', sessionId);

  return !error;
};

export const deleteSession = async (sessionId: number): Promise<boolean> => {
  // First, delete all messages associated with this session
  const { error: messagesError } = await supabase
    .from('messages')
    .delete()
    .eq('session_id', sessionId);

  if (messagesError) {
    throw new Error(`메시지 삭제 실패: ${messagesError.message}`);
  }

  // Then delete the session itself
  const { error: sessionError } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId);

  if (sessionError) {
    throw new Error(`세션 삭제 실패: ${sessionError.message}`);
  }

  return true;
};
