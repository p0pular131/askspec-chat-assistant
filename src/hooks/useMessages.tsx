
import { useState, useEffect, useCallback } from 'react';
import { DatabaseMessage } from '../types/messages';
import { loadMessagesForSession, addMessageToDatabase, processMessage } from '../services/messageService';

export type { DatabaseMessage };

export function useMessages(sessionId: string | null) {
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async (sessionIdStr: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await loadMessagesForSession(sessionIdStr);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMessage = async (
    content: string, 
    role: 'user' | 'assistant', 
    sessionIdStr: string,
    chatMode: string = '범용 검색'
  ) => {
    const newMessage = await addMessageToDatabase(content, role, sessionIdStr, chatMode);
    if (newMessage) {
      setMessages(prevMessages => [...prevMessages, newMessage]);
    }
    return newMessage;
  };

  const callOpenAI = async (
    messages: { role: string; content: string }[], 
    chatMode: string,
    expertiseLevel: string = 'intermediate'
  ) => {
    return await processMessage(messages, chatMode, sessionId, expertiseLevel);
  };

  useEffect(() => {
    if (sessionId) {
      loadMessages(sessionId);
    } else {
      setMessages([]);
      setLoading(false);
    }
  }, [sessionId, loadMessages]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    addMessage,
    callOpenAI,
  };
}
