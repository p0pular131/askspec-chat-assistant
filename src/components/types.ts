
export interface Message {
  text: string;
  isUser: boolean;
  chatMode?: string;
  expertiseLevel?: string;
  estimateId?: string | null; // 견적 ID 추가
}

export interface ChatMode {
  id: string;
  name: string;
  description: string;
  examples: string[];
}
