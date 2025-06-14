
import { useState, useEffect, useCallback } from 'react';
import { UIMessage } from '../types/sessionTypes';
import { useSessionManagement } from './useSessionManagement';
import { useMessageActions } from './useMessageActions';
import { useBuildActions } from './useBuildActions';
import { useChatMode } from './useChatMode';

/**
 * useConversationState - 전체 대화 상태 관리 훅
 * 
 * 이 훅은 채팅 애플리케이션의 모든 대화 관련 상태와 로직을 통합 관리합니다.
 * 
 * 주요 기능:
 * 1. 메시지 상태 관리 - UI 메시지와 DB 메시지 동기화
 * 2. 세션 생명 주기 관리 - 생성, 선택, 삭제
 * 3. 사용자 경험 최적화 - 즉시 응답, 로딩 상태 관리
 * 4. 빌드 자동 생성 및 전환 처리
 * 
 * 전체 플로우:
 * 1. 초기 로드 → 세션 목록 가져오기
 * 2. 메시지 전송 → 세션 생성(필요시) → AI 응답 → UI 업데이트
 * 3. 세션 전환 → 메시지 로드 → UI 동기화
 * 4. 빌드 생성 → 자동 탭 전환 (옵션)
 */
export function useConversationState() {
  // UI 메시지 상태 (사용자가 보는 메시지 목록)
  const [messages, setMessages] = useState<UIMessage[]>([]);
  
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(false);
  
  // 자동 새로고침 트리거 (빌드 생성 감지용)
  const [autoRefreshTriggered, setAutoRefreshTriggered] = useState(false);
  
  // 전송 대기 중인 사용자 메시지 (즉시 UI 표시용)
  const [pendingUserMessage, setPendingUserMessage] = useState<UIMessage | null>(null);
  
  // 세션 생성 중인지 여부
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
  /**
   * 세션 관리 훅
   * 세션 생성, 선택, 삭제, 업데이트 등의 기능 제공
   */
  const {
    currentSession,
    sessions,
    sessionsLoading,
    showExample,
    setShowExample,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    updateSession,
    fetchSessions
  } = useSessionManagement();
  
  /**
   * 메시지 액션 훅
   * 실제 메시지 전송 및 AI 응답 처리
   */
  const {
    dbMessages,
    msgLoading,
    sendMessage: sendMessageAction,
    loadMessages
  } = useMessageActions(currentSession);
  
  /**
   * 빌드 액션 훅
   * 빌드 생성, 로드, 자동 전환 등의 기능
   */
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
  
  /**
   * 채팅 모드 관리 훅
   * 견적 추천, 부품 추천, 호환성 검사 등의 모드 관리
   */
  const {
    chatMode,
    setChatMode,
    getExamplePrompt
  } = useChatMode();

  /**
   * 초기 상태로 리셋하는 함수
   * 홈 버튼 클릭시 모든 상태를 초기화
   */
  const resetToInitialState = useCallback(() => {
    setMessages([]);
    setShowExample(true);
    setIsLoading(false);
    setPendingUserMessage(null);
    setIsCreatingSession(false);
    // 현재 세션 선택 해제
    selectConversation(null);
  }, [setShowExample, selectConversation]);

  /**
   * 초기 세션 목록 로드
   * 앱 시작시 기존 세션들을 불러옴
   */
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  /**
   * API 메시지를 UI 메시지로 변환하는 동기화 함수
   * 
   * 동기화 조건:
   * - 세션 생성 중이면서 첫 메시지 전송 중이면 건너뜀
   * - 그 외에는 DB 메시지를 UI 메시지로 변환
   * 
   * @param apiMessages - DB에서 가져온 메시지 목록
   */
  const syncMessagesFromDB = useCallback((apiMessages: typeof dbMessages) => {
    // 세션 생성 중이거나 첫 번째 메시지를 보내는 중이면 DB 메시지 동기화를 건너뜀
    if (isCreatingSession && pendingUserMessage) {
      console.log('[⏸️ 메시지 동기화] 세션 생성 중이므로 건너뜀');
      return;
    }
    
    if (apiMessages) {
      // DB 메시지를 UI 메시지 형식으로 변환
      const uiMessages: UIMessage[] = apiMessages.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
        chatMode: msg.mode || '범용 검색',
        expertiseLevel: 'beginner' // 기본값
      }));
      
      console.log('[🔄 메시지 동기화] DB에서 UI로:', uiMessages.length, '개 메시지');
      
      // 대기 중인 사용자 메시지가 있으면 함께 표시
      if (pendingUserMessage) {
        setMessages([...uiMessages, pendingUserMessage]);
      } else {
        setMessages(uiMessages);
      }
    }
  }, [pendingUserMessage, isCreatingSession]);

  /**
   * 세션 변경시 메시지 로드
   * 세션이 선택되면 해당 세션의 메시지들을 불러옴
   */
  useEffect(() => {
    if (currentSession?.id) {
      console.log('[📥 세션 변경] 메시지 로드 시작:', currentSession.id);
      setPendingUserMessage(null); // 세션 변경 시 pending 메시지 초기화
      setIsCreatingSession(false);
      loadMessages(String(currentSession.id));
    } else {
      console.log('[🏠 세션 해제] 메시지 초기화');
      setMessages([]);
      setPendingUserMessage(null);
      setIsCreatingSession(false);
    }
  }, [currentSession, loadMessages]);

  /**
   * DB 메시지 변경시 UI 동기화
   * DB에서 새로운 메시지가 로드되면 UI에 반영
   */
  useEffect(() => {
    console.log('[📊 DB 메시지 변경] 길이:', dbMessages.length);
    syncMessagesFromDB(dbMessages);
  }, [dbMessages, syncMessagesFromDB]);

  /**
   * 메시지 전송 메인 함수
   * 
   * 전체 플로우:
   * 1. 세션 확인 및 생성 (필요시)
   * 2. 사용자 메시지 즉시 UI 표시
   * 3. 첫 메시지인 경우 세션 제목 업데이트
   * 4. AI 응답 요청 및 처리
   * 5. 빌드 새로고침 작업
   * 6. 상태 정리
   * 
   * @param text - 전송할 메시지 텍스트
   * @param expertiseLevel - 전문가 수준 ('beginner' | 'intermediate' | 'expert')
   * @param chatMode - 채팅 모드 (견적 추천, 부품 추천 등)
   */
  const sendMessage = useCallback(async (text: string, expertiseLevel: 'beginner' | 'intermediate' | 'expert' = 'intermediate', chatMode: string = '범용 검색') => {
    if (!text.trim()) return;
    
    console.log('[📤 메시지 전송] 시작:', { currentSession: currentSession?.id });
    
    setIsLoading(true);
    
    try {
      let sessionToUse = currentSession;
      
      // 세션이 없으면 새로 생성
      if (!currentSession) {
        console.log('[🆕 세션 생성] 첫 메시지를 위한 새 세션 생성');
        setIsCreatingSession(true);
        const newSession = await startNewConversation();
        
        if (!newSession || !newSession.id) {
          throw new Error('세션 생성 실패');
        }
        
        sessionToUse = newSession;
        console.log('[✅세션 생성] 완료:', sessionToUse.id);
      }
      
      if (!sessionToUse) {
        throw new Error('사용할 세션이 없습니다');
      }
      
      console.log('[📤 메시지 전송] 세션 사용:', sessionToUse.id);
      
      // 사용자 메시지를 pending으로 설정 (즉시 UI 표시)
      const userMessage: UIMessage = {
        text,
        isUser: true,
        chatMode,
        expertiseLevel
      };
      
      setPendingUserMessage(userMessage);
      setShowExample(false);
      
      // 첫 번째 메시지인 경우 세션 제목 즉시 업데이트
      console.log('[🔍 첫 메시지 체크] dbMessages 길이:', dbMessages.length);
      if (dbMessages.length === 0) {
        const sessionTitle = text.substring(0, 50);
        console.log('[📝 세션 제목 업데이트 호출] sessionId:', sessionToUse.id, 'title:', sessionTitle);
        
        console.log('[🔄 updateSession 호출 전] updateSession 함수 존재:', typeof updateSession === 'function');
        const updateResult = await updateSession(sessionToUse.id, sessionTitle);
        console.log('[✅ updateSession 호출 후] 결과:', updateResult);
        
        console.log('[🔄 fetchSessions 호출] 세션 목록 새로고침');
        await fetchSessions();
      }
      
      // API를 통해 메시지 전송 및 자동 응답 처리
      await sendMessageAction(text, expertiseLevel, chatMode, sessionToUse, () => {
        // 빌드 새로고침 작업 (타이밍을 다르게 하여 안정성 확보)
        setAutoRefreshTriggered(false);
        setTimeout(() => loadBuilds(), 1000);
        setTimeout(() => loadBuilds(), 3000);
        setTimeout(() => {
          loadBuilds();
          setAutoRefreshTriggered(true);
        }, 6000);
      });
      
      // 메시지 전송 완료 후 상태 정리
      setPendingUserMessage(null);
      setIsCreatingSession(false);
      
      console.log('[✅ 메시지 전송] 완료');
    } catch (error) {
      console.error('[❌ 메시지 전송] 실패:', error);
      
      // 에러 발생 시 상태 복원
      setPendingUserMessage(null);
      setIsCreatingSession(false);
      
      // 현재 세션이 있으면 메시지 다시 로드, 없으면 빈 상태로 설정
      if (currentSession?.id) {
        await loadMessages(String(currentSession.id));
      } else {
        setMessages([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    currentSession, 
    startNewConversation, 
    sendMessageAction, 
    updateSession, 
    dbMessages,
    loadBuilds,
    setShowExample,
    fetchSessions,
    loadMessages
  ]);

  /**
   * 훅에서 제공하는 모든 상태와 함수들을 반환
   * 컴포넌트에서 필요한 모든 대화 관련 기능을 제공
   */
  return {
    // 현재 세션 정보
    currentConversation: currentSession,
    
    // 메시지 관련 상태
    messages,
    showExample,
    isLoading: isLoading || msgLoading,
    dbMessages,
    
    // 세션 목록 관련
    conversations: sessions,
    convoLoading: sessionsLoading,
    msgLoading,
    
    // 빌드 관련
    builds,
    buildsLoading: false,
    isGeneratingBuilds,
    setIsGeneratingBuilds,
    autoSwitchDisabled,
    
    // 액션 함수들
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild: viewBuildFromHook,
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    loadBuilds,
    checkForNewBuilds,
    disableAutoSwitch,
    resetToInitialState,
    
    // UI 관련
    setShowExample,
    
    // 채팅 모드 관련
    chatMode,
    setChatMode,
    getExamplePrompt,
    
    // 세션 ID (문자열 형태)
    sessionId: currentSession?.id?.toString()
  };
}
