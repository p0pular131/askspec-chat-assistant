
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
  sessionId?: string;
}

const ChatMain: React.FC<ChatMainProps> = ({
  messages,
  isLoading,
  showExample,
  chatMode,
  setChatMode,
  sendMessage,
  getExamplePrompt,
  expertiseLevel,
  sessionId
}) => {
  const exampleText = getExamplePrompt();

  const handleSendMessage = (text: string) => {
    // Process the message normally
    sendMessage(text);
  };

  // Show initial UI when no messages exist (regardless of session state)
  const shouldShowInitialUI = messages.length === 0;

  return (
    <main className="flex-1 p-6 relative">
      <div className="flex relative flex-col bg-white rounded-xl border border-gray-200 shadow-sm h-full">
        <div className="p-6 pb-0">
          <ChatHeader expertiseLevel={expertiseLevel} />
        </div>

        {shouldShowInitialUI ? (
          <div className="flex-1 flex items-center justify-center p-6 mb-24">
            <div className="flex flex-col items-center justify-center space-y-6">
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
          </div>
        ) : (
          <div className="flex-1 px-6 min-h-0 mb-24">
            <ChatMessages 
              messages={messages} 
              sessionId={sessionId}
              isLoading={isLoading}
              chatMode={chatMode}
            />
          </div>
        )}

        <div className="absolute bottom-6 left-6 right-6">
          <MessageInput
            onSendMessage={handleSendMessage}
            chatMode={chatMode}
            setChatMode={setChatMode}
            showExample={shouldShowInitialUI}
            exampleText={exampleText}
            isDisabled={isLoading}
          />
        </div>
      </div>
    </main>
  );
};

export default memo(ChatMain);
