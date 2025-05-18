
export interface Message {
  text: string;
  isUser: boolean;
  chatMode?: string; // Add chatMode to store the category when the message was created
}

export interface SidebarProps {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  position: 'left' | 'right';
}

export interface ChatMessageProps {
  message: Message;
}

export interface MessageInputProps {
  onSendMessage: (text: string) => void;
  chatMode: string;
  setChatMode: (mode: string) => void;
  showExample: boolean;
  exampleText: string;
  isDisabled?: boolean;
}

export interface SurveyOptionProps {
  id: number;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}
