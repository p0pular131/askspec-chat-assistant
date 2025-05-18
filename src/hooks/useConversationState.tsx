import { useState, useEffect, useCallback } from 'react';
import { Session } from './useConversations';
import { Message } from '../components/types';
import { useConversationState as useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';

// Helper function to validate if a string is a valid number
const isValidId = (str: string | null): boolean => {
  if (!str) return false;
  return !isNaN(parseInt(str));
};

export function useConversationState() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExample, setShowExample] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshTriggered, setAutoRefreshTriggered] = useState(false);
  
  const navigate = useNavigate();
  
  const { 
    conversations: sessions, 
    convoLoading: sessionsLoading, 
    startNewConversation: createSession, 
    handleDeleteConversation: deleteSession,
    updateSession,
    loadConversations: fetchSessions,
    builds,
    handleDeleteBuild: deleteBuild,
    handleViewBuild: viewBuildFromHook, // Renamed to avoid duplication
    loadBuilds
  } = useConversations();
  
  const { 
    messages: dbMessages, 
    loading: msgLoading, 
    addMessage, 
    loadMessages, 
    callOpenAI 
  } = useMessages(currentSession?.id?.toString() || null);

  // Convert database messages to UI messages
  const syncMessagesFromDB = useCallback((dbMsgs: any[]) => {
    if (dbMsgs) {
      const uiMessages = dbMsgs.map(msg => ({
        text: msg.input_text,
        isUser: msg.role === 'user',
        chatMode: msg.chat_mode || '범용 검색', // Use the stored chat mode or default
      }));
      setMessages(uiMessages);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    try {
      const session = await createSession();
      setCurrentSession(session);
      setMessages([]);
      setShowExample(true);
    } catch (error) {
      toast({
        title: "오류",
        description: "새 세션을 시작하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [createSession]);

  const selectConversation = useCallback(async (session: Session) => {
    setCurrentSession(session);
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
      
      // If the deleted session was the current one, reset the current session
      if (currentSession?.id?.toString() === id) {
        setCurrentSession(null);
        setMessages([]);
        setShowExample(true);
      }
      
      // Ensure sessions list is refreshed after deletion
      await fetchSessions();
      
    } catch (error) {
      console.error('Error in handleDeleteConversation:', error);
    }
  }, [currentSession, deleteSession, fetchSessions]);

  const handleDeleteBuild = useCallback(async (buildId: string) => {
    try {
      const result = await deleteBuild(buildId);
      if (result) {
        // Handled in useConversations, no need to reload here
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "견적 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [deleteBuild]);

  // Define our own handleViewBuild that uses navigation
  const handleViewBuild = useCallback((buildId: string) => {
    navigate(`/build/${buildId}`);
  }, [navigate]);

  const sendMessage = useCallback(async (text: string, expertiseLevel: string = 'intermediate', chatMode: string = '범용 검색') => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create a new conversation if none exists
      if (!currentSession) {
        const newSession = await createSession();
        setCurrentSession(newSession);
        
        if (!newSession || !newSession.id) {
          throw new Error('Failed to create session');
        }
        
        // Add user message with the current chatMode
        await addMessage(text, 'user', newSession.id.toString(), chatMode);
        
        // Update the title based on the first message
        await updateSession(newSession.id, text.substring(0, 50));
        
        try {
          // Reset the auto-refresh flag
          setAutoRefreshTriggered(false);
          
          // Process the message according to the selected chat mode
          const response = await callOpenAI([{ role: 'user', content: text }], chatMode, expertiseLevel);
          
          // Add assistant response to database with the current chatMode
          if (response) {
            await addMessage(response, 'assistant', newSession.id.toString(), chatMode);
            
            // Schedule multiple build refreshes after receiving a response
            setTimeout(() => loadBuilds(), 1000);
            setTimeout(() => loadBuilds(), 3000);
            setTimeout(() => {
              loadBuilds();
              setAutoRefreshTriggered(true);
            }, 6000);
          } else {
            console.error("Empty response received");
            toast({
              title: "오류",
              description: "AI 응답을 받지 못했습니다.",
              variant: "destructive",
            });
          }
        } catch (apiError) {
          console.error("API error:", apiError);
          toast({
            title: "오류",
            description: `AI 응답 오류: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`,
            variant: "destructive",
          });
        }
      } else {
        // Add user message with the current chatMode
        await addMessage(text, 'user', currentSession.id.toString(), chatMode);
        
        // If this is the first message, update the title
        if (dbMessages.length === 0) {
          await updateSession(currentSession.id, text.substring(0, 50));
        }
        
        // Create messages array from existing messages
        const apiMessages = dbMessages.map(msg => ({
          role: msg.role,
          content: msg.input_text
        }));
        
        // Add the new user message
        apiMessages.push({ role: 'user', content: text });
        
        try {
          // Reset the auto-refresh flag
          setAutoRefreshTriggered(false);
          
          // Get response using the selected chat mode
          const response = await callOpenAI(apiMessages, chatMode, expertiseLevel);
          
          // Add assistant response to database with the current chatMode
          if (response) {
            await addMessage(response, 'assistant', currentSession.id.toString(), chatMode);
            
            // Schedule multiple build refreshes after receiving a response
            setTimeout(() => loadBuilds(), 1000);
            setTimeout(() => loadBuilds(), 3000);
            setTimeout(() => {
              loadBuilds();
              setAutoRefreshTriggered(true);
            }, 6000);
          } else {
            console.error("Empty response received");
            toast({
              title: "오류",
              description: "AI 응답을 받지 못했습니다.",
              variant: "destructive",
            });
          }
        } catch (apiError) {
          console.error("API error:", apiError);
          toast({
            title: "오류",
            description: `AI 응답 오류: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`,
            variant: "destructive",
          });
        }
      }
      
      setShowExample(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "오류",
        description: `메시지 전송 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentSession, 
    createSession, 
    addMessage, 
    updateSession, 
    callOpenAI, 
    dbMessages,
    loadBuilds
  ]);

  // Sync messages from database when dbMessages change
  useEffect(() => {
    syncMessagesFromDB(dbMessages);
  }, [dbMessages, syncMessagesFromDB]);

  return {
    currentConversation: currentSession,
    messages,
    showExample,
    isLoading,
    conversations: sessions,
    convoLoading: sessionsLoading,
    msgLoading,
    dbMessages,
    builds,
    buildsLoading: false, // Define buildsLoading to match the interface
    startNewConversation,
    selectConversation: setCurrentSession,
    handleDeleteConversation: deleteSession,
    handleDeleteBuild,
    handleViewBuild: viewBuildFromHook, // Use our local implementation
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    loadBuilds, // Use the loadBuilds from useConversations
    setShowExample
  };
}
