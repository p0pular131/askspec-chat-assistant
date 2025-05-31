import React, { useEffect } from 'react';
import { GeneralSearchRenderer } from './GeneralSearchRenderer';
import { PartRecommendationRenderer } from './PartRecommendationRenderer';
import { CompatibilityCheckRenderer } from './CompatibilityCheckRenderer';
import { BuildRecommendationRenderer } from './BuildRecommendationRenderer';
import { SpecUpgradeRenderer } from './SpecUpgradeRenderer';
import { BuildEvaluationRenderer } from './BuildEvaluationRenderer';

export type ExpertiseLevel = 'low' | 'middle' | 'high';

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  sessionId?: string;
  isCompatibilityRequest?: boolean;
  expertiseLevel?: ExpertiseLevel;
  onTitleExtracted?: (title: string) => void;
}

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({
  content,
  chatMode,
  sessionId,
  isCompatibilityRequest,
  expertiseLevel = 'middle',
  onTitleExtracted
}) => {
  // Extract title from content and call the callback
  useEffect(() => {
    if (onTitleExtracted) {
      try {
        const parsed = JSON.parse(content);
        if (parsed.title && typeof parsed.title === 'string') {
          onTitleExtracted(parsed.title);
        }
      } catch {
        // Try to extract title from markdown
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch && titleMatch[1]) {
          onTitleExtracted(titleMatch[1]);
        }
      }
    }
  }, [content, onTitleExtracted]);

  // Select the appropriate renderer based on chat mode
  const selectRenderer = () => {
    try {
      const parsed = JSON.parse(content);
      
      if (chatMode === 'general_search' || (!chatMode && parsed.suggestion)) {
        return (
          <GeneralSearchRenderer
            content={content}
            expertiseLevel={expertiseLevel === 'low' ? 'beginner' : expertiseLevel === 'middle' ? 'intermediate' : 'expert'}
          />
        );
      }

      if (chatMode === 'part_recommendation' || parsed.parts) {
        return <PartRecommendationRenderer content={content} />;
      }

      if (chatMode === 'compatibility_check' || isCompatibilityRequest || parsed.components) {
        return <CompatibilityCheckRenderer content={content} />;
      }

      if (chatMode === 'estimate_recommendation' || (parsed.parts && parsed.total_price)) {
        return (
          <BuildRecommendationRenderer
            content={content}
            sessionId={sessionId}
          />
        );
      }

      if (chatMode === 'spec_upgrade' || parsed.upgrade_parts) {
        return (
          <SpecUpgradeRenderer
            content={content}
            sessionId={sessionId}
          />
        );
      }

      if (chatMode === 'estimate_evaluation' || (parsed.performance && parsed.price_performance)) {
        return <BuildEvaluationRenderer content={content} />;
      }

      return (
        <GeneralSearchRenderer
          content={content}
          expertiseLevel={expertiseLevel === 'low' ? 'beginner' : expertiseLevel === 'middle' ? 'intermediate' : 'expert'}
        />
      );
    } catch (error) {
      return (
        <GeneralSearchRenderer
          content={content}
          expertiseLevel={expertiseLevel === 'low' ? 'beginner' : expertiseLevel === 'middle' ? 'intermediate' : 'expert'}
        />
      );
    }
  };

  return (
    <div className="w-full">
      {selectRenderer()}
    </div>
  );
};

export default ResponseRenderer;
