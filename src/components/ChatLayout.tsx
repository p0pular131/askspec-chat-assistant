import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { useConversationState } from '../hooks/useConversationState';
import ChatMain from './ChatMain';
import ChatConversationList from './ChatConversationList';
import BuildsList from './BuildsList';
import ExpertiseSurvey from './ExpertiseSurvey';
import { Button } from './ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { generateBuildsFromMessages } from '../utils/buildExtractor';

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
  const [chatMode, setChatMode] = useState('범용 검색');
  const [lastBuildCount, setLastBuildCount] = useState(0);
  const [autoSwitchDisabled, setAutoSwitchDisabled] = useState(false);
  const [isGeneratingBuilds, setIsGeneratingBuilds] = useState(false);
  
  const {
    currentConversation,
    messages,
    showExample,
    isLoading,
    conversations,
    convoLoading,
    dbMessages,
    builds,
    buildsLoading,
    startNewConversation,
    selectConversation,
    handleDeleteConversation,
    handleDeleteBuild,
    handleViewBuild,
    sendMessage,
    loadMessages,
    loadBuilds
  } = useConversationState();

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation?.id && isUUID(currentConversation.id)) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation, loadMessages]);
  
  // Refresh conversations list when the active tab changes to chat
  useEffect(() => {
    if (activeTab === 'chat') {
      // This will ensure we always have the latest conversations when switching to the chat tab
      const fetchConversations = async () => {
        try {
          if (currentConversation?.id && isUUID(currentConversation.id)) {
            await loadMessages(currentConversation.id);
          }
        } catch (error) {
          console.error('Error loading messages:', error);
        }
      };
      
      fetchConversations();
    }
  }, [activeTab, currentConversation, loadMessages]);
  
  // Refresh builds list when the active tab changes to builds
  useEffect(() => {
    if (activeTab === 'builds') {
      loadBuilds();
      // Reset auto-switch flag when user manually goes to builds tab
      setAutoSwitchDisabled(true);
      setTimeout(() => setAutoSwitchDisabled(false), 10000); // Re-enable after 10 seconds
    }
  }, [activeTab, loadBuilds]);

  // Track build count and automatically switch to builds tab when new builds are created
  useEffect(() => {
    // If this is the first load, just save the count
    if (lastBuildCount === 0 && builds.length > 0) {
      setLastBuildCount(builds.length);
      return;
    }
    
    // Detect new builds by comparing the current count with the previous count
    if (builds.length > lastBuildCount) {
      // Automatically switch to the builds tab when a new build is created
      // But only if the user hasn't disabled auto-switching
      if (!autoSwitchDisabled) {
        setActiveTab('builds');
      }
    }
    
    // Update the last build count
    setLastBuildCount(builds.length);
  }, [builds.length, lastBuildCount, autoSwitchDisabled]);

  // Map the selected answer to an expertise level
  const getExpertiseLevel = useCallback(() => {
    switch(selectedAnswer) {
      case 1:
        return 'expert';
      case 2:
        return 'intermediate';
      case 3:
        return 'beginner';
      default:
        return 'intermediate'; // Default to intermediate if no selection
    }
  }, [selectedAnswer]);

  const handleSendMessage = useCallback((text: string) => {
    // Reset auto-switch disabled flag when sending a new message
    setAutoSwitchDisabled(false);
    sendMessage(text, getExpertiseLevel(), chatMode);
  }, [sendMessage, getExpertiseLevel, chatMode]);

  const getExamplePrompt = useCallback(() => {
    const examples = {
      '범용 검색': "게이밍용 컴퓨터 견적 추천해주세요. 예산은 150만원 정도입니다.",
      '부품 추천': "게이밍에 적합한 그래픽카드 추천해주세요.",
      '견적 추천': "영상 편집용 컴퓨터 견적을 만들어주세요. 4K 영상 작업이 필요합니다.",
      '호환성 검사': "인텔 13세대 CPU와 B660 메인보드가 호환되나요?",
      '스펙 업그레이드': "현재 i5-10400, GTX 1660 사용 중인데 업그레이드할 부품을 추천해주세요.",
      '견적 평가': "RTX 4060, i5-13400F, 16GB RAM, 1TB SSD로 구성된 견적 어떤가요?",
    };
    return examples[chatMode as keyof typeof examples] || examples["범용 검색"];
  }, [chatMode]);

  const handleGenerateBuilds = async () => {
    setIsGeneratingBuilds(true);
    try {
      await generateBuildsFromMessages();
      // Refresh builds list after generation
      await loadBuilds();
      // Switch to builds tab to show the results
      setActiveTab('builds');
    } catch (error) {
      console.error('Error generating builds:', error);
    } finally {
      setIsGeneratingBuilds(false);
    }
  };

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
              // Reset auto-switch flag when user manually goes to builds tab
              setAutoSwitchDisabled(true);
              setTimeout(() => setAutoSwitchDisabled(false), 10000); // Re-enable after 10 seconds
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
            <>
              <BuildsList
                builds={builds}
                loading={buildsLoading}
                error={null}
                onViewBuild={handleViewBuild}
                onDelete={handleDeleteBuild}
                onRefresh={loadBuilds}
              />
              
              {/* Button to generate builds from existing conversations */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full text-sm"
                  onClick={handleGenerateBuilds}
                  disabled={isGeneratingBuilds}
                >
                  {isGeneratingBuilds ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                      견적 생성 중...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 mr-2" />
                      기존 대화에서 견적 생성
                    </>
                  )}
                </Button>
              </div>
            </>
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
