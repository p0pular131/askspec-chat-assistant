
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/use-toast';

export interface Session {
  id: number;
  session_name: string;
  created_at: string;
}

// Helper function to validate if a string is a valid number
const isValidId = (id: string | null): boolean => {
  if (!id) return false;
  return !isNaN(parseInt(id));
};

export function useConversations() {
  const [conversations, setConversations] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setConversations(data || []);
      console.log('Fetched sessions:', data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (sessionName: string) => {
    try {
      // Get the next available ID
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('sessions')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
        
      if (maxIdError) throw maxIdError;
      
      const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
      
      const { data, error } = await supabase
        .from('sessions')
        .insert({ 
          id: nextId,
          session_name: sessionName,
          device_id: 'web-app'  // Default device ID
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      // Validate that the ID is a proper number before proceeding
      if (!isValidId(id)) {
        console.error('Invalid session ID format:', id);
        toast({
          title: "오류",
          description: "유효하지 않은 세션 ID입니다.",
          variant: "destructive",
        });
        return false;
      }
      
      const sessionId = parseInt(id);
      console.log('Deleting session and all associated messages for ID:', sessionId);
      
      // First, delete all messages associated with this session
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('session_id', sessionId);
      
      if (messagesError) {
        console.error('Error deleting associated messages:', messagesError);
        throw messagesError;
      }
      
      // After deleting messages, delete the session itself
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId);
      
      if (sessionError) {
        console.error('Error deleting session:', sessionError);
        throw sessionError;
      }
      
      // Update the local state to remove the deleted session
      setConversations(prev => prev.filter(convo => convo.id !== sessionId));
      
      toast({
        title: "성공",
        description: "세션이 삭제되었습니다.",
      });
      
      return true;
    } catch (err) {
      console.error('Error in deleteConversation:', err);
      
      toast({
        title: "오류",
        description: "세션 삭제에 실패했습니다.",
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const updateSessionName = async (sessionId: number, sessionName: string) => {
    try {
      console.log("Updating session name:", sessionName);
      
      const { error } = await supabase
        .from('sessions')
        .update({ session_name: sessionName })
        .eq('id', sessionId);
      
      if (error) throw error;
      
      // Update the local state
      setConversations(prev => 
        prev.map(session => 
          session.id === sessionId ? { ...session, session_name: sessionName } : session
        )
      );
    } catch (err) {
      console.error('Error updating session name in DB:', err);
    }
  };

  const deleteBuild = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', buildId);
      
      if (error) throw error;

      toast({
        title: "성공",
        description: "견적이 삭제되었습니다.",
      });
    } catch (err) {
      console.error('Error deleting build:', err);
      throw err;
    }
  };

  return { 
    conversations, 
    loading, 
    createConversation, 
    deleteConversation, 
    updateSessionName,
    deleteBuild,
    fetchConversations
  };
}
