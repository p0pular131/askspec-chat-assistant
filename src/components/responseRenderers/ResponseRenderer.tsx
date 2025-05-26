import React from 'react';
import { Message } from '../types';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';

interface ResponseRendererProps {
  message: Message;
  chatMode?: string;
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
  components: [] // Add the missing components property
};

const ResponseRenderer: React.FC<ResponseRendererProps> = ({ message, chatMode = '범용 검색' }) => {
  let parsedData;
  try {
    parsedData = JSON.parse(message.text);
  } catch (e) {
    console.warn("Failed to parse message content as JSON", message.text);
  }

  // Handle different chat modes
  switch (chatMode) {
    case '범용 검색':
      return <GeneralSearchRenderer content={message.text} />;
    
    case '부품 추천':
      return <PartRecommendationRenderer data={parsedData || sampleCompatibilityData} />;
    
    case 'PC 견적':
      return <BuildRecommendationRenderer data={parsedData || { parts: [], total_price: "0", suggestion: "" }} />;
    
    case '호환성 검사':
      return <CompatibilityCheckRenderer data={parsedData || sampleCompatibilityData} />;
    
    case '견적 평가':
      return <BuildEvaluationRenderer data={parsedData || sampleCompatibilityData} />;
    
    case '스펙 업그레이드':
      return <SpecUpgradeRenderer data={parsedData || { parts: [], total_price: "0", suggestion: "" }} />;
    
    default:
      return <GeneralSearchRenderer content={message.text} />;
  }
};

export default ResponseRenderer;
