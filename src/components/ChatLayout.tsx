
import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { SurveyOption } from './SurveyOption';
import { Message } from './types';

export const ChatLayout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState('Analyze');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExample, setShowExample] = useState(true);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    setMessages([
      ...messages,
      {
        text,
        isUser: true,
      },
      {
        text: `Response based on ${chatMode} mode...`,
        isUser: false,
      },
    ]);
    setShowExample(false);
  };

  const getExamplePrompt = () => {
    const examples = {
      Analyze: "게이밍용 컴퓨터 견적 추천해주세요. 예산은 150만원 정도입니다.",
      Create: "영상 편집용 컴퓨터 견적을 만들어주세요. 4K 영상 작업이 필요합니다.",
      Explain: "RTX 4060과 RTX 3060의 차이점을 설명해주세요.",
      Solve: "컴퓨터가 갑자기 느려졌는데, 어떤 부품을 업그레이드해야 할까요?",
      Compare: "인텔 13세대와 AMD 라이젠 7000 시리즈 중 어떤 CPU가 더 나을까요?",
      Suggest: "현재 시장에서 가성비가 좋은 그래픽카드를 추천해주세요.",
    };
    return examples[chatMode as keyof typeof examples] || examples["Analyze"];
  };

  return (
    <div className="flex w-screen h-screen bg-neutral-100">
      <Sidebar
        isOpen={leftOpen}
        onToggle={() => setLeftOpen(!leftOpen)}
        title="작업목록"
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
              activeTab === 'build' ? 'bg-neutral-100' : ''
            }`}
            onClick={() => setActiveTab('build')}
          >
            <svg viewBox="0 0 16 16" fill="none" className="w-4 h-4">
              <path
                d="M6.5 13.5H4.5C3.94772 13.5 3.5 13.0523 3.5 12.5V10.5M13.5 6.5V4.5C13.5 3.94772 13.0523 3.5 12.5 3.5H10.5M3.5 6.5V4.5C3.5 3.94772 3.94772 3.5 4.5 3.5H6.5M10.5 13.5H12.5C13.0523 13.5 13.5 13.0523 13.5 12.5V10.5"
                stroke="#404040"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            빌드
          </button>
        </div>
        <div className="pt-4 mt-4 border-t border-gray-200">
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-2">
              <div className="pl-2 mb-2 text-xs text-stone-500">
                최근 채팅 목록
              </div>
              <button className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100">
                게이밍 PC 견적 문의
              </button>
              <button className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100">
                사무용 컴퓨터 추천
              </button>
              <button className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100">
                그래픽카드 비교
              </button>
            </div>
          )}
          {activeTab === 'build' && (
            <div className="flex flex-col gap-2">
              <div className="pl-2 mb-2 text-xs text-stone-500">
                견적 목록
              </div>
              <button className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100">
                게이밍 PC (150만원)
              </button>
              <button className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100">
                영상편집용 워크스테이션
              </button>
              <button className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100">
                사무용 미니 PC
              </button>
            </div>
          )}
        </div>
      </Sidebar>

      <main className="flex-1 p-6">
        <div className="flex relative flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm size-full h-full">
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-normal text-zinc-900">
              AskSpec
              <span className="block text-lg font-medium">
                컴퓨터 견적 추천 서비스
              </span>
            </h1>
          </header>

          <div className="flex overflow-y-auto flex-col flex-1 gap-4 mb-20">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>

          {showExample && messages.length === 0 && (
            <div className="absolute top-2/4 left-2/4 px-5 py-0 text-base italic text-center -translate-x-2/4 -translate-y-2/4 pointer-events-none max-w-[600px] text-neutral-400">
              {getExamplePrompt()}
            </div>
          )}

          <MessageInput
            onSendMessage={sendMessage}
            chatMode={chatMode}
            setChatMode={setChatMode}
            showExample={showExample}
            exampleText={getExamplePrompt()}
          />
        </div>
      </main>

      <Sidebar
        isOpen={rightOpen}
        onToggle={() => setRightOpen(!rightOpen)}
        title="응답 형식 설문"
        position="right"
      >
        <div className="mb-8">
          <h2 className="mb-2 text-base font-medium text-zinc-900">
            본인에게 적절하다고 느끼는 설명을 선택해주세요.
          </h2>
          <p className="mb-6 text-sm text-stone-500">
            해당 설문은 AskSpec의 응답 형식에 반영됩니다.
          </p>
          <div className="flex flex-col gap-4">
            <SurveyOption
              id={1}
              title="전문가"
              description="예시: RTX 4060 (AD107 기반)는 DLSS 3와 4세대 NVENC를 지원해 영상 인코딩/AI 워크플로우에 최적입니다."
              isSelected={selectedAnswer === 1}
              onSelect={() => setSelectedAnswer(1)}
            />
            <SurveyOption
              id={2}
              title="중급자"
              description="예시: RTX 4060은 8GB의 메모리를 보유하고 있으며, 영상 편집과 간단한 게임 모두에 적합한 중급형 그래픽카드입니다."
              isSelected={selectedAnswer === 2}
              onSelect={() => setSelectedAnswer(2)}
            />
            <SurveyOption
              id={3}
              title="입문자"
              description="예시: 영상이 끊기지 않고 부드럽게 재생되도록 도와주는 그래픽카드예요"
              isSelected={selectedAnswer === 3}
              onSelect={() => setSelectedAnswer(3)}
            />
          </div>
        </div>
      </Sidebar>
    </div>
  );
};
