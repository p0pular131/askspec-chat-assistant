
import React from 'react';
import { Message } from '../types';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';

interface ResponseRendererProps {
  content: string;
  chatMode?: string;
  isCompatibilityRequest?: boolean;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

const sampleCompatibilityData = {
  CPU_Memory: true,
  CPU_Memory_Reason: "Compatible",
  CPU_Motherboard: true,
  CPU_Motherboard_Reason: "Compatible",
  Memory_Motherboard: true,
  Memory_Motherboard_Reason: "Compatible",
  Motherboard_Case: true,
  Motherboard_Case_Reason: "Compatible",
  Power_CPU: true,
  Power_CPU_Reason: "Sufficient power",
  Power_GPU: true,
  Power_GPU_Reason: "Sufficient power",
  Power_Total: true,
  Power_Total_Reason: "Sufficient total power",
  suggestion: "All components are compatible",
  components: [] // Required components property
};

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  content, 
  chatMode = '범용 검색',
  isCompatibilityRequest = false,
  expertiseLevel = 'beginner'
}) => {
  let parsedData;
  try {
    parsedData = JSON.parse(content);
  } catch (e) {
    console.warn("Failed to parse message content as JSON", content);
  }

  // Handle different chat modes
  switch (chatMode) {
    case '범용 검색':
      return <GeneralSearchRenderer content={content} expertiseLevel={expertiseLevel} />;
    
    case '부품 추천':
      return <PartRecommendationRenderer content={content} partData={parsedData || undefined} />;
    
    case 'PC 견적':
      return <BuildRecommendationRenderer content={content} recommendationData={parsedData || undefined} />;
    
    case '호환성 검사':
      return <CompatibilityCheckRenderer content={content} compatibilityData={parsedData || sampleCompatibilityData} />;
    
    case '견적 평가':
      return <BuildEvaluationRenderer content={content} evaluationData={parsedData || undefined} />;
    
    case '스펙 업그레이드':
      return <SpecUpgradeRenderer content={content} upgradeData={parsedData || undefined} />;
    
    default:
      return <GeneralSearchRenderer content={content} expertiseLevel={expertiseLevel} />;
  }
};

export default ResponseRenderer;
