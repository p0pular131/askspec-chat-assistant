
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { toast } from '../components/ui/use-toast';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setConversations(data || []);
      console.log('Fetched conversations:', data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string) => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ title })
        .select()
        .single();
      
      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      // First, delete all messages associated with this conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', id);
      
      if (messagesError) {
        console.error('Error deleting associated messages:', messagesError);
        throw messagesError;
      }
      
      // After deleting messages, delete the conversation itself
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
      
      if (conversationError) {
        console.error('Error deleting conversation:', conversationError);
        throw conversationError;
      }
      
      // Update the local state to remove the deleted conversation
      setConversations(prev => prev.filter(convo => convo.id !== id));
      
      toast({
        title: "성공",
        description: "대화가 삭제되었습니다.",
      });
      
      return true;
    } catch (err) {
      console.error('Error in deleteConversation:', err);
      
      toast({
        title: "오류",
        description: "대화 삭제에 실패했습니다.",
        variant: "destructive",
      });
      
      throw err;
    }
  };

  const updateTitleFromFirstMessage = async (conversationId: string, message: string) => {
    try {
      console.log("Generating title from message:", message);
      
      // Call the edge function to generate a concise title
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages: [{ role: 'user', content: message }],
          generateTitleOnly: true,
          chatMode: '범용 검색',
          expertiseLevel: 'intermediate'
        },
      });
      
      if (error) {
        console.error("Error invoking title generation:", error);
        // Fallback to simple title generation
        const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
        await updateConversationTitle(conversationId, title);
        return;
      }
      
      // If we got a title back, use it
      if (data && data.title) {
        console.log("Generated title:", data.title);
        await updateConversationTitle(conversationId, data.title);
      } else {
        // Fallback to simple title generation
        const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
        await updateConversationTitle(conversationId, title);
      }
    } catch (err) {
      console.error('Error updating conversation title:', err);
      // Fallback to simple title generation
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      await updateConversationTitle(conversationId, title);
    }
  };
  
  const updateConversationTitle = async (conversationId: string, title: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', conversationId);
      
      if (error) throw error;
      
      // Update the local state
      setConversations(prev => 
        prev.map(convo => 
          convo.id === conversationId ? { ...convo, title } : convo
        )
      );
    } catch (err) {
      console.error('Error updating conversation title in DB:', err);
    }
  };

  const deleteBuild = async (buildId: string) => {
    try {
      const { error } = await supabase
        .from('pc_builds')
        .delete()
        .eq('id', buildId);
      
      if (error) throw error;
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
    updateTitleFromFirstMessage,
    deleteBuild,
    fetchConversations
  };
}
