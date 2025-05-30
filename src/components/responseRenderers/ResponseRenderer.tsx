
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
  onTitleExtracted?: (title: string) => void;
}

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  content, 
  chatMode, 
  sessionId,
  isCompatibilityRequest,
  expertiseLevel = 'beginner',
  onTitleExtracted
}) => {
  // Extract title from content and call the callback
  React.useEffect(() => {
    if (onTitleExtracted && content) {
      try {
        // Try to parse the content as JSON to extract title
        const parsed = JSON.parse(content);
        if (parsed.title) {
          onTitleExtracted(parsed.title);
        }
      } catch {
        // If not JSON, extract title from markdown-like format
        const titleMatch = content.match(/^#\s*(.+)$/m) || content.match(/\*\*제목:\*\*\s*(.+)$/m);
        if (titleMatch) {
          onTitleExtracted(titleMatch[1].trim());
        }
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
          expertiseLevel={expertiseLevel} 
        />
      );
    case '부품 추천':
      return (
        <PartRecommendationRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    case '호환성 검사':
      return (
        <CompatibilityCheckRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    case '견적 추천':
      return (
        <BuildRecommendationRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    case '스펙 업그레이드':
      return (
        <SpecUpgradeRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    case '견적 평가':
      return (
        <BuildEvaluationRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    default:
      // For compatibility checks detected in other modes
      if (isCompatibilityRequest) {
        return (
          <CompatibilityCheckRenderer 
            content={content} 
            sessionId={sessionId}
            expertiseLevel={expertiseLevel}
          />
        );
      }
      // Default to general search renderer
      return (
        <GeneralSearchRenderer 
          content={content} 
          sessionId={sessionId}
          expertiseLevel={expertiseLevel} 
        />
      );
  }
};

export default ResponseRenderer;
