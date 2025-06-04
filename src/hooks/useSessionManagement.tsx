
import { useState, useCallback } from 'react';
import { Session } from '../types/sessionTypes';
import { createSession, getSessions, deleteSession } from '../services/sessionApiService';
import { toast } from '../components/ui/use-toast';

export function useSessionManagement() {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [showExample, setShowExample] = useState(true);
  const [sessionsLoading, setSessionsLoading] = useState(false);

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

  // 세션 업데이트 (제목 변경)
  const updateSession = useCallback(async (sessionId: number, sessionName: string) => {
    console.log('[📝 세션 업데이트] 요청:', sessionId, sessionName);
    
    // 로컬 상태 즉시 업데이트
    setSessions(prevSessions => 
      prevSessions.map(session => 
        session.id === sessionId 
          ? { ...session, session_name: sessionName }
          : session
      )
    );
    
    // 현재 세션도 업데이트
    if (currentSession?.id === sessionId) {
      setCurrentSession(prev => prev ? { ...prev, session_name: sessionName } : null);
    }
    
    return true;
  }, [currentSession]);

  return {
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
  };
}
