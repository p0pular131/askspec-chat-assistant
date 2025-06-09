
import { useCallback, useState } from 'react';
import { Session, ApiMessage, UIMessage } from '../types/sessionTypes';
import { getSessionMessages } from '../services/sessionApiService';
import { processMessage } from '../services/messageService';
import { toast } from '../components/ui/use-toast';

export function useMessageActions(currentSession: Session | null) {
  const [dbMessages, setDbMessages] = useState<ApiMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  // 메시지 로드
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId) return;
    
    setMsgLoading(true);
    try {
      console.log('[🔄 메시지 로드] API 호출 시작:', sessionId);
      const numericId = parseInt(sessionId, 10);
      const messages = await getSessionMessages(numericId);
      console.log('[✅ 메시지 로드] API 응답 성공:', messages.length, '개 메시지');
      
      // 메시지를 생성 시간 순으로 정렬 (오래된 것부터 최신 순)
      const sortedMessages = messages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setDbMessages(sortedMessages);
    } catch (error) {
      console.error('[❌ 메시지 로드] 실패:', error);
      toast({
        title: "오류",
        description: "메시지를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      setDbMessages([]);
    } finally {
      setMsgLoading(false);
    }
  }, []);

  // 메시지 전송 (기존 로직 유지)
  const sendMessage = useCallback(async (
    text: string, 
    expertiseLevel: string = 'intermediate',
    chatMode: string = '범용 검색',
    sessionToUse?: Session,
    onSuccess?: () => void
  ) => {
    if (!text.trim()) return;
    
    const session = sessionToUse || currentSession;
    
    if (!session || !session.id) {
      console.error('[❌ 메시지 전송] 세션 없음:', session);
      toast({
        title: "오류",
        description: "세션이 없습니다. 페이지를 새로고침해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      console.log('[🔄 메시지 전송] 시작:', { sessionId: session.id, chatMode });
      
      // 사용자 메시지를 로컬 상태에 추가
      const userMessage: ApiMessage = {
        content: text,
        role: 'user',
        mode: chatMode,
        id: Date.now(), // 임시 ID
        session_id: session.id,
        created_at: new Date().toISOString()
      };
      
      setDbMessages(prevMessages => [...prevMessages, userMessage]);
      
      // API 메시지 배열 생성
      const apiMessages = [...dbMessages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      console.log('[🔄 메시지 처리] API 호출 시작');
      // 응답 생성
      const response = await processMessage(apiMessages, chatMode, session.id.toString(), expertiseLevel);
      
      if (response) {
        // 응답을 JSON으로 파싱 시도하여 로드된 메시지와 동일한 구조로 만들기
        let processedResponse = response;
        
        try {
          const parsedResponse = JSON.parse(response);
          
          // 만약 응답이 JSON이고 response_type이 있다면, 로드된 메시지와 동일한 구조로 변환
          if (parsedResponse && parsedResponse.response_type) {
            console.log('[🔄 응답 구조 변환] JSON 응답을 로드된 메시지 구조로 변환');
            
            // 로드된 메시지에서 사용하는 구조로 변환
            const structuredResponse = {
              response_type: parsedResponse.response_type,
              response: parsedResponse.response || parsedResponse,
              id: parsedResponse.id, // estimateId 보존
              chat_mode: chatMode,
              expertise_level: expertiseLevel,
              ...parsedResponse // 기타 모든 필드 보존
            };
            
            processedResponse = JSON.stringify(structuredResponse);
          }
        } catch (parseError) {
          // JSON 파싱 실패시 원본 응답 사용
          console.log('[ℹ️ 응답 처리] JSON이 아닌 응답, 원본 사용');
        }
        
        // 어시스턴트 응답을 로컬 상태에 추가
        const assistantMessage: ApiMessage = {
          content: processedResponse,
          role: 'assistant',
          mode: chatMode,
          id: Date.now() + 1, // 임시 ID
          session_id: session.id,
          created_at: new Date().toISOString()
        };
        
        setDbMessages(prevMessages => [...prevMessages, assistantMessage]);
        console.log('[✅ 메시지 처리] 완료');
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        console.error("[❌ 메시지 처리] 빈 응답");
        toast({
          title: "오류",
          description: "응답을 받지 못했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[❌ 메시지 전송] 실패:', error);
      toast({
        title: "오류",
        description: `메시지 전송 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      });
    }
  }, [dbMessages, currentSession]);

  return {
    dbMessages,
    msgLoading,
    sendMessage,
    loadMessages
  };
}
