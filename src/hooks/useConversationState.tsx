
import { useState, useEffect, useCallback } from 'react';
import { Message } from '../components/types';
import { useSessionManagement } from './useSessionManagement';
import { useMessageActions } from './useMessageActions';
import { useBuildActions } from './useBuildActions';
import { useChatMode } from './useChatMode';

export function useConversationState() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshTriggered, setAutoRefreshTriggered] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const {
    currentSession,
    sessions,
    sessionsLoading,
    showExample,
    setShowExample,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    updateSession
  } = useSessionManagement();
  
  const {
    dbMessages,
    msgLoading,
    sendMessage: sendMessageAction,
    loadMessages
  } = useMessageActions(currentSession);
  
  const {
    builds,
    isGeneratingBuilds,
    setIsGeneratingBuilds,
    autoSwitchDisabled,
    handleDeleteBuild,
    handleViewBuild: viewBuildFromHook,
    loadBuilds,
    checkForNewBuilds,
    disableAutoSwitch
  } = useBuildActions();
  
  const {
    chatMode,
    setChatMode,
    getExamplePrompt
  } = useChatMode();

  // Initialize the app and ensure we have a session ready
  useEffect(() => {
    const initializeApp = async () => {
      console.log('Initializing app, current session:', currentSession?.id);
      
      // If we don't have a current session and sessions have loaded, create one
      if (!currentSession && !sessionsLoading && sessions.length === 0) {
        console.log('No session found, creating new one...');
        await startNewConversation();
      }
      
      setIsInitialized(true);
    };

    if (!isInitialized) {
      initializeApp();
    }
  }, [currentSession, sessionsLoading, sessions.length, startNewConversation, isInitialized]);

  // Convert database messages to UI messages
  const syncMessagesFromDB = useCallback((dbMsgs: any[]) => {
    if (dbMsgs) {
      const uiMessages = dbMsgs.map(msg => ({
        text: msg.input_text,
        isUser: msg.role === 'user',
        chatMode: msg.chat_mode || '범용 검색',
        expertiseLevel: msg.expertise_level || 'beginner'
      }));
      setMessages(uiMessages);
    }
  }, []);

  // Enhanced sendMessage function with automatic session creation
  const sendMessage = useCallback(async (text: string, expertiseLevel: string = 'intermediate', chatMode: string = '범용 검색') => {
    if (!text.trim()) return;
    
    console.log('sendMessage called, checking session...', { currentSession: currentSession?.id });
    
    setIsLoading(true);
    
    try {
      let sessionToUse = currentSession;
      
      // If no session exists, create one first
      if (!currentSession) {
        console.log('No current session, creating new one...');
        const newSession = await startNewConversation();
        
        if (!newSession || !newSession.id) {
          throw new Error('Failed to create session');
        }
        
        sessionToUse = newSession;
        console.log('New session created:', sessionToUse.id);
      }
      
      // Ensure we have a valid session before proceeding
      if (!sessionToUse) {
        throw new Error('No session available and failed to create one');
      }
      
      console.log('Using session for message:', sessionToUse.id);
      
      // Update the title based on the first message immediately
      if (!currentSession || dbMessages.length === 0) {
        await updateSession(sessionToUse.id, text.substring(0, 50));
      }
      
      // Send the message with the confirmed session
      await sendMessageAction(text, expertiseLevel, chatMode, () => {
        // Reset the auto-refresh flag
        setAutoRefreshTriggered(false);
        
        // Schedule multiple build refreshes after receiving a response
        setTimeout(() => loadBuilds(), 1000);
        setTimeout(() => loadBuilds(), 3000);
        setTimeout(() => {
          loadBuilds();
          setAutoRefreshTriggered(true);
        }, 6000);
      });
      
      setShowExample(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentSession, 
    startNewConversation, 
    sendMessageAction, 
    updateSession, 
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
    buildsLoading: false,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild: viewBuildFromHook,
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    loadBuilds,
    setShowExample,
    chatMode,
    setChatMode,
    getExamplePrompt,
    isGeneratingBuilds,
    setIsGeneratingBuilds,
    autoSwitchDisabled,
    checkForNewBuilds,
    disableAutoSwitch
  };
}
