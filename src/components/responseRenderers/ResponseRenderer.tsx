
import React from 'react';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  sessionId?: string;
  isCompatibilityRequest?: boolean;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

// Helper function to map expertise levels
const mapExpertiseLevel = (level: 'beginner' | 'intermediate' | 'expert'): 'low' | 'middle' | 'high' => {
  switch (level) {
    case 'beginner':
      return 'low';
    case 'intermediate':
      return 'middle';
    case 'expert':
      return 'high';
    default:
      return 'low';
  }
};

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  content, 
  chatMode, 
  sessionId,
  isCompatibilityRequest,
  expertiseLevel = 'beginner'
}) => {
  const mappedExpertiseLevel = mapExpertiseLevel(expertiseLevel);

  // Select the appropriate renderer based on chat mode
  switch (chatMode) {
    case '범용 검색':
      return (
        <GeneralSearchRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel} 
        />
      );
    case '부품 추천':
      return (
        <PartRecommendationRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case '호환성 검사':
      return (
        <CompatibilityCheckRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case '견적 추천':
      return (
        <BuildRecommendationRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case '스펙 업그레이드':
      return (
        <SpecUpgradeRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case '견적 평가':
      return (
        <BuildEvaluationRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    default:
      // For compatibility checks detected in other modes
      if (isCompatibilityRequest) {
        return (
          <CompatibilityCheckRenderer 
            content={content} 
            sessionId={sessionId}
            expertiseLevel={mappedExpertiseLevel}
          />
        );
      }
      // Default to general search renderer
      return (
        <GeneralSearchRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={mappedExpertiseLevel} 
        />
      );
  }
};

export default ResponseRenderer;
