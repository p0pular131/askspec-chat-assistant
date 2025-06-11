
import { useCallback, useState, useEffect, useRef } from 'react';
import { Session, ApiMessage } from '../types/sessionTypes';
import { getSessionMessages } from '../services/sessionApiService';
import { responseModules } from '../modules/responseModules';
import { toast } from '../components/ui/use-toast';

export function useMessageActions(currentSession: Session | null) {
  const [dbMessages, setDbMessages] = useState<ApiMessage[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  // 메시지 로드
  const loadMessages = useCallback(async (sessionId: string) => {
    if (!sessionId || isLoadingRef.current) return;
    
    isLoadingRef.current = true;
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
      isLoadingRef.current = false;
    }
  }, []);

  // 주기적으로 메시지 로드하는 함수
  const startPeriodicMessageLoading = useCallback((sessionId: string) => {
    // 기존 interval 정리
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // 새로운 interval 시작 (2초마다 로드)
    intervalRef.current = setInterval(() => {
      loadMessages(sessionId);
    }, 2000);
    
    console.log('[⏰ 주기적 메시지 로드] 시작:', sessionId);
  }, [loadMessages]);

  // 주기적 로딩 중지
  const stopPeriodicMessageLoading = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[⏹️ 주기적 메시지 로드] 중지');
    }
  }, []);

  // 세션이 변경되면 주기적 로딩 관리
  useEffect(() => {
    if (currentSession?.id) {
      startPeriodicMessageLoading(String(currentSession.id));
    } else {
      stopPeriodicMessageLoading();
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      stopPeriodicMessageLoading();
    };
  }, [currentSession, startPeriodicMessageLoading, stopPeriodicMessageLoading]);

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
  }, [currentSession]);

  return {
    dbMessages,
    msgLoading,
    sendMessage,
    loadMessages,
    startPeriodicMessageLoading,
    stopPeriodicMessageLoading
  };
}
