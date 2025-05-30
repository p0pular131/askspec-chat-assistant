
import React, { useEffect } from 'react';
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
  onTitleExtracted?: (title: string) => void;
}

// Helper function to map expertise levels for internal use
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

// Helper function to extract title from response content
const extractTitleFromContent = (content: string): string | null => {
  try {
    const parsed = JSON.parse(content);
    return parsed.title || null;
  } catch (error) {
    // If JSON parsing fails, try to extract title from markdown-like format
    const titleMatch = content.match(/^#\s*(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }
    return null;
  }
};

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  content, 
  chatMode, 
  sessionId,
  isCompatibilityRequest,
  expertiseLevel = 'beginner',
  onTitleExtracted
}) => {
  const mappedExpertiseLevel = mapExpertiseLevel(expertiseLevel);

  // Extract title when content changes
  useEffect(() => {
    if (onTitleExtracted && content) {
      const extractedTitle = extractTitleFromContent(content);
      if (extractedTitle) {
        onTitleExtracted(extractedTitle);
      }
    }
  }, [content, onTitleExtracted]);

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
