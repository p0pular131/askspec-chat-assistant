
export interface Session {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

// Add SessionResponse type to match API response
export interface SessionResponse {
  id: number;
  session_name: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiMessage {
  id: number;
  content: string;
  role: 'user' | 'assistant';
  session_id: number;
  created_at: string;
  mode: string;
  estimate_id?: string | null; // 견적 ID 추가
}

// Add MessageResponse type to match API response
export interface MessageResponse {
  id: number;
  input_text: string;
  response_json?: any;
  role: string;
  session_id: number;
  created_at: string;
  chat_mode?: string;
  expertise_level?: string;
  estimate_id?: string | null; // 견적 ID 추가
}

export interface UIMessage {
  text: string;
  isUser: boolean;
  chatMode?: string;
  expertiseLevel?: string;
  estimateId?: string | null; // 견적 ID 추가
}
