
import React, { memo } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { MessageInput } from './MessageInput';

interface ChatMainProps {
  messages: Array<{ text: string; isUser: boolean }>;
  isLoading: boolean;
  showExample: boolean;
  chatMode: string;
  setChatMode: (mode: string) => void;
  sendMessage: (text: string) => void;
  getExamplePrompt: () => string;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  isLoading,
  showExample,
  chatMode,
  setChatMode,
  sendMessage,
  getExamplePrompt
}) => {
  const exampleText = getExamplePrompt();

  return (
    <main className="flex-1 p-6">
      <div className="flex relative flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm size-full h-full">
        <ChatHeader />

        <ChatMessages messages={messages} isLoading={isLoading} />

        {showExample && messages.length === 0 && (
          <div className="absolute top-2/4 left-2/4 px-5 py-0 text-base italic text-center -translate-x-2/4 -translate-y-2/4 pointer-events-none max-w-[600px] text-neutral-400">
            {exampleText}
          </div>
        )}

        <MessageInput
          onSendMessage={sendMessage}
          chatMode={chatMode}
          setChatMode={setChatMode}
          showExample={showExample}
          exampleText={exampleText}
          isDisabled={isLoading}
        />
      </div>
    </main>
  );
};

export default memo(ChatMain);
