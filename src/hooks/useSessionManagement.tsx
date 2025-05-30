
import { useState, useCallback } from 'react';
import { Session } from '../types/sessionTypes';
import { createSession, getSessions, deleteSession } from '../services/sessionApiService';
import { toast } from '../components/ui/use-toast';

export function useSessionManagement() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showExample, setShowExample] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [updatingSessionId, setUpdatingSessionId] = useState<number | null>(null);

  // 세션 목록 로드
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      console.log('[🔄 세션 목록] API 호출 시작');
      const sessionsData = await getSessions();
      console.log('[✅ 세션 목록] API 응답 성공:', sessionsData.length, '개 세션');
      setSessions(sessionsData);
    } catch (error) {
      console.error('[❌ 세션 목록] 로드 실패:', error);
      toast({
        title: "오류",
        description: "세션 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // 새 세션 생성
  const startNewConversation = useCallback(async () => {
    try {
      console.log('[🔄 세션 생성] API 호출 시작');
      const newSession = await createSession();
      console.log('[✅ 세션 생성] API 응답 성공:', newSession.id);
      
      setCurrentSession(newSession);
      setSessions(prevSessions => [newSession, ...prevSessions]);
      setShowExample(false);
      return newSession;
    } catch (error) {
      console.error('[❌ 세션 생성] 실패:', error);
      toast({
        title: "오류",
        description: "새 세션을 생성하는데 실패했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, []);

  // 세션 선택
  const selectConversation = useCallback(async (session: Session) => {
    console.log('[📋 세션 선택]:', session.id);
    setCurrentSession(session);
    setShowExample(false);
  }, []);

  // 세션 삭제
  const handleDeleteConversation = useCallback(async (sessionId: string) => {
    try {
      const numericId = parseInt(sessionId, 10);
      console.log('[🔄 세션 삭제] API 호출 시작:', numericId);
      
      await deleteSession(numericId);
      console.log('[✅ 세션 삭제] API 응답 성공');
      
      // 로컬 상태 업데이트
      setSessions(prevSessions => prevSessions.filter(session => session.id !== numericId));
      
      // 현재 선택된 세션이 삭제된 경우 초기화
      if (currentSession?.id === numericId) {
        setCurrentSession(null);
        setShowExample(true);
      }
      
      toast({
        title: "성공",
        description: "세션이 삭제되었습니다.",
      });
    } catch (error) {
      console.error('[❌ 세션 삭제] 실패:', error);
      toast({
        title: "오류",
        description: "세션 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  }, [currentSession]);

  // 세션 업데이트 (제목 변경) - 응답에서 title 추출 후 업데이트
  const updateSessionWithTitle = useCallback(async (sessionId: number, title: string) => {
    console.log('[📝 세션 제목 업데이트] 요청:', sessionId, title);
    
    // 반짝이는 애니메이션을 위한 상태 설정
    setUpdatingSessionId(sessionId);
    
    // 로컬 상태 즉시 업데이트
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId 
          ? { ...session, session_name: title }
          : session
      )
    );
    
    // 현재 세션도 업데이트
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, session_name: title } : null);
    }
    
    // 애니메이션 종료
    setTimeout(() => {
      setUpdatingSessionId(null);
    }, 1000);
    
    return true;
  }, [currentSession]);

  // 기존 업데이트 함수 유지 (호환성을 위해)
  const updateSession = useCallback(async (sessionId: number, sessionName: string) => {
    return updateSessionWithTitle(sessionId, sessionName);
  }, [updateSessionWithTitle]);

  return {
    currentSession,
    sessions,
    sessionsLoading,
    showExample,
    updatingSessionId,
    setShowExample,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    updateSession,
    updateSessionWithTitle,
    fetchSessions
  };
}
