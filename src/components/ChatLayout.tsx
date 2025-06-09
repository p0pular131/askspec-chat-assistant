import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { useConversationState } from '../hooks/useConversationState';
import ChatMain from './ChatMain';
import ChatConversationList from './ChatConversationList';
import BuildsList from './BuildsList';
import ExpertiseSurvey from './ExpertiseSurvey';
import { useEstimates } from '../hooks/useEstimates';

// Helper function to validate if a string is a valid UUID
const isUUID = (str: string | null): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export const ChatLayout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations,
    convoLoading,
    dbMessages,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    sendMessage,
    loadMessages,
    chatMode,
    setChatMode,
    getExamplePrompt,
    autoSwitchDisabled,
    checkForNewBuilds,
    disableAutoSwitch
  } = useConversationState();

  const {
    estimates,
    fetchEstimates
  } = useEstimates();

  // Listen for estimates updates
  useEffect(() => {
    const handleEstimatesUpdated = () => {
      fetchEstimates();
    };

    window.addEventListener('estimatesSaved', handleEstimatesUpdated);
    
    return () => {
      window.removeEventListener('estimatesSaved', handleEstimatesUpdated);
    };
  }, [fetchEstimates]);

  // Only load messages when a conversation is explicitly selected
  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(String(currentConversation.id));
    }
  }, [currentConversation, loadMessages]);
  
  // Refresh conversations list when the active tab changes to chat
  useEffect(() => {
    if (activeTab === 'chat') {
      // Only reload messages if there's an active conversation
      const fetchConversations = async () => {
        try {
          if (currentConversation?.id) {
            await loadMessages(String(currentConversation.id));
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };
      
      fetchConversations();
    }
  }, [activeTab, currentConversation, loadMessages]);
  
  // Refresh estimates list when the active tab changes to builds
  useEffect(() => {
    if (activeTab === 'builds') {
      fetchEstimates();
      disableAutoSwitch();
    }
  }, [activeTab, fetchEstimates, disableAutoSwitch]);

  // Handle estimate view - this is now handled inside BuildsList component
  const handleViewEstimate = useCallback(async (estimateId: string) => {
    console.log('View estimate called with ID:', estimateId);
    // This function is kept for compatibility but actual logic is in BuildsList
  }, []);

  // Track build count and automatically switch to builds tab when new builds are created
  useEffect(() => {
    const hasNewBuilds = checkForNewBuilds(estimates);
    
    // Automatically switch to the builds tab when a new build is created
    // But only if the user hasn't disabled auto-switching
    if (hasNewBuilds && !autoSwitchDisabled) {
      setActiveTab('builds');
    }
  }, [estimates, autoSwitchDisabled, checkForNewBuilds]);

  // Map the selected answer to an expertise level (순서 변경됨)
  const getExpertiseLevel = useCallback(() => {
    switch(selectedAnswer) {
      case 1:
        return 'low';     // 입문자
      case 2:
        return 'middle';  // 중급자
      case 3:
        return 'high';    // 전문가
      default:
        return 'low';
    }
  }, [selectedAnswer]);

  // Get the display expertise level (what will be shown in the UI)
  const getDisplayExpertiseLevel = useCallback(() => {
    if (selectedAnswer === null) {
      return null;
    }
    return getExpertiseLevel();
  }, [selectedAnswer, getExpertiseLevel]);

  const handleSendMessage = useCallback((text: string) => {
    // Reset auto-switch disabled flag when sending a new message
    disableAutoSwitch();
    sendMessage(text, getExpertiseLevel(), chatMode);
  }, [sendMessage, getExpertiseLevel, chatMode, disableAutoSwitch]);

  // Get the display expertise level for UI
  const displayExpertiseLevel = getDisplayExpertiseLevel();

  return (
    <div className="flex w-screen h-screen bg-neutral-100">
      <Sidebar
        isOpen={leftOpen}
        onToggle={() => setLeftOpen(!leftOpen)}
        title="메뉴"
        position="left"
      >
        <div className="flex flex-col gap-2">
          <button
            className={`flex gap-2 items-center p-3 w-full text-sm text-left rounded-lg text-zinc-900 ${
              activeTab === 'chat' ? 'bg-neutral-100' : ''
            }`}
            onClick={() => setActiveTab('chat')}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path
                d="M14 7.5C14 10.5376 11.5376 13 8.5 13C7.62891 13 6.81127 12.8034 6.08716 12.4532L2 13.5L3.04678 9.41284C2.69661 8.68873 2.5 7.87109 2.5 7C2.5 3.96243 4.96243 1.5 8 1.5C11.0376 1.5 13.5 3.96243 13.5 7"
                stroke="#404040"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            채팅
          </button>
          
          <button
            className={`flex gap-2 items-center p-3 w-full text-sm text-left rounded-lg text-zinc-900 ${
              activeTab === 'builds' ? 'bg-neutral-100' : ''
            }`}
            onClick={() => {
              setActiveTab('builds');
              disableAutoSwitch();
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path
                d="M5.5 14V11.5M10.5 14V11.5M2 5.5V14H14V5.5M2 5.5H14M2 5.5L3.5 2H12.5L14 5.5"
                stroke="#404040"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            PC 견적
          </button>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          {activeTab === 'chat' && (
            <ChatConversationList
              conversations={conversations}
              currentConversation={currentConversation}
              loading={convoLoading}
              onSelect={selectConversation}
              onDelete={handleDeleteConversation}
              onNew={startNewConversation}
            />
          )}
          
          {activeTab === 'builds' && (
            <BuildsList
              onViewBuild={handleViewEstimate}
              onRefresh={fetchEstimates}
            />
          )}
        </div>
      </Sidebar>

      <ChatMain
        messages={messages}
        isLoading={isLoading}
        showExample={showExample}
        chatMode={chatMode}
        setChatMode={setChatMode}
        sendMessage={handleSendMessage}
        getExamplePrompt={getExamplePrompt}
        expertiseLevel={displayExpertiseLevel}
      />

      <Sidebar
        isOpen={rightOpen}
        onToggle={() => setRightOpen(!rightOpen)}
        title="응답 형식 설문"
        position="right"
      >
        <ExpertiseSurvey 
          selectedAnswer={selectedAnswer} 
          onSelectAnswer={setSelectedAnswer} 
        />
      </Sidebar>
    </div>
  );
};
