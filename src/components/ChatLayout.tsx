
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ChatMessage as ChatMessageComponent } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { SurveyOption } from './SurveyOption';
import { Message } from './types';
import { useAuth } from '../contexts/AuthContext';
import { useConversations, Conversation } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { toast } from '../components/ui/use-toast';

export const ChatLayout: React.FC = () => {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [chatMode, setChatMode] = useState('범용 검색');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showExample, setShowExample] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  
  const { user, isLoading: authLoading } = useAuth();
  const { conversations, loading: convoLoading, createConversation, deleteConversation } = useConversations();
  const { messages: dbMessages, loading: msgLoading, addMessage, loadMessages, callOpenAI } = useMessages(currentConversation?.id || null);
  
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

  // Sync messages from database
  useEffect(() => {
    if (currentConversation?.id) {
      loadMessages(currentConversation.id);
    }
  }, [currentConversation]);

  // Convert database messages to UI messages
  useEffect(() => {
    if (dbMessages) {
      const uiMessages = dbMessages.map(msg => ({
        text: msg.content,
        isUser: msg.role === 'user',
      }));
      setMessages(uiMessages);
    }
  }, [dbMessages]);

  const startNewConversation = async () => {
    try {
      const conversation = await createConversation('New Conversation');
      setCurrentConversation(conversation);
      setMessages([]);
      setShowExample(true);
    } catch (error) {
      toast({
        title: "오류",
        description: "새 대화를 시작하는데 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const selectConversation = async (conversation: Conversation) => {
    setCurrentConversation(conversation);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Create a new conversation if none exists
      if (!currentConversation) {
        const newConversation = await createConversation('New Conversation');
        setCurrentConversation(newConversation);
        
        // Add user message
        await addMessage(text, 'user', newConversation.id);
        
        // Create OpenAI messages array
        const apiMessages = [{ role: 'user', content: text }];
        
        // Get response from OpenAI
        const response = await callOpenAI(apiMessages, chatMode);
        
        // Add assistant response to database
        await addMessage(response, 'assistant', newConversation.id);
      } else {
        // Add user message
        await addMessage(text, 'user', currentConversation.id);
        
        // Create OpenAI messages array from existing messages
        const apiMessages = dbMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add the new user message
        apiMessages.push({ role: 'user', content: text });
        
        // Get response from OpenAI
        const response = await callOpenAI(apiMessages, chatMode);
        
        // Add assistant response to database
        await addMessage(response, 'assistant', currentConversation.id);
      }
      
      setShowExample(false);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "오류",
        description: "메시지 전송에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExamplePrompt = () => {
    const examples = {
      '범용 검색': "게이밍용 컴퓨터 견적 추천해주세요. 예산은 150만원 정도입니다.",
      '부품 추천': "게이밍에 적합한 그래픽카드 추천해주세요.",
      '견적 추천': "영상 편집용 컴퓨터 견적을 만들어주세요. 4K 영상 작업이 필요합니다.",
      '호환성 검사': "인텔 13세대 CPU와 B660 메인보드가 호환되나요?",
      '스펙 업그레이드': "현재 i5-10400, GTX 1660 사용 중인데 업그레이드할 부품을 추천해주세요.",
      '견적 평가': "RTX 4060, i5-13400F, 16GB RAM, 1TB SSD로 구성된 견적 어떤가요?",
    };
    return examples[chatMode as keyof typeof examples] || examples["범용 검색"];
  };

  if (authLoading) {
    return <div className="flex justify-center items-center h-screen">로딩 중...</div>;
  }

  return (
    <div className="flex w-screen h-screen bg-neutral-100">
      <Sidebar
        isOpen={leftOpen}
        onToggle={() => setLeftOpen(!leftOpen)}
        title="대화 목록"
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
        </div>

        <div className="pt-4 mt-4 border-t border-gray-200">
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between pl-2 mb-2 text-xs text-stone-500">
                <span>대화 목록</span>
                <button 
                  onClick={startNewConversation}
                  className="p-1 text-xs text-white bg-askspec-purple rounded-full hover:bg-askspec-purple-dark"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                  </svg>
                </button>
              </div>

              {convoLoading ? (
                <div className="p-2 text-sm text-center">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-2 text-sm text-center text-gray-500">대화 내역이 없습니다.</div>
              ) : (
                conversations.map((convo) => (
                  <div key={convo.id} className="flex items-center gap-2">
                    <button
                      className={`p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100 ${
                        currentConversation?.id === convo.id ? 'bg-neutral-100 font-medium' : ''
                      }`}
                      onClick={() => selectConversation(convo)}
                    >
                      {convo.title || 'Untitled conversation'}
                    </button>
                    <button
                      onClick={() => deleteConversation(convo.id)}
                      className="p-1 text-red-500 rounded hover:bg-red-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
          {user && (
            <div className="p-2 flex items-center justify-between">
              <div className="text-sm text-gray-700 truncate">{user.email}</div>
              <button
                onClick={() => {
                  supabase.auth.signOut();
                  navigate('/auth');
                }}
                className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              >
                로그아웃
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
              <ChatMessageComponent key={index} message={message} />
            ))}
            
            {isLoading && (
              <div className="self-start max-w-[80%] rounded-lg p-3 bg-gray-100 text-zinc-900 rounded-tl-none">
                <p className="text-sm">생각 중...</p>
              </div>
            )}
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
            isDisabled={isLoading}
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
