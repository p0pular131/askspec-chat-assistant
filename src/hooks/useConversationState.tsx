
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

  // Wrap the sendMessage function to handle loading state and more
  const sendMessage = useCallback(async (text: string, expertiseLevel: string = 'intermediate', chatMode: string = '범용 검색') => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create a new conversation if none exists
      if (!currentSession) {
        const newSession = await startNewConversation();
        
        if (!newSession || !newSession.id) {
          throw new Error('Failed to create session');
        }
        
        // Add user message with the current chatMode
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
        
        // Update the title based on the first message
        await updateSession(newSession.id, text.substring(0, 50));
      } else {
        // If this is the first message, update the title
        if (dbMessages.length === 0) {
          await updateSession(currentSession.id, text.substring(0, 50));
        }
        
        // Send the message with the current session
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
      }
      
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
    buildsLoading: false, // Define buildsLoading to match the interface
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild: viewBuildFromHook, // Use our local implementation
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    loadBuilds, // Use the loadBuilds from useConversations
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
