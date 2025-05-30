
import React from 'react';
import { Message } from './types';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import ReactMarkdown from 'react-markdown';
import ResponseRenderer from './responseRenderers/ResponseRenderer';
import { UserRound } from 'lucide-react';

// Helper function to detect compatibility check requests
const isCompatibilityCheckRequest = (text: string): boolean => {
  const compatibilityKeywords = [
    '호환성', '호환', 'compatibility', 'compatible', '맞는지', '맞나요', 
    '같이 사용', '함께 사용', '궁합', '조합'
  ];
  
  return compatibilityKeywords.some(keyword => text.toLowerCase().includes(keyword));
};

interface ChatMessageProps {
  message: Message;
  sessionId?: string;
  chatMode?: string;
  onTitleExtracted?: (title: string) => void;
  isFirstAssistantMessage?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  sessionId,
  chatMode = '범용 검색',
  onTitleExtracted,
  isFirstAssistantMessage = false
}) => {
  const isCompatibilityRequest = !message.isUser && isCompatibilityCheckRequest(message.text);
  
  // Use the message's stored chatMode and expertiseLevel if available
  const effectiveChatMode = message.chatMode || chatMode;
  const expertiseLevel = message.expertiseLevel || 'beginner';
  
  if (message.isUser) {
    return (
      <div className="flex gap-3 justify-end items-start">
        <div className="max-w-[80%] rounded-lg p-3 bg-blue-100 text-zinc-900 rounded-tr-none">
          <ReactMarkdown className="prose prose-sm dark:prose-invert break-words">
            {message.text}
          </ReactMarkdown>
        </div>
        <Avatar className="h-8 w-8 bg-blue-500 text-white flex items-center justify-center">
          <AvatarFallback className="bg-blue-500 text-white">
            <UserRound className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start items-start">
      <Avatar className="h-8 w-8 bg-teal-600 text-white flex items-center justify-center">
        <AvatarImage src="/lovable-uploads/9ceae269-47da-47cd-b016-1757bf5c66b1.png" alt="PC봇" />
        <AvatarFallback className="bg-teal-600 text-white text-xs">PC봇</AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
        <ResponseRenderer 
          content={message.text} 
          chatMode={effectiveChatMode} 
          sessionId={sessionId}
          isCompatibilityRequest={isCompatibilityRequest}
          expertiseLevel={expertiseLevel}
          onTitleExtracted={isFirstAssistantMessage ? onTitleExtracted : undefined}
        />
      </div>
    </div>
  );
};
