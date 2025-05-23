import React, { useCallback } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import MessageInput from './MessageInput';
import ChatModeSelector from './ChatModeSelector';
import { Message } from './types';

interface ChatMainProps {
  messages: Message[];
  isLoading: boolean;
  showExample: boolean;
  chatMode: string;
  setChatMode: (mode: string) => void;
  sendMessage: (text: string) => void;
  getExamplePrompt: () => string;
  selectedExpertiseLevel?: number | null;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  isLoading,
  showExample,
  chatMode,
  setChatMode,
  sendMessage,
  getExamplePrompt,
  selectedExpertiseLevel = null
}) => {
  const handleSendMessage = useCallback(
    (text: string) => {
      sendMessage(text);
    },
    [sendMessage]
  );

  return (
    <div className="flex flex-col flex-1 h-screen max-h-screen overflow-hidden px-6 py-6">
      <ChatHeader selectedExpertiseLevel={selectedExpertiseLevel} />
      
      <div className="flex gap-2 mb-6">
        <ChatModeSelector chatMode={chatMode} setChatMode={setChatMode} />
      </div>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          isLoading={isLoading}
          chatMode={chatMode}
        />
        
        <MessageInput
          onSendMessage={handleSendMessage}
          loading={isLoading}
          example={showExample ? getExamplePrompt() : null}
        />
      </div>
    </div>
  );
};

export default ChatMain;
