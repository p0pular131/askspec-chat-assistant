
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

export interface Session {
  id: number;
  user_id: number; // Changed from string to number to match database
  created_at: string;
  session_name: string | null;
}

interface DatabaseMessage {
  id: number;
  created_at: string;
  session_id: number;
  input_text: string;
  response_json: any;
  role: 'user' | 'assistant';
}

export interface Build {
  id: number;
  created_at: string;
  name: string;
  session_id: number;
  total_price: number;
  parts: any;
}

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

  // Load initial data
  useEffect(() => {
    loadConversations();
    loadBuilds();
  }, []);

  // Function to load conversations from the database
  const loadConversations = useCallback(async () => {
    setConvoLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Make sure data is correctly typed
        const typedData: Session[] = data.map(session => ({
          ...session,
          user_id: session.user_id || 123 // Default to a numeric user ID
        }));
        setSessions(typedData);
      }
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

  // Function to load messages for a specific conversation
  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const sessionIdNum = parseInt(sessionId, 10);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionIdNum)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        // Ensure proper typing for database messages
        const typedMessages: DatabaseMessage[] = data.map(message => ({
          ...message,
          input_text: message.input_text || '',
          role: (message.role === 'user' || message.role === 'assistant') 
            ? message.role 
            : 'user', // Default to 'user' if it's not valid
        }));
        
        setMessages(typedMessages);
        setDbMessages(typedMessages);
        setShowExample(typedMessages.length === 0);
      }
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
  
  const loadBuilds = useCallback(async () => {
    setBuildsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      if (data) {
        // Convert to the expected Build type
        const convertedBuilds: Build[] = data.map(item => ({
          id: item.id,
          name: item.purpose || 'Unnamed Build',
          // Assign 0 as default session_id since it doesn't exist in the estimates table
          session_id: 0,
          created_at: item.created_at || '',
          total_price: item.total_price || 0,
          parts: item.metrics_score_json || {}
        }));
        setBuilds(convertedBuilds);
      }
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

  // Start a new conversation
  const startNewConversation = useCallback(async () => {
    setConvoLoading(true);
    try {
      // Use a numeric user ID (123) instead of a string
      const { data, error } = await supabase
        .from('sessions')
        .insert([{ user_id: 123 }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Ensure correct typing for the new session
        const newSession: Session = {
          ...data,
          user_id: data.user_id || 123
        };
        
        setSessions(prevSessions => [newSession, ...prevSessions]);
        setCurrentConversation(newSession);
        setMessages([]);
        setShowExample(true);
        return newSession;
      }
      return null;
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

  // Select an existing conversation
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
    
    // Store this variable to reference in catch block if needed
    const tempMessage: DatabaseMessage = {
      id: Date.now(), // Temporary ID
      created_at: new Date().toISOString(),
      session_id: currentConversation.id,
      input_text: text,
      response_json: null,
      role: 'user', // Properly typed as 'user'
    };
    
    try {
      // Optimistically update the local state with properly typed message
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      setShowExample(false);

      // Send the message to Supabase - only include fields that exist in the table
      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: currentConversation.id,
          input_text: text,
          role: 'user',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Fetch response from the server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          messages: dbMessages,
          session_id: currentConversation.id,
          expertise_level: 'intermediate', // Default value
          chat_mode: '범용 검색' // Default value
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();

      // Add the assistant's response to the local state with proper typing
      const assistantMessage: DatabaseMessage = {
        id: Date.now() + 1, // Temporary ID
        created_at: new Date().toISOString(),
        session_id: currentConversation.id,
        input_text: responseData.content,
        response_json: null,
        role: 'assistant', // Properly typed as 'assistant'
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
      
      // Send the assistant's message to Supabase - only include fields that exist in the table
      const { error: assistantError } = await supabase
        .from('messages')
        .insert({
          session_id: currentConversation.id,
          input_text: responseData.content,
          role: 'assistant',
        })
        .select()
        .single();

      if (assistantError) {
        throw assistantError;
      }
      
      // Load messages to update local state with database IDs
      loadMessages(String(currentConversation.id));
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "메시지 전송 실패",
        description: error.message,
        variant: "destructive",
      });
      // Revert the optimistic update on error
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  }, [currentConversation, toast, dbMessages, loadMessages]);

  // Update session name
  const updateSession = useCallback(async (sessionId: number, sessionName: string) => {
    setLoadingUpdateSession(true);
    try {
      const { error } = await supabase
        .from('sessions')
        .update({ session_name: sessionName })
        .eq('id', sessionId);

      if (error) {
        toast({
          title: "세션 업데이트 실패",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Update local state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, session_name: sessionName } 
            : session
        )
      );
      
      return true;
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
  }, [supabase, toast]);

  // Delete a conversation
  const handleDeleteConversation = useCallback(async (sessionId: string) => {
    setLoadingDeleteSession(true);
    try {
      // Convert string ID to number for the database operation
      const numericId = parseInt(sessionId, 10);
      
      // First, delete all messages associated with this session
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('session_id', numericId);

      if (messagesError) {
        throw new Error(`메시지 삭제 실패: ${messagesError.message}`);
      }

      // Then delete the session itself
      const { error: sessionError } = await supabase
        .from('sessions')
        .delete()
        .eq('id', numericId);

      if (sessionError) {
        throw new Error(`세션 삭제 실패: ${sessionError.message}`);
      }

      // Update local state by removing the deleted session
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
  }, [supabase, toast]);
  
  const deleteBuild = useCallback(async (buildId: string) => {
    setBuildsLoading(true);
    try {
      // Convert string ID to number for the database operation
      const numericId = parseInt(buildId, 10);
      
      // Delete the build from the estimates table
      const { error: buildError } = await supabase
        .from('estimates')
        .delete()
        .eq('id', numericId);

      if (buildError) {
        throw new Error(`견적 삭제 실패: ${buildError.message}`);
      }

      // Update local state by removing the deleted build
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
  }, [supabase, toast]);

  const viewBuild = useCallback(async (buildId: string) => {
    // TODO: Implement view build functionality
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
    handleDeleteBuild: deleteBuild,
    handleViewBuild: viewBuild,
    sendMessage,
    loadMessages,
    loadBuilds,
    loadingUpdateSession,
    updateSession,
    loadConversations,
  };
};
