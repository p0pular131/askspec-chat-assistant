
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MessageInput } from './MessageInput';
import { Message } from './types';
import { useConversations, Conversation } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useBuilds } from '../hooks/useBuilds';
import { toast } from '../components/ui/use-toast';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatConversationList from './ChatConversationList';
import BuildsList from './BuildsList';
import ExpertiseSurvey from './ExpertiseSurvey';

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
  
  const navigate = useNavigate();
  
  const { 
    conversations, 
    loading: convoLoading, 
    createConversation, 
    deleteConversation,
    updateTitleFromFirstMessage,
    deleteBuild
  } = useConversations();
  
  const { 
    messages: dbMessages, 
    loading: msgLoading, 
    addMessage, 
    loadMessages, 
    callOpenAI 
  } = useMessages(currentConversation?.id || null);

  const {
    builds,
    loading: buildsLoading
  } = useBuilds();
  
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

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      
      // If the deleted conversation was the current one, reset the current conversation
      if (currentConversation?.id === id) {
        setCurrentConversation(null);
        setMessages([]);
        setShowExample(true);
      }
      
      toast({
        title: "성공",
        description: "대화가 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "대화 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBuild = async (buildId: string) => {
    try {
      await deleteBuild(buildId);
      toast({
        title: "성공",
        description: "PC 빌드가 삭제되었습니다.",
      });
    } catch (error) {
      toast({
        title: "오류",
        description: "PC 빌드 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleViewBuild = (buildId: string) => {
    navigate(`/build/${buildId}`);
  };

  // Map the selected answer to an expertise level
  const getExpertiseLevel = () => {
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
        
        // Update the title based on the first message
        await updateTitleFromFirstMessage(newConversation.id, text);
        
        // Create OpenAI messages array
        const apiMessages = [{ role: 'user', content: text }];
        
        // Get response from OpenAI, passing expertise level
        const response = await callOpenAI(apiMessages, chatMode, getExpertiseLevel());
        
        // Add assistant response to database
        await addMessage(response, 'assistant', newConversation.id);
      } else {
        // Add user message
        await addMessage(text, 'user', currentConversation.id);
        
        // If this is the first message, update the title
        if (dbMessages.length === 0) {
          await updateTitleFromFirstMessage(currentConversation.id, text);
        }
        
        // Create OpenAI messages array from existing messages
        const apiMessages = dbMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        // Add the new user message
        apiMessages.push({ role: 'user', content: text });
        
        // Get response from OpenAI, passing expertise level
        const response = await callOpenAI(apiMessages, chatMode, getExpertiseLevel());
        
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
            onClick={() => setActiveTab('builds')}
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
            PC 빌드
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
              builds={builds}
              loading={buildsLoading}
              onViewBuild={handleViewBuild}
              onDelete={handleDeleteBuild}
            />
          )}
        </div>
      </Sidebar>

      <main className="flex-1 p-6">
        <div className="flex relative flex-col p-6 bg-white rounded-xl border border-gray-200 shadow-sm size-full h-full">
          <ChatHeader />

          <ChatMessages messages={messages} isLoading={isLoading} />

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
        <ExpertiseSurvey 
          selectedAnswer={selectedAnswer} 
          onSelectAnswer={setSelectedAnswer} 
        />
      </Sidebar>
    </div>
  );
};
