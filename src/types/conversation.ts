
export interface Session {
  id: number;
  user_id: number;
  created_at: string;
  session_name: string | null;
}

export interface DatabaseMessage {
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
  components?: any[];
  recommendation?: string;
  rating?: any;
}
