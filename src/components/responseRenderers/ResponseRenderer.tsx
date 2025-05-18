
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
  isCompatibilityRequest?: boolean;
}

// Sample compatibility data for compatibility checks
const sampleCompatibilityData = {
  components: ['CPU', 'Motherboard', 'RAM', 'GPU', 'PSU', 'Storage'],
  CPU_Motherboard: true,
  CPU_RAM: true,
  Motherboard_RAM: true,
  GPU_PSU: true,
  CPU_Motherboard_Reason: "Socket types match (AM4)",
  GPU_PSU_Reason: "PSU provides sufficient wattage (650W)"
};

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ content, chatMode, isCompatibilityRequest }) => {
  // Select the appropriate renderer based on chat mode
  switch (chatMode) {
    case '범용 검색':
      return <GeneralSearchRenderer content={content} />;
    case '부품 추천':
      return <PartRecommendationRenderer content={content} />;
    case '호환성 검사':
      return <CompatibilityCheckRenderer content={content} compatibilityData={sampleCompatibilityData} />;
    case '견적 추천':
      return <BuildRecommendationRenderer content={content} />;
    case '스펙 업그레이드':
      return <SpecUpgradeRenderer content={content} />;
    case '견적 평가':
      return <BuildEvaluationRenderer content={content} />;
    default:
      // For compatibility checks detected in other modes
      if (isCompatibilityRequest) {
        return <CompatibilityCheckRenderer content={content} compatibilityData={sampleCompatibilityData} />;
      }
      // Default to general search renderer
      return <GeneralSearchRenderer content={content} />;
  }
};

export default ResponseRenderer;
