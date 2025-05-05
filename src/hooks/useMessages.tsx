
import { useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface ChatMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = async (convoId: string) => {
    if (!convoId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at');
      
      if (error) throw error;
      
      // Explicitly cast the data to ensure type safety
      const typedMessages = data?.map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant'
      })) || [];
      
      setMessages(typedMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addMessage = async (content: string, role: 'user' | 'assistant', convoId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: convoId,
          content,
          role
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Ensure the response has the correct type
      const typedMessage: ChatMessage = {
        ...data,
        role: data.role as 'user' | 'assistant'
      };
      
      // Add the message to state immediately
      setMessages(prev => [...prev, typedMessage]);
      return typedMessage;
    } catch (err) {
      console.error('Error adding message:', err);
      throw err;
    }
  };

  const callOpenAI = async (messages: { role: string; content: string }[], chatMode: string) => {
    try {
      const response = await supabase.functions.invoke('chat-completion', {
        body: { messages, chatMode }
      });
      
      if (response.error) throw new Error(response.error.message || 'Error calling OpenAI');
      
      return response.data.response;
    } catch (err) {
      console.error('Error calling OpenAI:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
    callOpenAI
  };
}
