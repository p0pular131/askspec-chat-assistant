
import { useCallback } from 'react';
import { useMessages } from './useMessages';
import { toast } from '../components/ui/use-toast';
import { Session } from './useConversations';

export function useMessageActions(currentSession: Session | null) {
  const { 
    messages: dbMessages, 
    loading: msgLoading, 
    addMessage, 
    loadMessages, 
    callOpenAI 
  } = useMessages(currentSession?.id?.toString() || null);

  const sendMessage = useCallback(async (
    text: string, 
    expertiseLevel: string = 'intermediate',
    chatMode: string = '범용 검색',
    onSuccess?: () => void
  ) => {
    if (!text.trim()) return;
    
    // Validate session before proceeding
    if (!currentSession || !currentSession.id) {
      console.error('sendMessage called without valid session:', currentSession);
      toast({
        title: "오류",
        description: "세션이 없습니다. 페이지를 새로고침해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('sendMessage called with session:', currentSession.id);
      
      // Add user message with the current chatMode
      console.log('Adding user message to database...');
      const userMessage = await addMessage(text, 'user', currentSession.id.toString(), chatMode, expertiseLevel);
      
      if (!userMessage) {
        throw new Error('Failed to add user message');
      }
      
      console.log('User message added, preparing API call...');
      
      // Create messages array from existing messages plus the new one
      const apiMessages = [...dbMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.input_text
      }));
      
      console.log('API messages prepared:', apiMessages.length, 'messages');
      
      try {
        console.log('Calling OpenAI with messages and chatMode:', chatMode);
        // Get response using the API
        const response = await callOpenAI(apiMessages, chatMode, expertiseLevel);
        
        console.log('Response received:', response ? 'success' : 'empty');
        
        // Add assistant response to database with the current chatMode and expertiseLevel
        if (response) {
          const assistantMessage = await addMessage(response, 'assistant', currentSession.id.toString(), chatMode, expertiseLevel);
          
          if (!assistantMessage) {
            throw new Error('Failed to add assistant message');
          }
          
          console.log('Assistant message added successfully');
          
          // Call the onSuccess callback if provided
          if (onSuccess) {
            onSuccess();
          }
        } else {
          console.error("Empty response received");
          toast({
            title: "오류",
            description: "응답을 받지 못했습니다.",
            variant: "destructive",
          });
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        toast({
          title: "오류",
          description: `응답 오류: ${apiError instanceof Error ? apiError.message : '알 수 없는 오류'}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "오류",
        description: `메시지 전송 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      });
    }
  }, [currentSession, addMessage, callOpenAI, dbMessages]);

  return {
    dbMessages,
    msgLoading,
    sendMessage,
    loadMessages
  };
}
