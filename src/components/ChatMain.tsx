
import React from 'react';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import { UIMessage } from '../types/sessionTypes';

interface ChatMainProps {
  messages: UIMessage[];
  isLoading: boolean;
  onSendMessage: (message: string, expertiseLevel: string, chatMode: string) => void;
  showExample: boolean;
  chatMode: string;
  sessionId?: string;
  onTitleExtracted?: (title: string) => void;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  isLoading,
  onSendMessage,
  showExample,
  chatMode,
  sessionId,
  onTitleExtracted
}) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        <ChatMessages 
          messages={messages} 
          sessionId={sessionId}
          onTitleExtracted={onTitleExtracted}
        />
      </div>
      
      <div className="flex-shrink-0 p-4 bg-white border-t">
        <MessageInput
          onSendMessage={onSendMessage}
          isLoading={isLoading}
          showExample={showExample}
          chatMode={chatMode}
        />
      </div>
    </div>
  );
};

export default ChatMain;
