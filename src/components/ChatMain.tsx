
import React, { memo } from 'react';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import { MessageInput } from './MessageInput';

interface ChatMainProps {
  messages: Array<{ text: string; isUser: boolean; chatMode?: string }>;
  isLoading: boolean;
  showExample: boolean;
  chatMode: string;
  setChatMode: (mode: string) => void;
  sendMessage: (text: string) => void;
  getExamplePrompt: () => string;
  expertiseLevel?: string | null;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  isLoading,
  showExample,
  chatMode,
  setChatMode,
  sendMessage,
  getExamplePrompt,
  expertiseLevel
}) => {
  const exampleText = getExamplePrompt();

  const handleSendMessage = (text: string) => {
    // Process the message normally
    sendMessage(text);
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex relative flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm size-full h-full">
        <ChatHeader expertiseLevel={expertiseLevel} />

        <ChatMessages 
          messages={messages} 
          isLoading={isLoading}
          chatMode={chatMode}
        />

        {showExample && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800">
                컴퓨터 견적 AI 어시스턴트
              </h2>
              <p className="text-gray-600 max-w-md">
                원하는 용도에 맞는 컴퓨터 견적을 추천받아보세요
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">💡 예시 질문</h3>
                <p className="text-sm text-gray-600">"{exampleText}"</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-medium text-blue-800 mb-2">🎯 현재 모드</h3>
                <p className="text-sm text-blue-600 font-medium">{chatMode}</p>
              </div>
            </div>
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
