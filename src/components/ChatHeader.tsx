
import React from 'react';
import ExpertiseLevelIndicator from './ExpertiseLevelIndicator';

interface ChatHeaderProps {
  selectedExpertiseLevel: number | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ selectedExpertiseLevel }) => {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold tracking-normal text-zinc-900">
        AskSpec
        <span className="block text-lg font-medium">
          컴퓨터 견적 추천 서비스
        </span>
      </h1>
      <ExpertiseLevelIndicator selectedLevel={selectedExpertiseLevel} />
    </header>
  );
};

export default ChatHeader;
