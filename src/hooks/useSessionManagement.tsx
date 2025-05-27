import { useState, useCallback, useEffect } from 'react';
import { useConversationState as useConversations } from './useConversations';
import { Session } from './useConversations';
import { toast } from '../components/ui/use-toast';

export function useSessionManagement() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [showExample, setShowExample] = useState(true);
  
  const { 
    conversations: sessions, 
    convoLoading: sessionsLoading,
    startNewConversation: createSession, 
    handleDeleteConversation: deleteSession,
    updateSession,
    loadConversations: fetchSessions,
  } = useConversations();

  // Do NOT auto-select any session on load - keep screen empty
  // This effect has been removed to implement the empty screen requirement

  const startNewConversation = useCallback(async () => {
    try {
      console.log('Creating new session...');
      const session = await createSession();
      
      if (!session) {
        throw new Error('Session creation returned null');
      }
      
      console.log('Session created successfully:', session.id);
      setCurrentSession(session);
      setShowExample(false);
      return session;
    } catch (error) {
      console.error('Error in startNewConversation:', error);
      toast({
        title: "오류",
        description: "새 세션을 시작하는데 실패했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [createSession]);

  const selectConversation = useCallback(async (session: Session) => {
    console.log('Selecting conversation:', session.id);
    setCurrentSession(session);
    setShowExample(false);
  }, []);

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      // Validate ID is a valid number before attempting to delete
      if (!isValidId(id)) {
        console.error('Invalid session ID format:', id);
        toast({
          title: "오류",
          description: "유효하지 않은 세션 ID입니다.",
          variant: "destructive",
        });
        return;
      }
      
      // Delete the session from the database
      await deleteSession(id);
      
      // If the deleted session was the current one, reset to empty screen
      if (currentSession?.id?.toString() === id) {
        setCurrentSession(null);
        setShowExample(true);
      }
      
      // Ensure sessions list is refreshed after deletion
      await fetchSessions();
      
    } catch (error) {
      console.error('Error in handleDeleteConversation:', error);
    }
  }, [currentSession, deleteSession, fetchSessions]);

  // Helper function to validate if a string is a valid number
  const isValidId = (str: string | null): boolean => {
    if (!str) return false;
    return !isNaN(parseInt(str));
  };

  return {
    currentSession,
    sessions,
    sessionsLoading,
    showExample,
    setShowExample,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    updateSession
  };
}
