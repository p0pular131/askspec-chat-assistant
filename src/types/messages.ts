
export interface DatabaseMessage {
  id: number;
  session_id: number;
  input_text: string;
  response_json: any;
  role: 'user' | 'assistant';
  created_at: string;
  chat_mode?: string; // Add chat_mode to store the category when the message was created
}
export interface MessageRequest {
  role: string;
  content: string;
}
