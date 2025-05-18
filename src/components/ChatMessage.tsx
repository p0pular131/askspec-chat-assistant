
import React from 'react';
import { Message } from './types';
import { Avatar } from './ui/avatar';
import ReactMarkdown from 'react-markdown';
import ResponseRenderer from './responseRenderers/ResponseRenderer';

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
  chatMode?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, chatMode = '범용 검색' }) => {
  const isCompatibilityRequest = !message.isUser && isCompatibilityCheckRequest(message.text);
  
  // Use the message's stored chatMode if available, otherwise fall back to the provided one
  const effectiveChatMode = message.chatMode || chatMode;
  
  if (message.isUser) {
    return (
      <div className="flex gap-3 justify-end items-start">
        <div className="max-w-[80%] rounded-lg p-3 bg-blue-100 text-zinc-900 rounded-tr-none">
          <ReactMarkdown className="prose prose-sm dark:prose-invert break-words">
            {message.text}
          </ReactMarkdown>
        </div>
        <Avatar className="h-8 w-8 bg-blue-500 text-white flex items-center justify-center">
          <span className="text-xs">사용자</span>
        </Avatar>
      </div>
    );
  }

  return (
    <div className="flex gap-3 justify-start items-start">
      <Avatar className="h-8 w-8 bg-teal-600 text-white flex items-center justify-center">
        <span className="text-xs">PC봇</span>
      </Avatar>
      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
        <ResponseRenderer 
          content={message.text} 
          chatMode={effectiveChatMode} 
          isCompatibilityRequest={isCompatibilityRequest} 
        />
      </div>
    </div>
  );
};
