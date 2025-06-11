
import { useCallback, useState } from 'react';
import { Session, ApiMessage } from '../types/sessionTypes';
import { getSessionMessages } from '../services/sessionApiService';
import { responseModules } from '../modules/responseModules';
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

  // 메시지 전송 (각 chat mode별 API 사용으로 변경)
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
    
    setMsgLoading(true);
    
    try {
      console.log('[🔄 메시지 전송] 시작:', { sessionId: session.id, chatMode });
      
      // 선택된 chat mode에 해당하는 모듈 가져오기
      const selectedModule = responseModules[chatMode];
      
      if (!selectedModule) {
        throw new Error(`지원하지 않는 채팅 모드: ${chatMode}`);
      }
      
      // 해당 모듈의 API를 호출하여 메시지 처리
      await selectedModule.process(text, expertiseLevel, String(session.id));
      
      console.log('[✅ 메시지 전송] 완료');
      
      // 메시지 전송 후 즉시 세션의 모든 메시지를 다시 로드
      console.log('[🔄 메시지 재로드] 시작');
      await loadMessages(String(session.id));
      console.log('[✅ 메시지 재로드] 완료');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('[❌ 메시지 전송] 실패:', error);
      toast({
        title: "오류",
        description: `메시지 전송 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
        variant: "destructive",
      });
    } finally {
      setMsgLoading(false);
    }
  }, [currentSession, loadMessages]);

  return {
    dbMessages,
    msgLoading,
    sendMessage,
    loadMessages
  };
}
