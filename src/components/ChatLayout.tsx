
import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import ChatMain from './ChatMain';
import ChatConversationList from './ChatConversationList';
import BuildsList from './BuildsList';
import { useConversationState } from '../hooks/useConversationState';

const ChatLayout: React.FC = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = React.useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = React.useState(true);

  const {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations,
    convoLoading,
    builds,
    buildsLoading,
    titleUpdatingSessionId,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild,
    sendMessage,
    loadBuilds,
    chatMode,
    setChatMode,
    getExamplePrompt,
    sessionId,
    onTitleExtracted
  } = useConversationState();

  // Load builds on component mount
  useEffect(() => {
    loadBuilds();
  }, [loadBuilds]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Conversations */}
      <Sidebar
        isOpen={leftSidebarOpen}
        onToggle={() => setLeftSidebarOpen(!leftSidebarOpen)}
        title="대화 목록"
        position="left"
      >
        <ChatConversationList
          conversations={conversations}
          currentConversation={currentConversation}
          loading={convoLoading}
          titleUpdatingSessionId={titleUpdatingSessionId}
          onSelect={selectConversation}
          onDelete={handleDeleteConversation}
          onNew={startNewConversation}
        />
      </Sidebar>

      {/* Main Chat Area */}
      <ChatMain
        messages={messages}
        isLoading={isLoading}
        showExample={showExample}
        chatMode={chatMode}
        setChatMode={setChatMode}
        sendMessage={sendMessage}
        getExamplePrompt={getExamplePrompt}
        sessionId={sessionId}
        onTitleExtracted={onTitleExtracted}
      />

      {/* Right Sidebar - Builds */}
      <Sidebar
        isOpen={rightSidebarOpen}
        onToggle={() => setRightSidebarOpen(!rightSidebarOpen)}
        title="견적 목록"
        position="right"
      >
        <BuildsList
          builds={builds}
          loading={buildsLoading}
          error={null}
          onViewBuild={handleViewBuild}
          onDelete={handleDeleteBuild}
          onRefresh={loadBuilds}
        />
      </Sidebar>
    </div>
  );
};

export default ChatLayout;
