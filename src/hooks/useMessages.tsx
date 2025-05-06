
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface DatabaseMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

// Interface for raw message data from the database
interface RawDatabaseMessage {
  id: string;
  conversation_id: string;
  content: string;
  role: string;
  created_at: string;
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to convert raw message data to our DatabaseMessage interface
  const convertRawMessage = (rawMessage: RawDatabaseMessage): DatabaseMessage => {
    // Validate that role is either 'user' or 'assistant'
    const validRole = (rawMessage.role === 'user' || rawMessage.role === 'assistant') 
      ? rawMessage.role 
      : 'user'; // Default to user if for some reason we get an invalid role
      
    return {
      id: rawMessage.id,
      conversation_id: rawMessage.conversation_id,
      content: rawMessage.content,
      role: validRole,
      created_at: rawMessage.created_at
    };
  };

  const loadMessages = async (convoId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: rawData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at');
      
      if (error) throw error;
      
      // Transform the raw data to match our DatabaseMessage interface
      const transformedMessages = (rawData || []).map(convertRawMessage);
      setMessages(transformedMessages);
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
      
      const { data: rawMessage, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select();
      
      if (error) throw error;
      
      // Update local state with the newly added message
      if (rawMessage && rawMessage[0]) {
        const transformedMessage = convertRawMessage(rawMessage[0]);
        setMessages(prevMessages => [...prevMessages, transformedMessage]);
      }
    } catch (err) {
      console.error('Error adding message:', err);
      throw err;
    }
  };

  const callOpenAI = async (
    messages: { role: string; content: string }[], 
    chatMode: string,
    expertiseLevel: string = 'intermediate'
  ) => {
    try {
      console.log("Calling OpenAI with messages:", messages);
      
      // Use supabase.functions.invoke instead of making a direct fetch request
      const { data, error } = await supabase.functions.invoke('chat-completion', {
        body: {
          messages,
          chatMode,
          conversationId,
          expertiseLevel,
        },
      });
      
      if (error) {
        console.error('Error invoking chat-completion function:', error);
        throw new Error(error.message || 'Failed to call OpenAI API');
      }
      
      console.log("Got response from OpenAI:", data?.response?.substring(0, 100) + "...");
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
