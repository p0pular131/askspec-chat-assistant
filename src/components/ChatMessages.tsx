
import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import { UIMessage } from '../types/sessionTypes';

interface ChatMessagesProps {
  messages: UIMessage[];
  sessionId?: string;
  onTitleExtracted?: (title: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  sessionId,
  onTitleExtracted 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col space-y-4 pb-32">
      {messages.map((message, index) => {
        const isFirstAssistantMessage = !message.isUser && 
          index === 1 && 
          messages.length >= 2 && 
          messages[0]?.isUser;

        return (
          <ChatMessage
            key={index}
            text={message.text}
            isUser={message.isUser}
            chatMode={message.chatMode}
            expertiseLevel={message.expertiseLevel}
            sessionId={sessionId}
            onTitleExtracted={isFirstAssistantMessage ? onTitleExtracted : undefined}
          />
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;
