
import React from 'react';
import Sidebar from './Sidebar';
import ChatMain from './ChatMain';
import ChatHeader from './ChatHeader';
import { useConversationState } from '../hooks/useConversationState';

const ChatLayout: React.FC = () => {
  const {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations,
    convoLoading,
    updatingSessionId,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    sendMessage,
    chatMode,
    setChatMode,
    getExamplePrompt,
    sessionId,
    handleTitleExtracted
  } = useConversationState();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        conversations={conversations}
        currentConversation={currentConversation}
        loading={convoLoading}
        updatingSessionId={updatingSessionId}
        onSelectConversation={selectConversation}
        onDeleteConversation={handleDeleteConversation}
        onNewConversation={startNewConversation}
      />
      
      <div className="flex-1 flex flex-col">
        <ChatHeader 
          chatMode={chatMode}
          setChatMode={setChatMode}
          getExamplePrompt={getExamplePrompt}
        />
        
        <ChatMain
          messages={messages}
          isLoading={isLoading}
          onSendMessage={sendMessage}
          showExample={showExample}
          chatMode={chatMode}
          sessionId={sessionId}
          onTitleExtracted={handleTitleExtracted}
        />
      </div>
    </div>
  );
};

export default ChatLayout;
