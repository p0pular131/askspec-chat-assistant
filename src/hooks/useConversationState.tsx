
import { useState, useEffect, useCallback } from 'react';
import { Conversation } from './useConversations';
import { Message } from '../components/types';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useBuilds } from './useBuilds';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';

// Helper function to validate if a string is a valid UUID
const isUUID = (str: string | null): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export function useConversationState() {
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExample, setShowExample] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  
  const { 
    conversations, 
    loading: convoLoading, 
    createConversation, 
    deleteConversation,
    updateTitleFromFirstMessage,
    fetchConversations
  } = useConversations();
  
  const {
    builds,
    loading: buildsLoading,
    loadBuilds,
    deleteBuild
  } = useBuilds();
  
  const { 
    messages: dbMessages, 
    loading: msgLoading, 
    addMessage, 
    loadMessages, 
    callOpenAI 
  } = useMessages(currentConversation?.id || null);

  // Convert database messages to UI messages
  const syncMessagesFromDB = useCallback((dbMsgs: any[]) => {
    if (dbMsgs) {
      const uiMessages = dbMsgs.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
      }));
      setMessages(uiMessages);
    }
  }, []);

  const startNewConversation = useCallback(async () => {
    try {
      const conversation = await createConversation('New Conversation');
      setCurrentConversation(conversation);
      setMessages([]);
      setShowExample(true);
    } catch (error) {
      toast({
        title: "오류",
        description: "새 대화를 시작하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [createConversation]);

  const selectConversation = useCallback(async (conversation: Conversation) => {
    setCurrentConversation(conversation);
  }, []);

  const handleDeleteConversation = useCallback(async (id: string) => {
    try {
      // Validate ID is a valid UUID before attempting to delete
      if (!isUUID(id)) {
        console.error('Invalid conversation ID format:', id);
        toast({
          title: "오류",
          description: "유효하지 않은 대화 ID입니다.",
          variant: "destructive",
        });
        return;
      }
      
      // Delete the conversation from the database
      await deleteConversation(id);
      
      // If the deleted conversation was the current one, reset the current conversation
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
        setShowExample(true);
      }
      
      // Ensure conversations list is refreshed after deletion
      await fetchConversations();
      
    } catch (error) {
      console.error('Error in handleDeleteConversation:', error);
    }
  }, [currentConversation, deleteConversation, fetchConversations]);

  const handleDeleteBuild = useCallback(async (buildId: string) => {
    try {
      const result = await deleteBuild(buildId);
      if (result) {
        // Reload the builds list
        await loadBuilds();
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "PC 빌드 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [deleteBuild, loadBuilds]);

  const handleViewBuild = useCallback((buildId: string) => {
    navigate(`/build/${buildId}`);
  }, [navigate]);

  const sendMessage = useCallback(async (text: string, expertiseLevel: string = 'intermediate', chatMode: string = '범용 검색') => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create a new conversation if none exists
      if (!currentConversation) {
        const newConversation = await createConversation('New Conversation');
        setCurrentConversation(newConversation);
        
        // Add user message
        await addMessage(text, 'user', newConversation.id);
        
        // Update the title based on the first message
        await updateTitleFromFirstMessage(newConversation.id, text);
        
        // Create OpenAI messages array
        const apiMessages = [{ role: 'user', content: text }];
        
        // Get response from OpenAI, passing expertise level
        const response = await callOpenAI(apiMessages, chatMode, expertiseLevel);
        
        // Add assistant response to database
        await addMessage(response, 'assistant', newConversation.id);
        
        // Reload builds list to catch any new builds created from this conversation
        await loadBuilds();
      } else {
        // Add user message
        await addMessage(text, 'user', currentConversation.id);
        
        // If this is the first message, update the title
        if (dbMessages.length === 0) {
          await updateTitleFromFirstMessage(currentConversation.id, text);
        }
        
        // Create OpenAI messages array from existing messages
        const apiMessages = dbMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add the new user message
        apiMessages.push({ role: 'user', content: text });
        
        // Get response from OpenAI, passing expertise level
        const response = await callOpenAI(apiMessages, chatMode, expertiseLevel);
        
        // Add assistant response to database
        await addMessage(response, 'assistant', currentConversation.id);
        
        // Reload builds list to catch any new builds created from this conversation
        await loadBuilds();
      }
      
      setShowExample(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "오류",
        description: "메시지 전송에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    currentConversation, 
    createConversation, 
    addMessage, 
    updateTitleFromFirstMessage, 
    callOpenAI, 
    loadBuilds, 
    dbMessages
  ]);

  // Sync messages from database when dbMessages change
  useEffect(() => {
    syncMessagesFromDB(dbMessages);
  }, [dbMessages, syncMessagesFromDB]);

  return {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations,
    convoLoading,
    msgLoading,
    dbMessages,
    builds,
    buildsLoading,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild,
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    loadBuilds,
    setShowExample
  };
}
