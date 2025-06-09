
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

  // 초기 세션 목록 로드
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // API 메시지를 UI 메시지로 변환 (견적 ID 포함)
  const syncMessagesFromDB = useCallback((apiMessages: typeof dbMessages) => {
    if (apiMessages) {
      const uiMessages: UIMessage[] = apiMessages.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
        chatMode: msg.mode || '범용 검색',
        expertiseLevel: 'beginner', // 기본값
        estimateId: msg.estimate_id || null // 견적 ID 포함
      }));
      setMessages(uiMessages);
    }
  }, []);

  // 세션이 변경되면 메시지 로드
  useEffect(() => {
    if (currentSession?.id) {
      loadMessages(String(currentSession.id));
    } else {
      setMessages([]);
    }
  }, [currentSession, loadMessages]);

  // DB 메시지가 변경되면 UI 메시지 동기화
  useEffect(() => {
    syncMessagesFromDB(dbMessages);
  }, [dbMessages, syncMessagesFromDB]);

  // 메시지 전송 함수
  const sendMessage = useCallback(async (text: string, expertiseLevel: string = 'intermediate', chatMode: string = '범용 검색') => {
    if (!text.trim()) return;
    
    console.log('[📤 메시지 전송] 시작:', { currentSession: currentSession?.id });
    
    setIsLoading(true);
    
    try {
      let sessionToUse = currentSession;
      
      // 세션이 없으면 새로 생성
      if (!currentSession) {
        console.log('[🆕 세션 생성] 첫 메시지를 위한 새 세션 생성');
        const newSession = await startNewConversation();
        
        if (!newSession || !newSession.id) {
          throw new Error('세션 생성 실패');
        }
        
        sessionToUse = newSession;
        console.log('[✅ 세션 생성] 완료:', sessionToUse.id);
      }
      
      if (!sessionToUse) {
        throw new Error('사용할 세션이 없습니다');
      }
      
      console.log('[📤 메시지 전송] 세션 사용:', sessionToUse.id);
      
      // 첫 번째 메시지인 경우 세션 제목 즉시 업데이트
      if (dbMessages.length === 0) {
        const sessionTitle = text.substring(0, 50);
        console.log('[📝 세션 제목 업데이트] 즉시 업데이트:', sessionTitle);
        await updateSession(sessionToUse.id, sessionTitle);
      }
      
      // 실제 메시지 전송
      await sendMessageAction(text, expertiseLevel, chatMode, sessionToUse, () => {
        setAutoRefreshTriggered(false);
        setTimeout(() => loadBuilds(), 1000);
        setTimeout(() => loadBuilds(), 3000);
        setTimeout(() => {
          loadBuilds();
          setAutoRefreshTriggered(true);
        }, 6000);
      });
      
      setShowExample(false);
    } catch (error) {
      console.error('[❌ 메시지 전송] 실패:', error);
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
    setShowExample
  ]);

  return {
    currentConversation: currentSession,
    messages,
    showExample,
    isLoading,
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
    sessionId: currentSession?.id?.toString()
  };
}
