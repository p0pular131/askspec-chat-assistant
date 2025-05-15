
import React, { useRef, useEffect, memo } from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  chatMode?: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading, chatMode = '범용 검색' }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex overflow-y-auto flex-col flex-1 gap-4 mb-20">
      {messages.map((message, index) => (
        <ChatMessage 
          key={`message-${index}-${message.text.substring(0, 10)}`} 
          message={message} 
          chatMode={chatMode}
        />
      ))}
      
      {isLoading && (
        <div className="self-start max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
          <p className="text-sm">생각 중...</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default memo(ChatMessages);
