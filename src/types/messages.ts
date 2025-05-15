
export interface DatabaseMessage {
  id: number;
  session_id: number;
  input_text: string;
  response_json: any;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface MessageRequest {
  role: string;
  content: string;
}
