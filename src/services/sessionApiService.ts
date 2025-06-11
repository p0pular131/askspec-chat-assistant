
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// 세션 생성 응답 타입
export interface SessionResponse {
  session_name: string;
  id: number;
  last_modified: string;
  messages: any[];
}

// 메시지 응답 타입
export interface MessageResponse {
  content: string;
  role: string;
  mode: string;
  id: number;
  session_id: number;
  created_at: string;
}

// 메시지 전송 요청 타입
export interface MessageRequest {
  message: string;
  chat_mode: string;
  expertise_level: string;
}

// 세션 생성 API
export const createSession = async (): Promise<SessionResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/sessions/`);
    return response.data;
  } catch (error) {
    console.error('[❌ 세션 생성 API 오류]:', error);
    throw error;
  }
};

// 세션 목록 조회 API
export const getSessions = async (): Promise<SessionResponse[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sessions`);
    return response.data;
  } catch (error) {
    console.error('[❌ 세션 목록 조회 API 오류]:', error);
    throw error;
  }
};

// 특정 세션의 메시지 조회 API
export const getSessionMessages = async (sessionId: number): Promise<MessageResponse[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${sessionId}/messages/`);
    return response.data;
  } catch (error) {
    console.error('[❌세션 메시지 조회 API 오류]:', error);
    throw error;
  }
};

// 메시지 전송 API (새로 추가)
export const sendMessageToSession = async (
  sessionId: number, 
  messageData: MessageRequest
): Promise<MessageResponse> => {
  try {
    console.log('[🔄 메시지 전송 API] 호출:', { sessionId, messageData });
    const response = await axios.post(
      `${API_BASE_URL}/${sessionId}/messages/`, 
      messageData
    );
    console.log('[✅ 메시지 전송 API] 응답:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 메시지 전송 API 오류]:', error);
    throw error;
  }
};

// 세션 삭제 API (기존 기능 유지를 위해)
export const deleteSession = async (sessionId: number): Promise<void> => {
  try {
    await axios.delete(`${API_BASE_URL}/sessions/${sessionId}`);
  } catch (error) {
    console.error('[❌ 세션 삭제 API 오류]:', error);
    throw error;
  }
};
