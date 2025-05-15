
import React from 'react';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import { fetchCompatibilityData } from '../../integrations/supabase/client';
import { useState, useEffect } from 'react';

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  isCompatibilityRequest?: boolean;
}

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ content, chatMode, isCompatibilityRequest }) => {
  const [compatibilityData, setCompatibilityData] = useState<any>(null);
  
  // Fetch compatibility data if needed
  useEffect(() => {
    const loadCompatibilityData = async () => {
      if (chatMode === '호환성 검사' || isCompatibilityRequest) {
        try {
          const data = await fetchCompatibilityData();
          setCompatibilityData(data);
        } catch (error) {
          console.error('Error fetching compatibility data:', error);
        }
      }
    };
    
    loadCompatibilityData();
  }, [chatMode, isCompatibilityRequest]);

  // Select the appropriate renderer based on chat mode
  switch (chatMode) {
    case '범용 검색':
      return <GeneralSearchRenderer content={content} />;
    case '부품 추천':
      return <PartRecommendationRenderer content={content} />;
    case '호환성 검사':
      return <CompatibilityCheckRenderer content={content} compatibilityData={compatibilityData} />;
    case '견적 추천':
      return <BuildRecommendationRenderer content={content} />;
    case '스펙 업그레이드':
      return <SpecUpgradeRenderer content={content} />;
    case '견적 평가':
      return <BuildEvaluationRenderer content={content} />;
    default:
      // For compatibility checks detected in other modes
      if (isCompatibilityRequest && compatibilityData) {
        return <CompatibilityCheckRenderer content={content} compatibilityData={compatibilityData} />;
      }
      // Default to general search renderer
      return <GeneralSearchRenderer content={content} />;
  }
};

export default ResponseRenderer;
