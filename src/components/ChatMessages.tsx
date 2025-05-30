
import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface ChatMessagesProps {
  messages: Message[];
  sessionId?: string;
  isLoading?: boolean;
  chatMode?: string;
  onTitleExtracted?: (title: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  sessionId,
  isLoading = false, 
  chatMode = '범용 검색',
  onTitleExtracted
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or loading state changes
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    // Add a small delay to ensure DOM updates are complete
    const timeoutId = setTimeout(scrollToBottom, 100);
    
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Find the first assistant message
  const firstAssistantMessageIndex = messages.findIndex(msg => !msg.isUser);

  return (
    <ScrollArea className="flex-1 h-full w-full pr-4" ref={scrollAreaRef}>
      <div className="space-y-4 pb-32">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            sessionId={sessionId}
            chatMode={chatMode}
            onTitleExtracted={onTitleExtracted}
            isFirstAssistantMessage={index === firstAssistantMessageIndex && !message.isUser}
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start items-start">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">PC봇</span>
            </div>
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>답변을 생성하고 있습니다...</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatMessages;
