
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

/**
 * ChatMain - 채팅 인터페이스의 메인 컴포넌트
 * 
 * 이 컴포넌트는 채팅 화면의 중앙 영역을 담당합니다.
 * 
 * 주요 구성 요소:
 * 1. ChatHeader - 현재 전문가 수준을 표시하는 헤더
 * 2. 초기 UI 또는 ChatMessages - 대화 내용 표시 영역
 * 3. MessageInput - 메시지 입력 및 전송 영역
 * 
 * 화면 상태:
 * - 초기 상태: 세션이 없고 메시지가 없을 때 환영 화면 표시
 * - 대화 상태: 메시지가 있을 때 대화 내용 표시
 * 
 * 레이아웃:
 * - 헤더: 고정 위치
 * - 메시지 영역: 스크롤 가능한 중앙 영역
 * - 입력 영역: 하단 고정 (절대 위치)
 * 
 * @param messages - 표시할 메시지 목록
 * @param isLoading - 로딩 상태 (AI 응답 대기중)
 * @param showExample - 예시 화면 표시 여부
 * @param chatMode - 현재 채팅 모드
 * @param setChatMode - 채팅 모드 변경 함수
 * @param sendMessage - 메시지 전송 함수
 * @param getExamplePrompt - 예시 프롬프트 가져오기 함수
 * @param expertiseLevel - 현재 전문가 수준
 * @param sessionId - 현재 세션 ID
 */
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
  // 현재 채팅 모드에 맞는 예시 텍스트 가져오기
  const exampleText = getExamplePrompt();

  /**
   * 메시지 전송 핸들러
   * 단순히 상위 컴포넌트의 sendMessage 함수를 호출
   * @param text - 전송할 메시지 텍스트
   */
  const handleSendMessage = (text: string) => {
    sendMessage(text);
  };

  /**
   * 초기 UI 표시 조건 결정
   * 세션 ID가 없고, 메시지가 없으며, 로딩 중이 아닐 때 초기 UI 표시
   * 
   * 조건:
   * - sessionId가 없음 (세션이 선택되지 않음)
   * - messages가 비어있음 (대화 내용이 없음)
   * - isLoading이 false (AI 응답 대기 중이 아님)
   */
  const shouldShowInitialUI = !sessionId && messages.length === 0 && !isLoading;

  return (
    <main className="flex-1 p-6 relative">
      {/* 메인 컨테이너 - 흰색 배경의 둥근 테두리 카드 */}
      <div className="flex relative flex-col bg-white rounded-xl border border-gray-200 shadow-sm h-full">
        {/* 헤더 영역 - 전문가 수준 표시 */}
        <div className="p-6 pb-0">
          <ChatHeader expertiseLevel={expertiseLevel} />
        </div>

        {/* 조건부 메인 컨텐츠 영역 */}
        {shouldShowInitialUI ? (
          /* 초기 환영 화면 */
          <div className="flex-1 flex items-center justify-center p-6 mb-24">
            <div className="flex flex-col items-center justify-center space-y-6">
              {/* 환영 메시지 */}
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                  컴퓨터 견적 AI 어시스턴트
                </h2>
                <p className="text-gray-600 max-w-md">
                  원하는 용도에 맞는 컴퓨터 견적을 추천받아보세요
                </p>
              </div>
              
              {/* 예시 및 현재 모드 카드 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                {/* 예시 질문 카드 */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-800 mb-2">💡 예시 질문</h3>
                  <p className="text-sm text-gray-600">"{exampleText}"</p>
                </div>
                
                {/* 현재 모드 카드 */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">🎯 현재 모드</h3>
                  <p className="text-sm text-blue-600 font-medium">{chatMode}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 대화 메시지 영역 */
          <div className="flex-1 px-6 min-h-0 mb-24">
            <ChatMessages 
              messages={messages} 
              sessionId={sessionId}
              isLoading={isLoading}
              chatMode={chatMode}
            />
          </div>
        )}

        {/* 메시지 입력 영역 - 하단 고정 */}
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

// memo로 래핑하여 불필요한 리렌더링 방지
export default memo(ChatMain);
