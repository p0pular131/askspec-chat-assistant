
import { useState, useEffect, useCallback } from 'react';
import { UIMessage } from '../types/sessionTypes';
import { useSessionManagement } from './useSessionManagement';
import { useMessageActions } from './useMessageActions';
import { useBuildActions } from './useBuildActions';
import { useChatMode } from './useChatMode';

export function useConversationState() {
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefreshTriggered, setAutoRefreshTriggered] = useState(false);
  const [pendingUserMessage, setPendingUserMessage] = useState<UIMessage | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  
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

  // 초기 상태로 돌아가는 함수
  const resetToInitialState = useCallback(() => {
    setMessages([]);
    setShowExample(true);
    setIsLoading(false);
    setPendingUserMessage(null);
    setIsCreatingSession(false);
    // 현재 세션 선택 해제를 위해 null 세션 선택
    selectConversation(null);
  }, [setShowExample, selectConversation]);

  // 초기 세션 목록 로드
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // API 메시지를 UI 메시지로 변환
  const syncMessagesFromDB = useCallback((apiMessages: typeof dbMessages) => {
    // 세션 생성 중이거나 첫 번째 메시지를 보내는 중이면 DB 메시지 동기화를 건너뜀
    if (isCreatingSession && pendingUserMessage) {
      console.log('[⏸️ 메시지 동기화] 세션 생성 중이므로 건너뜀');
      return;
    }
    
    if (apiMessages) {
      const uiMessages: UIMessage[] = apiMessages.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
        chatMode: msg.mode || '범용 검색',
        expertiseLevel: 'beginner' // 기본값
      }));
      
      console.log('[🔄 메시지 동기화] DB에서 UI로:', uiMessages.length, '개 메시지');
      
      // pendingUserMessage가 있으면 함께 표시
      if (pendingUserMessage) {
        setMessages([...uiMessages, pendingUserMessage]);
      } else {
        setMessages(uiMessages);
      }
    }
  }, [pendingUserMessage, isCreatingSession]);

  // 세션이 변경되면 메시지 로드
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

  // DB 메시지가 변경되면 UI 메시지 동기화
  useEffect(() => {
    console.log('[📊 DB 메시지 변경] 길이:', dbMessages.length);
    syncMessagesFromDB(dbMessages);
  }, [dbMessages, syncMessagesFromDB]);

  // 메시지 전송 함수 (사용자 메시지 즉시 표시)
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
      
      // 사용자 메시지를 pending으로 설정 (DB 로드와 별도로 관리)
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
        
        // updateSession 함수 호출 전후 로그 추가
        console.log('[🔄 updateSession 호출 전] updateSession 함수 존재:', typeof updateSession === 'function');
        const updateResult = await updateSession(sessionToUse.id, sessionTitle);
        console.log('[✅ updateSession 호출 후] 결과:', updateResult);
        
        console.log('[🔄 fetchSessions 호출] 세션 목록 새로고침');
        await fetchSessions();
      }
      
      // API를 통해 메시지 전송 및 자동 응답 처리
      await sendMessageAction(text, expertiseLevel, chatMode, sessionToUse, () => {
        setAutoRefreshTriggered(false);
        setTimeout(() => loadBuilds(), 1000);
        setTimeout(() => loadBuilds(), 3000);
        setTimeout(() => {
          loadBuilds();
          setAutoRefreshTriggered(true);
        }, 6000);
      });
      
      // 메시지 전송 완료 후 pending 메시지 제거 및 세션 생성 상태 해제
      setPendingUserMessage(null);
      setIsCreatingSession(false);
      
      console.log('[✅ 메시지 전송] 완료');
    } catch (error) {
      console.error('[❌ 메시지 전송] 실패:', error);
      // 에러 발생 시 pending 메시지 제거하고 정확한 상태로 복원
      setPendingUserMessage(null);
      setIsCreatingSession(false);
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

  return {
    currentConversation: currentSession,
    messages,
    showExample,
    isLoading: isLoading || msgLoading,
    conversations: sessions,
    convoLoading: sessionsLoading,
    msgLoading,
    dbMessages,
    builds,
    buildsLoading: false,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild: viewBuildFromHook,
    sendMessage,
    loadMessages,
    syncMessagesFromDB,
    loadBuilds,
    setShowExample,
    chatMode,
    setChatMode,
    getExamplePrompt,
    isGeneratingBuilds,
    setIsGeneratingBuilds,
    autoSwitchDisabled,
    checkForNewBuilds,
    disableAutoSwitch,
    resetToInitialState,
    sessionId: currentSession?.id?.toString()
  };
}
