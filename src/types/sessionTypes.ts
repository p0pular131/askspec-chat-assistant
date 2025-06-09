
export interface Session {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
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

export interface UIMessage {
  text: string;
  isUser: boolean;
  chatMode?: string;
  expertiseLevel?: string;
  estimateId?: string | null; // 견적 ID 추가
}
