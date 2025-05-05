
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      setConversations(data || []);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (title: string = 'New Conversation') => {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert({ title })
        .select()
        .single();
      
      if (error) throw error;
      
      await loadConversations();
      return data;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const updateConversationTitle = async (id: string, title: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      await loadConversations();
    } catch (err) {
      console.error('Error updating conversation title:', err);
      throw err;
    }
  };

  const deleteConversation = async (id: string) => {
    try {
      // First delete all messages associated with this conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', id);
      
      if (messagesError) throw messagesError;
      
      // Then delete the conversation
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update the local state without having to reload
      setConversations(conversations.filter(convo => convo.id !== id));
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  };

  // Function to create a title summary from the first user message
  const updateTitleFromFirstMessage = async (conversationId: string, message: string) => {
    try {
      // Create a simple summary (truncate to 50 chars if too long)
      const summary = message.length > 50 ? message.substring(0, 47) + '...' : message;
      
      await updateConversationTitle(conversationId, summary);
    } catch (err) {
      console.error('Error updating conversation title from message:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
    updateTitleFromFirstMessage,
  };
}
