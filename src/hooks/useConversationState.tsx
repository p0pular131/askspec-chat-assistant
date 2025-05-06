import { useState, useEffect } from 'react';
import { Conversation } from './useConversations';
import { Message } from '../components/types';
import { useConversations } from './useConversations';
import { useMessages } from './useMessages';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';

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
    deleteBuild,
    fetchConversations
  } = useConversations();
  
  const { 
    messages: dbMessages, 
    loading: msgLoading, 
    addMessage, 
    loadMessages, 
    callOpenAI 
  } = useMessages(currentConversation?.id || null);

  // Convert database messages to UI messages
  const syncMessagesFromDB = (dbMsgs: any[]) => {
    if (dbMsgs) {
      const uiMessages = dbMsgs.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
      }));
      setMessages(uiMessages);
    }
  };

  const startNewConversation = async () => {
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
  };

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      // Check if the conversation to delete is the current one
      const isCurrentConversation = currentConversation?.id === id;
      
      // Optimistically update the UI
      if (isCurrentConversation) {
        setCurrentConversation(null);
        setMessages([]);
        setShowExample(true);
      }
      
      // Delete the conversation from database
      await deleteConversation(id);
      
    } catch (error) {
      console.error('Error in handleDeleteConversation:', error);
      toast({
        title: "오류",
        description: "대화 삭제에 실패했습니다.",
        variant: "destructive",
      });
      
      // Refresh the conversation list to ensure UI is in sync with DB
      await fetchConversations();
    }
  };

  const handleDeleteBuild = async (buildId: string) => {
    try {
      await deleteBuild(buildId);
    } catch (error) {
      toast({
        title: "오류",
        description: "PC 빌드 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleViewBuild = (buildId: string) => {
    navigate(`/build/${buildId}`);
  };

  const sendMessage = async (text: string, expertiseLevel: string = 'intermediate', chatMode: string = '범용 검색') => {
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
  };

  return {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations,
    convoLoading,
    msgLoading,
    dbMessages,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild,
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    setShowExample
  };
}
