
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './Sidebar';
import { useConversationState } from '../hooks/useConversationState';
import ChatMain from './ChatMain';
import ChatConversationList from './ChatConversationList';
import BuildsList from './BuildsList';
import ExpertiseSurvey from './ExpertiseSurvey';
import { useEstimates } from '../hooks/useEstimates';

/**
 * UUID 형식인지 검증하는 헬퍼 함수
 * @param str - 검증할 문자열
 * @returns UUID 형식인지 여부
 */
const isUUID = (str: string | null): boolean => {
  if (!str) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * ChatLayout - 애플리케이션의 메인 레이아웃 컴포넌트
 * 
 * 이 컴포넌트는 전체 채팅 애플리케이션의 구조를 관리합니다:
 * - 좌측 사이드바: 메뉴와 대화 목록/빌드 목록
 * - 중앙 영역: 채팅 인터페이스
 * - 우측 사이드바: 전문가 수준 설문
 * 
 * 주요 상태:
 * - leftOpen/rightOpen: 사이드바 열림/닫힘 상태
 * - activeTab: 현재 활성 탭 ('chat' 또는 'builds')
 * - selectedAnswer: 전문가 수준 설문 선택 답변
 * 
 * 전체 플로우:
 * 1. 초기 로드시 대화 목록과 빌드 목록을 가져옴
 * 2. 사용자가 탭을 전환하면 해당 데이터를 새로고침
 * 3. 새로운 빌드가 생성되면 자동으로 빌드 탭으로 전환
 * 4. 전문가 수준에 따라 AI 응답의 복잡도가 조정됨
 */
export const ChatLayout: React.FC = () => {
  // 사이드바 상태 관리
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  
  // 탭 상태 관리 ('chat' 또는 'builds')
  const [activeTab, setActiveTab] = useState('chat');
  
  // 전문가 수준 설문 답변 (1: 입문자, 2: 중급자, 3: 전문가)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  // 대화 상태 관리를 위한 커스텀 훅
  // 모든 대화 관련 상태와 액션을 통합 관리
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
    disableAutoSwitch,
    resetToInitialState
  } = useConversationState();

  // 빌드/견적 관리를 위한 훅
  const {
    estimates,
    fetchEstimates
  } = useEstimates();

  /**
   * 견적 업데이트 이벤트 리스너
   * 견적이 저장될 때마다 견적 목록을 새로고침
   */
  useEffect(() => {
    const handleEstimatesUpdated = () => {
      fetchEstimates();
    };

    window.addEventListener('estimatesSaved', handleEstimatesUpdated);
    
    return () => {
      window.removeEventListener('estimatesSaved', handleEstimatesUpdated);
    };
  }, [fetchEstimates]);

  /**
   * 대화가 선택될 때 메시지 로드
   * 명시적으로 대화가 선택된 경우에만 메시지를 불러옴
   */
  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(String(currentConversation.id));
    }
  }, [currentConversation, loadMessages]);
  
  /**
   * 채팅 탭 활성화시 대화 새로고침
   * 탭이 채팅으로 변경되면 현재 대화의 메시지를 다시 로드
   */
  useEffect(() => {
    if (activeTab === 'chat') {
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
  
  /**
   * 빌드 탭 활성화시 견적 새로고침
   * 탭이 빌드로 변경되면 견적 목록을 새로고침하고 자동 전환 비활성화
   */
  useEffect(() => {
    if (activeTab === 'builds') {
      fetchEstimates();
      disableAutoSwitch();
    }
  }, [activeTab, fetchEstimates, disableAutoSwitch]);

  /**
   * 견적 보기 핸들러 (현재는 BuildsList 컴포넌트에서 처리)
   * @param estimateId - 견적 ID
   */
  const handleViewEstimate = useCallback(async (estimateId: string) => {
    console.log('View estimate called with ID:', estimateId);
    // 실제 로직은 BuildsList 컴포넌트에서 처리됨
  }, []);

  /**
   * 새로운 빌드 생성시 자동 탭 전환
   * 새로운 빌드가 생성되고 자동 전환이 비활성화되지 않은 경우
   * 자동으로 빌드 탭으로 전환
   */
  useEffect(() => {
    const hasNewBuilds = checkForNewBuilds(estimates);
    
    if (hasNewBuilds && !autoSwitchDisabled) {
      setActiveTab('builds');
    }
  }, [estimates, autoSwitchDisabled, checkForNewBuilds]);

  /**
   * 선택된 답변을 전문가 수준으로 매핑
   * @returns 전문가 수준 ('beginner' | 'intermediate' | 'expert')
   */
  const getExpertiseLevel = useCallback((): 'beginner' | 'intermediate' | 'expert' => {
    switch(selectedAnswer) {
      case 1:
        return 'beginner';     // 입문자
      case 2:
        return 'intermediate'; // 중급자
      case 3:
        return 'expert';       // 전문가
      default:
        return 'beginner';
    }
  }, [selectedAnswer]);

  /**
   * UI 표시용 전문가 수준 가져오기
   * @returns 전문가 수준 또는 null (선택되지 않은 경우)
   */
  const getDisplayExpertiseLevel = useCallback(() => {
    if (selectedAnswer === null) {
      return null;
    }
    return getExpertiseLevel();
  }, [selectedAnswer, getExpertiseLevel]);

  /**
   * 메시지 전송 핸들러
   * 자동 전환을 재활성화하고 메시지를 전송
   * @param text - 전송할 메시지 텍스트
   */
  const handleSendMessage = useCallback((text: string) => {
    // 새 메시지 전송시 자동 전환 플래그 리셋
    disableAutoSwitch();
    sendMessage(text, getExpertiseLevel(), chatMode);
  }, [sendMessage, getExpertiseLevel, chatMode, disableAutoSwitch]);

  // UI 표시용 전문가 수준
  const displayExpertiseLevel = getDisplayExpertiseLevel();

  return (
    <div className="flex w-screen h-screen bg-neutral-100">
      {/* 좌측 사이드바 - 메뉴 및 대화/빌드 목록 */}
      <Sidebar
        isOpen={leftOpen}
        onToggle={() => setLeftOpen(!leftOpen)}
        title="메뉴"
        position="left"
      >
        {/* 메인 메뉴 버튼들 */}
        <div className="flex flex-col gap-2">
          {/* 초기 화면으로 돌아가기 버튼 */}
          <button
            className="flex gap-2 items-center p-3 w-full text-sm text-left rounded-lg text-zinc-900 hover:bg-neutral-100"
            onClick={() => {
              resetToInitialState();
              setActiveTab('chat');
            }}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path
                d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.495V14.5M2.5 6l5.5-4.5L13.5 6v7a1 1 0 01-1 1h-9a1 1 0 01-1-1V6z"
                stroke="#404040"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            초기 화면
          </button>
          
          {/* 채팅 탭 버튼 */}
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
          
          {/* PC 견적 탭 버튼 */}
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

        {/* 탭별 컨텐츠 영역 */}
        <div className="pt-4 mt-4 border-t border-gray-200">
          {/* 채팅 탭: 대화 목록 표시 */}
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
          
          {/* 빌드 탭: 견적 목록 표시 */}
          {activeTab === 'builds' && (
            <BuildsList
              onViewBuild={handleViewEstimate}
              onRefresh={fetchEstimates}
            />
          )}
        </div>
      </Sidebar>

      {/* 중앙 채팅 영역 */}
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

      {/* 우측 사이드바 - 전문가 수준 설문 */}
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
