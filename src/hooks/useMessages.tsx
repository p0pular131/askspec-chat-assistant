
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async (convoId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at');
      
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (content: string, role: 'user' | 'assistant', convoId: string) => {
    try {
      const newMessage = {
        conversation_id: convoId,
        content,
        role,
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
      
      if (error) throw error;
      
      // Update local state with the newly added message
      if (data && data[0]) {
        setMessages(prevMessages => [...prevMessages, data[0]]);
      }
    } catch (err) {
      console.error('Error adding message:', err);
      throw err;
    }
  };

  const callOpenAI = async (messages: { role: string; content: string }[], chatMode: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          messages,
          chatMode,
          conversationId, // Pass the conversation ID to the function
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to call OpenAI API');
      }
      
      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error('Error calling OpenAI:', err);
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
  }, [conversationId]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
    callOpenAI,
  };
}
