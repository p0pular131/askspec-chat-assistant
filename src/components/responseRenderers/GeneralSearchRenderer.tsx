
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Cpu, InfoIcon } from 'lucide-react';
import { Badge } from '../ui/badge';

interface GeneralSearchRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'low' | 'middle' | 'high' | null;
}

const GeneralSearchRenderer: React.FC<GeneralSearchRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'low' 
}) => {
  return (
    <div className="general-search-response relative">
      <div className="mb-2 flex justify-start">
        <Badge 
          variant="outline" 
          className={`${getBadgeClass(expertiseLevel)} flex items-center px-2 py-0.5 text-xs`}
        >
          {getExpertiseLevelIcon(expertiseLevel)}
          <span className="ml-1">{getExpertiseLevelLabel(expertiseLevel)}</span>
        </Badge>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

// Helper functions for styling based on expertise level
const getBadgeClass = (level: string | null): string => {
  switch (level) {
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'middle':
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getExpertiseLevelLabel = (level: string | null): string => {
  switch (level) {
    case 'low':
      return '입문자';
    case 'high':
      return '전문가';
    case 'middle':
      return '중급자';
    default:
      return '선택되지 않음';
  }
};

const getExpertiseLevelIcon = (level: string | null) => {
  switch (level) {
    case 'low':
      return <BookOpen className="h-3 w-3" />;
    case 'high':
      return <Cpu className="h-3 w-3" />;
    case 'middle':
      return <InfoIcon className="h-3 w-3" />;
    default:
      return <InfoIcon className="h-3 w-3" />;
  }
};

export default GeneralSearchRenderer;
