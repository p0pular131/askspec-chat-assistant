
import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { useDynamicWaitingMessage } from '../hooks/useDynamicWaitingMessage';

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
  const [elapsedTime, setElapsedTime] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { messagesWithStatus } = useDynamicWaitingMessage(chatMode, elapsedTime);

  // Manage elapsed time based on loading state
  useEffect(() => {
    if (isLoading) {
      console.log(`[타이머 시작] 모드: ${chatMode}`);
      const now = Date.now();
      startTimeRef.current = now;
      setElapsedTime(0);
      
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      // Start the timer
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          console.log(`[타이머] 경과시간: ${elapsed}초`);
          setElapsedTime(elapsed);
        }
      }, 1000);
    } else {
      console.log(`[타이머 정지]`);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      startTimeRef.current = null;
      setElapsedTime(0);
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isLoading, chatMode]);

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
              <div className="flex items-center space-x-2 mb-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">처리 중...</span>
              </div>
              <div className="space-y-1">
                {messagesWithStatus.map((messageItem, index) => (
                  <div 
                    key={index}
                    className={`text-sm ${
                      messageItem.status === 'current' 
                        ? 'text-gray-900 font-medium' 
                        : 'text-gray-500'
                    }`}
                  >
                    {messageItem.message}
                  </div>
                ))}
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
