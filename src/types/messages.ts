
export interface DatabaseMessage {
  id: number;
  session_id: number;
  input_text: string;
  response_json: any;
  role: 'user' | 'assistant';
  created_at: string;
  chat_mode: string; // Add chat_mode to store the category when the message was created
  expertise_level: string; // Add expertise_level to store the expertise level
  estimate_id?: string | null; // 견적 ID 추가
}

export interface MessageRequest {
  role: string;
  content: string;
}
