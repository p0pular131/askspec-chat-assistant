import React from 'react';
import { Message } from './types';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import ReactMarkdown from 'react-markdown';
import { ResponseRenderer } from './responseRenderers/ResponseRenderer';
import ErrorMessageRenderer from './responseRenderers/ErrorMessageRenderer';
import { UserRound } from 'lucide-react';

// Helper function to detect if content is JSON response data
const isJsonResponse = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && parsed.response_type;
  } catch {
    return false;
  }
};

// Helper function to detect if content is an error message
const isErrorMessage = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    
    // Check for API response errors with detail object
    if (parsed.detail && parsed.detail.success === false) {
      return true;
    }
    
    // Check for direct error objects
    if (parsed.success === false) {
      return true;
    }
    
    // Check for error response type
    if (parsed.response_type === 'error') {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

// Helper function to determine if we should use ResponseRenderer based on chat mode and content
const shouldUseResponseRenderer = (message: Message): boolean => {
  // If the message text is already a JSON response, use ResponseRenderer
  if (isJsonResponse(message.text)) {
    return true;
  }
  
  // If the message has a specific chat mode (not general search), use ResponseRenderer
  if (message.chatMode && message.chatMode !== '범용 검색') {
    return true;
  }
  
  return false;
};

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
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  sessionId,
  chatMode = '범용 검색' 
}) => {
  const isCompatibilityRequest = !message.isUser && isCompatibilityCheckRequest(message.text);
  
  // Use the message's stored chatMode and expertiseLevel if available
  const effectiveChatMode = message.chatMode || chatMode;
  const expertiseLevel = message.expertiseLevel || 'low';
  
  if (message.isUser) {
    // Extract user message content - use .content.content if available, fallback to .text
    const getUserMessageContent = (message: Message): string => {
      try {
        const parsed = JSON.parse(message.text);
        if (parsed && parsed.content && parsed.content.content) {
          return parsed.content.content;
        }
      } catch {
        // If parsing fails, use the original text
      }
      return message.text;
    };

    const userMessageContent = getUserMessageContent(message);

    return (
      <div className="flex gap-3 justify-end items-start">
        <div className="max-w-[80%] rounded-lg p-3 bg-blue-100 text-zinc-900 rounded-tr-none">
          <ReactMarkdown className="prose prose-sm dark:prose-invert break-words">
            {userMessageContent}
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

  // Check if this is an error message first
  if (isErrorMessage(message.text)) {
    return (
      <div className="flex gap-3 justify-start items-start">
        <Avatar className="h-8 w-8 bg-teal-600 text-white flex items-center justify-center">
          <AvatarImage src="/lovable-uploads/285cf658-d42c-4aba-a833-0feba368695a.png" alt="PC봇" />
          <AvatarFallback className="bg-teal-600 text-white text-xs">PC봇</AvatarFallback>
        </Avatar>
        <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
          <ErrorMessageRenderer 
            content={message.text} 
            sessionId={sessionId}
            expertiseLevel={expertiseLevel as 'low' | 'middle' | 'high'}
          />
        </div>
      </div>
    );
  }

  // Check if we should use ResponseRenderer for this message
  const useResponseRenderer = shouldUseResponseRenderer(message);

  return (
    <div className="flex gap-3 justify-start items-start">
      <Avatar className="h-8 w-8 bg-teal-600 text-white flex items-center justify-center">
        <AvatarImage src="/lovable-uploads/285cf658-d42c-4aba-a833-0feba368695a.png" alt="PC봇" />
        <AvatarFallback className="bg-teal-600 text-white text-xs">PC봇</AvatarFallback>
      </Avatar>
      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
        {useResponseRenderer ? (
          <ResponseRenderer 
            content={message.text} 
            chatMode={effectiveChatMode} 
            sessionId={sessionId}
            expertiseLevel={expertiseLevel as 'low' | 'middle' | 'high'}
          />
        ) : (
          <ReactMarkdown className="prose prose-sm dark:prose-invert break-words">
            {message.text}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};
