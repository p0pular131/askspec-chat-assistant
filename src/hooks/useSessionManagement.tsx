
import { useState, useCallback } from 'react';
import { Session } from '../types/sessionTypes';
import { createSession, getSessions, deleteSession } from '../services/sessionApiService';
import { toast } from '../components/ui/use-toast';

/**
 * useSessionManagement - 세션 관리 전용 훅
 * 
 * 이 훅은 대화 세션의 생명주기를 관리합니다.
 * 세션은 하나의 대화 스레드를 나타내며, 여러 메시지를 포함할 수 있습니다.
 * 
 * 주요 기능:
 * 1. 세션 목록 관리 - 사용자의 모든 대화 세션 조회
 * 2. 세션 생성 - 새로운 대화 시작
 * 3. 세션 선택 - 기존 대화 이어가기
 * 4. 세션 삭제 - 불필요한 대화 제거
 * 5. 세션 업데이트 - 제목 변경 등
 * 
 * 세션 상태:
 * - currentSession: 현재 선택된 세션
 * - sessions: 전체 세션 목록
 * - showExample: 예시 화면 표시 여부
 * - sessionsLoading: 세션 목록 로딩 상태
 */
export function useSessionManagement() {
  // 현재 활성화된 세션
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  
  // 사용자의 전체 세션 목록
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // 예시 화면 표시 여부 (세션이 없을 때 초기 화면)
  const [showExample, setShowExample] = useState(true);
  
  // 세션 목록 로딩 상태
  const [sessionsLoading, setSessionsLoading] = useState(false);

  /**
   * 세션 목록 조회 함수
   * 
   * API를 통해 사용자의 모든 세션을 가져와서 상태에 저장합니다.
   * 앱 시작시, 세션 생성/삭제 후에 호출됩니다.
   */
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      console.log('[🔄 세션 목록] API 호출 시작');
      const sessionsData = await getSessions();
      console.log('[✅세션 목록] API 응답 성공:', sessionsData.length, '개 세션');
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

  /**
   * 새 세션 생성 함수
   * 
   * 플로우:
   * 1. API를 통해 새 세션 생성
   * 2. 생성된 세션을 현재 세션으로 설정
   * 3. 세션 목록에 추가
   * 4. 예시 화면 숨김
   * 
   * @returns 생성된 세션 객체 또는 null (실패시)
   */
  const startNewConversation = useCallback(async () => {
    try {
      console.log('[🔄 세션 생성] API 호출 시작');
      const newSession = await createSession();
      console.log('[✅ 세션 생성] API 응답 성공:', newSession.id);
      
      // 새 세션을 현재 세션으로 설정
      setCurrentSession(newSession);
      
      // 세션 목록 맨 앞에 추가 (최신 세션이 위에 오도록)
      setSessions(prevSessions => [newSession, ...prevSessions]);
      
      // 예시 화면 숨김
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

  /**
   * 세션 선택 함수
   * 
   * 기존 세션을 선택하거나 초기 상태로 돌아갑니다.
   * null을 전달하면 홈 화면으로 돌아갑니다.
   * 
   * @param session - 선택할 세션 (null이면 초기 상태로)
   */
  const selectConversation = useCallback(async (session: Session | null) => {
    if (session) {
      console.log('[📋 세션 선택]:', session.id);
      setCurrentSession(session);
      setShowExample(false);
    } else {
      console.log('[🏠 초기 상태로 돌아가기]');
      setCurrentSession(null);
      setShowExample(true);
    }
  }, []);

  /**
   * 세션 삭제 함수
   * 
   * 플로우:
   * 1. API를 통해 세션 삭제
   * 2. 로컬 세션 목록에서 제거
   * 3. 현재 선택된 세션이 삭제된 경우 초기화
   * 
   * @param sessionId - 삭제할 세션 ID (문자열)
   */
  const handleDeleteConversation = useCallback(async (sessionId: string) => {
    try {
      const numericId = parseInt(sessionId, 10);
      console.log('[🔄 세션 삭제] API 호출 시작:', numericId);
      
      await deleteSession(numericId);
      console.log('[✅ 세션 삭제] API 응답 성공');
      
      // 로컬 상태에서 해당 세션 제거
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

  /**
   * 세션 업데이트 함수
   * 
   * 주로 첫 메시지 전송시 세션 제목을 자동으로 업데이트하는데 사용됩니다.
   * 백엔드에서 자동으로 처리되므로 여기서는 세션 목록을 새로고침만 합니다.
   * 
   * @param sessionId - 업데이트할 세션 ID
   * @param sessionName - 새 세션 이름
   * @returns 성공 여부
   */
  const updateSession = useCallback(async (sessionId: number, sessionName: string) => {
    console.log('[📝 세션 업데이트] 요청 - 세션 목록 재로드:', sessionId);
    
    try {
      // 백엔드에서 자동으로 세션 제목이 업데이트되므로 getSessions만 호출
      console.log('[🔄 세션 목록 재로드] getSessions API 호출');
      const freshSessions = await getSessions();
      console.log('[✅ 세션 목록 재로드] 완료, 업데이트된 세션 수:', freshSessions.length);
      
      // 새로 받아온 세션 목록으로 상태 업데이트
      setSessions(freshSessions);
      
      // 현재 세션이 업데이트된 경우 현재 세션 정보도 갱신
      const updatedCurrentSession = freshSessions.find(session => session.id === sessionId);
      if (updatedCurrentSession && currentSession?.id === sessionId) {
        setCurrentSession(updatedCurrentSession);
        console.log('[✅ 현재 세션 업데이트] 완료:', updatedCurrentSession.session_name);
      }
      
      console.log('[✅ 세션 업데이트] 완료');
      return true;
    } catch (error) {
      console.error('[❌ 세션 목록 재로드] 실패:', error);
      toast({
        title: "오류",
        description: "세션 목록을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }
  }, [currentSession]);

  /**
   * 훅에서 제공하는 상태와 함수들 반환
   */
  return {
    // 상태
    currentSession,        // 현재 선택된 세션
    sessions,             // 전체 세션 목록
    sessionsLoading,      // 세션 목록 로딩 상태
    showExample,          // 예시 화면 표시 여부
    
    // 상태 설정 함수
    setShowExample,
    
    // 액션 함수들
    startNewConversation,     // 새 세션 생성
    selectConversation,       // 세션 선택
    handleDeleteConversation, // 세션 삭제
    updateSession,           // 세션 업데이트
    fetchSessions           // 세션 목록 새로고침
  };
}
