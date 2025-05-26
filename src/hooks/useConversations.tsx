
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Session, DatabaseMessage, Build } from '../types/conversation';
import { 
  createNewSession, 
  loadSessions, 
  updateSessionName, 
  deleteSession 
} from '../services/sessionService';
import { loadBuilds, deleteBuild } from '../services/buildService';
import { 
  loadConversationMessages, 
  insertMessage 
} from '../services/conversationMessageService';

export type { Session, DatabaseMessage, Build };

export const useConversationState = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Session | null>(null);
  const [messages, setMessages] = useState<DatabaseMessage[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [showExample, setShowExample] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [convoLoading, setConvoLoading] = useState(false);
  const [buildsLoading, setBuildsLoading] = useState(false);
  const [loadingUpdateSession, setLoadingUpdateSession] = useState(false);
  const [loadingDeleteSession, setLoadingDeleteSession] = useState(false);
  const [dbMessages, setDbMessages] = useState<DatabaseMessage[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
    loadBuildsData();
  }, []);

  const loadConversations = useCallback(async () => {
    setConvoLoading(true);
    try {
      const data = await loadSessions();
      setSessions(data);
    } catch (error: any) {
      console.error("Error loading conversations:", error);
      toast({
        title: "대화 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setConvoLoading(false);
    }
  }, [toast]);

  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const sessionIdNum = parseInt(sessionId, 10);
      const data = await loadConversationMessages(sessionIdNum);
      setMessages(data);
      setDbMessages(data);
      setShowExample(data.length === 0);
    } catch (error: any) {
      console.error("Error loading messages:", error);
      toast({
        title: "메시지 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const loadBuildsData = useCallback(async () => {
    setBuildsLoading(true);
    try {
      const data = await loadBuilds();
      setBuilds(data);
    } catch (error: any) {
      console.error("Error loading builds:", error);
      toast({
        title: "견적 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBuildsLoading(false);
    }
  }, [toast]);

  const startNewConversation = useCallback(async () => {
    setConvoLoading(true);
    try {
      const newSession = await createNewSession();
      
      if (newSession) {
        setSessions(prevSessions => [newSession, ...prevSessions]);
        setCurrentConversation(newSession);
        setMessages([]);
        setShowExample(true);
        return newSession;
      }
      
      throw new Error('Failed to create session');
    } catch (error: any) {
      console.error("Error starting new conversation:", error);
      toast({
        title: "새 대화 시작 실패",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setConvoLoading(false);
    }
  }, [toast]);

  const selectConversation = useCallback((conversation: Session) => {
    setCurrentConversation(conversation);
    setShowExample(false);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!currentConversation) {
      toast({
        title: "대화 선택 필요",
        description: "메시지를 보내기 전에 대화를 선택해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const tempMessage: DatabaseMessage = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      session_id: currentConversation.id,
      input_text: text,
      response_json: null,
      role: 'user',
    };
    
    try {
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setShowExample(false);

      await insertMessage(currentConversation.id, text, 'user');

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          messages: dbMessages,
          session_id: currentConversation.id,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      const assistantMessage: DatabaseMessage = {
        id: Date.now() + 1,
        created_at: new Date().toISOString(),
        session_id: currentConversation.id,
        input_text: responseData.content,
        response_json: null,
        role: 'assistant',
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      await insertMessage(currentConversation.id, responseData.content, 'assistant');
      
      loadMessages(String(currentConversation.id));
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "메시지 전송 실패",
        description: error.message,
        variant: "destructive",
      });
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, toast, dbMessages, loadMessages]);

  const updateSession = useCallback(async (sessionId: number, sessionName: string) => {
    setLoadingUpdateSession(true);
    try {
      const success = await updateSessionName(sessionId, sessionName);
      
      if (success) {
        setSessions(prevSessions => 
          prevSessions.map(session => 
            session.id === sessionId 
              ? { ...session, session_name: sessionName } 
              : session
          )
        );
        return true;
      } else {
        toast({
          title: "세션 업데이트 실패",
          description: "세션 이름을 업데이트하는데 실패했습니다.",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error("세션 업데이트 중 오류 발생:", error);
      toast({
        title: "세션 업데이트 실패",
        description: "세션 이름을 업데이트하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingUpdateSession(false);
    }
  }, [toast]);

  const handleDeleteConversation = useCallback(async (sessionId: string) => {
    setLoadingDeleteSession(true);
    try {
      const numericId = parseInt(sessionId, 10);
      
      await deleteSession(numericId);

      setSessions(prevSessions => prevSessions.filter(session => session.id !== numericId));
      
      toast({
        title: "대화 삭제 완료",
        description: "대화가 성공적으로 삭제되었습니다.",
      });
      
      return true;
    } catch (error) {
      console.error("대화 삭제 중 오류 발생:", error);
      toast({
        title: "대화 삭제 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoadingDeleteSession(false);
    }
  }, [toast]);
  
  const handleDeleteBuild = useCallback(async (buildId: string) => {
    setBuildsLoading(true);
    try {
      const numericId = parseInt(buildId, 10);
      
      await deleteBuild(numericId);

      setBuilds(prevBuilds => prevBuilds.filter(build => build.id !== numericId));
      
      toast({
        title: "견적 삭제 완료",
        description: "견적이 성공적으로 삭제되었습니다.",
      });
      
      return true;
    } catch (error) {
      console.error("견적 삭제 중 오류 발생:", error);
      toast({
        title: "견적 삭제 실패",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    } finally {
      setBuildsLoading(false);
    }
  }, [toast]);

  const viewBuild = useCallback((buildId: string) => {
    console.log(`View build with ID: ${buildId}`);
  }, []);

  return {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations: sessions,
    convoLoading,
    dbMessages,
    builds,
    buildsLoading,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild: viewBuild,
    sendMessage,
    loadMessages,
    loadBuilds: loadBuildsData,
    loadingUpdateSession,
    updateSession,
    loadConversations,
  };
};
