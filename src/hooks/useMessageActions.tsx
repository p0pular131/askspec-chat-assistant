
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
    
    try {
      // Add user message with the current chatMode
      if (currentSession) {
        await addMessage(text, 'user', currentSession.id.toString(), chatMode, expertiseLevel);
        
        // Create messages array from existing messages
        const apiMessages = dbMessages.map(msg => ({
          role: msg.role,
          content: msg.input_text
        }));
        
        // Add the new user message
        apiMessages.push({ role: 'user', content: text });
        
        try {
          // Get response using sample data
          const response = await callOpenAI(apiMessages, chatMode, expertiseLevel);
          
          // Add assistant response to database with the current chatMode and expertiseLevel
          if (response) {
            await addMessage(response, 'assistant', currentSession.id.toString(), chatMode, expertiseLevel);
            
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
