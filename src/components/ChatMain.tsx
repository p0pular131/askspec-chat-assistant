import React, { memo, useState } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { MessageInput } from './MessageInput';
import { fetchCompatibilityData } from '../integrations/supabase/client';
import CompatibilityDiagram from './CompatibilityDiagram';

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
  const [compatibilityData, setCompatibilityData] = useState<any | null>(null);
  const exampleText = getExamplePrompt();

  const handleSendMessage = async (text: string) => {
    // Process the message normally
    sendMessage(text);

    // If in compatibility check mode, fetch the compatibility data
    if (chatMode === '호환성 검사' || chatMode === '견적 평가') {
      try {
        const data = await fetchCompatibilityData();
        if (data) {
          setCompatibilityData(data);
          console.log("Compatibility data fetched:", data);
        }
      } catch (error) {
        console.error("Error fetching compatibility data:", error);
      }
    } else {
      // Reset compatibility data if not in relevant modes
      setCompatibilityData(null);
    }
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex relative flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm size-full h-full">
        <ChatHeader />

        <ChatMessages 
          messages={messages} 
          isLoading={isLoading}
        />

        {showExample && messages.length === 0 && (
          <div className="absolute top-2/4 left-2/4 px-5 py-0 text-base italic text-center -translate-x-2/4 -translate-y-2/4 pointer-events-none max-w-[600px] text-neutral-400">
            {exampleText}
          </div>
        )}

        {compatibilityData && messages.length > 0 && !isLoading && (
          <div className="mt-4 mb-4">
            <CompatibilityDiagram data={compatibilityData} />
          </div>
        )}

        <MessageInput
          onSendMessage={handleSendMessage}
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
