
import React from 'react';
import { BookOpen, Cpu, InfoIcon } from 'lucide-react';
import { Badge } from './ui/badge';

interface ExpertiseLevelIndicatorProps {
  selectedLevel: number | null;
}

const ExpertiseLevelIndicator: React.FC<ExpertiseLevelIndicatorProps> = ({ selectedLevel }) => {
  const getLevelLabel = () => {
    switch (selectedLevel) {
      case 1:
        return "전문가";
      case 2:
        return "중급자";
      case 3:
        return "입문자";
      default:
        return "선택되지 않음";
    }
  };
  
  const getLevelIcon = () => {
    switch (selectedLevel) {
      case 1:
        return <Cpu className="h-3 w-3" />;
      case 2:
        return <InfoIcon className="h-3 w-3" />;
      case 3:
        return <BookOpen className="h-3 w-3" />;
      default:
        return null;
    }
  };
  
  const getBadgeClass = () => {
    switch (selectedLevel) {
      case 1:
        return "bg-red-100 text-red-700 border-red-300";
      case 2:
        return "bg-green-100 text-green-700 border-green-300";
      case 3:
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };
  
  return (
    <div className="flex items-center">
      <Badge variant="outline" className={getBadgeClass()}>
        <span className="flex items-center gap-1">
          {getLevelIcon()}
          <span>응답 형식: {getLevelLabel()}</span>
        </span>
      </Badge>
    </div>
  );
};

export default ExpertiseLevelIndicator;
