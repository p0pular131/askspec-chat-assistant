
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Conversation {
  id: string;
  title: string;
  user_id: string;
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
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      await loadConversations();
    } catch (err) {
      console.error('Error deleting conversation:', err);
      throw err;
    }
  };

  useEffect(() => {
    const session = supabase.auth.getSession();
    if (session) {
      loadConversations();
    }
  }, []);

  return {
    conversations,
    loading,
    error,
    loadConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
  };
}
