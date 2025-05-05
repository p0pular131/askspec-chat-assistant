
import React from 'react';
import { ChatMessage } from './ChatMessage';
import { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages, isLoading }) => {
  return (
    <div className="flex overflow-y-auto flex-col flex-1 gap-4 mb-20">
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      
      {isLoading && (
        <div className="self-start max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
          <p className="text-sm">생각 중...</p>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
