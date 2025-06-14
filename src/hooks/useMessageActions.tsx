
import { useCallback, useState } from 'react';
import { Session, ApiMessage } from '../types/sessionTypes';
import { getSessionMessages } from '../services/sessionApiService';
import { responseModules } from '../modules/responseModules';
import { toast } from '../components/ui/use-toast';

/**
 * useMessageActions - 메시지 처리 전용 훅
 * 
 * 이 훅은 메시지의 실제 전송과 AI 응답 처리를 담당합니다.
 * useConversationState에서 사용되며, 순수한 메시지 로직에만 집중합니다.
 * 
 * 주요 기능:
 * 1. 메시지 로드 - DB에서 세션의 메시지들을 가져옴
 * 2. 메시지 전송 - 각 채팅 모드에 맞는 AI API 호출
 * 3. 응답 처리 - AI 응답을 받아서 DB에 저장하고 UI에 반영
 * 
 * 지원하는 채팅 모드:
 * - 범용 검색: 일반적인 질의응답
 * - 견적 추천: PC 견적 추천
 * - 부품 추천: 개별 부품 추천
 * - 호환성 검사: 부품간 호환성 확인
 * - 견적 평가: 기존 견적 평가
 * - 스펙 업그레이드: 업그레이드 제안
 * 
 * @param currentSession - 현재 활성 세션
 */
export function useMessageActions(currentSession: Session | null) {
  // DB에서 로드된 메시지 목록
  const [dbMessages, setDbMessages] = useState<ApiMessage[]>([]);
  
  // 메시지 로딩 상태
  const [msgLoading, setMsgLoading] = useState(false);

  /**
   * 세션의 메시지 로드 함수
   * 
   * 플로우:
   * 1. API를 통해 세션의 모든 메시지 가져오기
   * 2. 시간순으로 정렬 (오래된 것부터)
   * 3. 상태에 저장
   * 
   * @param sessionId - 로드할 세션 ID (문자열)
   */
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

  /**
   * 메시지 전송 및 AI 응답 처리 함수
   * 
   * 전체 플로우:
   * 1. 현재 메시지 로드 (전송 전 상태 동기화)
   * 2. 채팅 모드에 맞는 responseModule 선택
   * 3. AI API 호출하여 응답 생성
   * 4. 응답 완료 후 메시지 다시 로드
   * 5. 성공 콜백 실행 (빌드 관련 후처리)
   * 
   * @param text - 전송할 메시지 텍스트
   * @param expertiseLevel - 전문가 수준 (기본값: 'intermediate')
   * @param chatMode - 채팅 모드 (기본값: '범용 검색')
   * @param sessionToUse - 사용할 세션 (없으면 currentSession 사용)
   * @param onSuccess - 성공시 실행할 콜백 함수
   */
  const sendMessage = useCallback(async (
    text: string, 
    expertiseLevel: string = 'intermediate',
    chatMode: string = '범용 검색',
    sessionToUse?: Session,
    onSuccess?: () => void
  ) => {
    if (!text.trim()) return;
    
    const session = sessionToUse || currentSession;
    
    // 세션 유효성 검사
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
    
    // 메시지 전송 전에 현재 상태 로드
    console.log('[🔄 메시지 전송 전 로드] 시작');
    await loadMessages(String(session.id));
    console.log('[✅ 메시지 전송 전 로드] 완료');
    
    try {
      console.log('[🔄 메시지 전송] 시작:', { sessionId: session.id, chatMode });
      
      // 선택된 채팅 모드에 해당하는 모듈 가져오기
      const selectedModule = responseModules[chatMode];
      
      if (!selectedModule) {
        throw new Error(`지원하지 않는 채팅 모드: ${chatMode}`);
      }
      
      // 해당 모듈의 API를 호출하여 메시지 처리
      // 각 모듈은 사용자 메시지를 DB에 저장하고 AI 응답을 생성하여 저장
      await selectedModule.process(text, expertiseLevel, String(session.id));
      
      console.log('[✅ 메시지 전송] 완료');
      
      // 메시지 전송 후 즉시 세션의 모든 메시지를 다시 로드
      console.log('[🔄 메시지 재로드] 시작');
      await loadMessages(String(session.id));
      console.log('[✅ 메시지 재로드] 완료');
      
      // 성공 콜백 실행 (주로 빌드 관련 후처리 작업)
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

  /**
   * 훅에서 제공하는 상태와 함수들 반환
   */
  return {
    // DB 메시지 목록
    dbMessages,
    
    // 로딩 상태
    msgLoading,
    
    // 액션 함수들
    sendMessage,    // 메시지 전송 및 AI 응답 처리
    loadMessages    // 메시지 로드
  };
}
