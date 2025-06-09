
// 백엔드 API 응답에 맞는 세션 타입
export interface Session {
  id: number;
  session_name: string;
  last_modified: string;
  messages: any[];
}

// 백엔드 API 응답에 맞는 메시지 타입
export interface ApiMessage {
  content: string;
  role: string;
  mode: string;
  id: number;
  session_id: number;
  created_at: string;
}

// UI에서 사용하는 메시지 타입 (기존 유지)
export interface UIMessage {
  text: string;
  isUser: boolean;
  chatMode?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}
