
import React from 'react';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import { sampleBuildRecommendation, sampleCompatibilityData, sampleBuildEvaluationData } from '../../data/sampleData';

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  isCompatibilityRequest?: boolean;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  content, 
  chatMode, 
  isCompatibilityRequest,
  expertiseLevel = 'beginner'
}) => {
  // Add components property to compatibility data if missing
  const compatibilityDataWithComponents = {
    ...sampleCompatibilityData,
    components: ['CPU', 'Memory', 'Motherboard', 'VGA', 'PSU', 'Case', 'Cooler', 'Storage']
  };

  // Select the appropriate renderer based on chat mode
  switch (chatMode) {
    case '범용 검색':
      return <GeneralSearchRenderer content={content} expertiseLevel={expertiseLevel} />;
    case '부품 추천':
      return <PartRecommendationRenderer content={content} />;
    case '호환성 검사':
      return <CompatibilityCheckRenderer content={content} compatibilityData={compatibilityDataWithComponents} />;
    case '견적 추천':
      return <BuildRecommendationRenderer content={content} recommendationData={sampleBuildRecommendation} />;
    case '스펙 업그레이드':
      return <SpecUpgradeRenderer content={content} />;
    case '견적 평가':
      return <BuildEvaluationRenderer content={content} evaluationData={sampleBuildEvaluationData} />;
    default:
      // For compatibility checks detected in other modes
      if (isCompatibilityRequest) {
        return <CompatibilityCheckRenderer content={content} compatibilityData={compatibilityDataWithComponents} />;
      }
      // Default to general search renderer
      return <GeneralSearchRenderer content={content} expertiseLevel={expertiseLevel} />;
  }
};

export default ResponseRenderer;
