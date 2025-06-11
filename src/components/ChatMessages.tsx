
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

interface ChatMessagesProps {
  messages: Message[];
  sessionId?: string;
  isLoading?: boolean;
  chatMode?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  sessionId,
  isLoading = false, 
  chatMode = '범용 검색' 
}) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // 세션이 변경되었을 때만 자동 스크롤을 활성화
  useEffect(() => {
    if (sessionId !== currentSessionId) {
      setCurrentSessionId(sessionId);
      setShouldAutoScroll(true);
    }
  }, [sessionId, currentSessionId]);

  // 세션 변경 시에만 자동 스크롤
  useEffect(() => {
    if (shouldAutoScroll && sessionId !== undefined) {
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      };

      const timeoutId = setTimeout(scrollToBottom, 100);
      setShouldAutoScroll(false); // 한 번만 스크롤하고 비활성화
      
      return () => clearTimeout(timeoutId);
    }
  }, [shouldAutoScroll, sessionId]);

  // 로딩 상태가 변경될 때만 스크롤 (새 메시지 응답 시)
  useEffect(() => {
    if (isLoading) {
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'end'
          });
        }
      };

      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  return (
    <ScrollArea className="flex-1 h-full w-full pr-4" ref={scrollAreaRef}>
      <div className="space-y-4 pb-32">
        {messages.map((message, index) => (
          <ChatMessage 
            key={index} 
            message={message} 
            sessionId={sessionId}
            chatMode={chatMode} 
          />
        ))}
        
        {isLoading && (
          <div className="flex gap-3 justify-start items-start">
            <Avatar className="h-8 w-8 bg-teal-600 text-white flex items-center justify-center">
              <AvatarImage src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=100&h=100" alt="PC봇" />
              <AvatarFallback className="bg-teal-600 text-white text-xs">PC봇</AvatarFallback>
            </Avatar>
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
