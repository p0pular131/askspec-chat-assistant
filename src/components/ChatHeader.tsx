
import React from 'react';
import { Badge } from './ui/badge';
import { BookOpen, Cpu, InfoIcon } from 'lucide-react';

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

  // Get badge class based on expertise level
  const getBadgeClass = (level: string | null | undefined): string => {
    switch(level) {
      case 'beginner':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'expert':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'intermediate':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // Get icon based on expertise level
  const getExpertiseLevelIcon = (level: string | null | undefined) => {
    switch(level) {
      case 'beginner':
        return <BookOpen className="h-3 w-3 mr-1" />;
      case 'expert':
        return <Cpu className="h-3 w-3 mr-1" />;
      case 'intermediate':
        return <InfoIcon className="h-3 w-3 mr-1" />;
      default:
        return <InfoIcon className="h-3 w-3 mr-1" />;
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
      
      <Badge 
        variant="outline" 
        className={`${getBadgeClass(expertiseLevel)} px-2 py-0.5 text-xs flex items-center`}
      >
        {getExpertiseLevelIcon(expertiseLevel)}
        <span>응답 형식: {getExpertiseLevelText(expertiseLevel)}</span>
      </Badge>
    </header>
  );
};

export default ChatHeader;
