
import React from 'react';

interface ChatHeaderProps {
  expertiseLevel?: string | null;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ expertiseLevel }) => {
  // Map expertise level to Korean
  const getExpertiseLevelText = (level: string | null | undefined) => {
    switch(level) {
      case 'expert':
        return '전문가';
      case 'intermediate':
        return '중급자';
      case 'beginner':
        return '입문자';
      default:
        return '선택되지 않음';
    }
  };

  return (
    <header className="mb-6 flex justify-between items-center">
      <h1 className="text-2xl font-bold tracking-normal text-zinc-900">
        AskSpec
        <span className="block text-lg font-medium">
          컴퓨터 견적 추천 서비스
        </span>
      </h1>
      
      <div className="text-sm font-medium px-3 py-1 rounded-full bg-gray-100 border border-gray-200">
        응답 형식: {getExpertiseLevelText(expertiseLevel)}
      </div>
    </header>
  );
};

export default ChatHeader;
