
import React from 'react';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import GeneralSearchRenderer from './GeneralSearchRenderer';

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  isUser: boolean;
  expertiseLevel?: string;
}

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({
  content,
  chatMode,
  isUser,
  expertiseLevel = 'middle'
}) => {
  // User messages don't need special rendering
  if (isUser) {
    return <div className="whitespace-pre-wrap">{content}</div>;
  }

  // Map expertise levels correctly
  const getCompatibleExpertiseLevel = (level: string): 'low' | 'middle' | 'high' => {
    switch (level) {
      case 'beginner':
        return 'low';
      case 'expert':
        return 'high';
      case 'intermediate':
      default:
        return 'middle';
    }
  };

  const mappedExpertiseLevel = getCompatibleExpertiseLevel(expertiseLevel);

  // Render based on chat mode
  switch (chatMode) {
    case '견적 추천':
      return (
        <BuildRecommendationRenderer 
          content={content} 
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    
    case '부품 추천':
      return (
        <PartRecommendationRenderer 
          content={content} 
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    
    case '호환성 검사':
      return (
        <CompatibilityCheckRenderer 
          content={content} 
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    
    case '스펙 업그레이드':
      return (
        <SpecUpgradeRenderer 
          content={content} 
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    
    case '견적 평가':
      return (
        <BuildEvaluationRenderer 
          content={content} 
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    
    case '범용 검색':
    default:
      return (
        <GeneralSearchRenderer 
          content={content} 
          expertiseLevel={mappedExpertiseLevel}
        />
      );
  }
};

export default ResponseRenderer;
