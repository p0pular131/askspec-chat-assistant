
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Cpu, InfoIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

interface GeneralSearchRendererProps {
  content: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

const GeneralSearchRenderer: React.FC<GeneralSearchRendererProps> = ({ 
  content, 
  expertiseLevel = 'beginner' 
}) => {
  return (
    <div className={`general-search-response ${getExpertiseLevelClass(expertiseLevel)} relative`}>
      <div className="mb-2">
        <Badge 
          variant="outline" 
          className={getBadgeClass(expertiseLevel)}
        >
          {getExpertiseLevelIcon(expertiseLevel)}
          <span className="ml-1">{getExpertiseLevelLabel(expertiseLevel)}</span>
        </Badge>
      </div>
      
      <div className={getContentClass(expertiseLevel)}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

// Helper functions for styling based on expertise level
const getExpertiseLevelClass = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'expertise-beginner';
    case 'expert':
      return 'expertise-expert';
    case 'intermediate':
    default:
      return 'expertise-intermediate';
  }
};

const getBadgeClass = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'expert':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'intermediate':
    default:
      return 'bg-green-100 text-green-700 border-green-300';
  }
};

const getContentClass = (level: string): string => {
  switch (level) {
    case 'beginner':
      return 'text-lg leading-relaxed';
    case 'expert':
      return 'text-sm leading-snug';
    case 'intermediate':
    default:
      return 'text-base leading-normal';
  }
};

const getExpertiseLevelLabel = (level: string): string => {
  switch (level) {
    case 'beginner':
      return '입문자';
    case 'expert':
      return '전문가';
    case 'intermediate':
    default:
      return '중급자';
  }
};

const getExpertiseLevelIcon = (level: string) => {
  switch (level) {
    case 'beginner':
      return <BookOpen className="h-3 w-3" />;
    case 'expert':
      return <Cpu className="h-3 w-3" />;
    case 'intermediate':
    default:
      return <InfoIcon className="h-3 w-3" />;
  }
};

export default GeneralSearchRenderer;
