
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

// Add missing interface exports
export interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  position: 'left' | 'right';
  children: React.ReactNode;
}

export interface SurveyOptionProps {
  number: number;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}
