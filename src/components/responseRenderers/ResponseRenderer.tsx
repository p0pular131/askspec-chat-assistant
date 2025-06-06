
import React from 'react';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import GeneralSearchRenderer from './GeneralSearchRenderer';

interface ResponseData {
  response_type: string;
  [key: string]: any;
}

interface ResponseRendererProps {
  response: ResponseData;
  expertiseLevel?: "low" | "middle" | "high";
}

// Helper function to convert expertise levels
const convertExpertiseLevel = (level: "low" | "middle" | "high"): "beginner" | "intermediate" | "expert" => {
  switch (level) {
    case "low": return "beginner";
    case "middle": return "intermediate";
    case "high": return "expert";
    default: return "beginner";
  }
};

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  response, 
  expertiseLevel = "low"
}) => {
  const convertedExpertiseLevel = convertExpertiseLevel(expertiseLevel);
  
  switch (response.response_type) {
    case 'build_recommendation':
      return (
        <BuildRecommendationRenderer
          response={response}
          expertiseLevel={convertedExpertiseLevel}
        />
      );
    case 'part_recommendation':
      return (
        <PartRecommendationRenderer
          content={JSON.stringify(response)}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'compatibility_check':
      return (
        <CompatibilityCheckRenderer
          response={response}
          expertiseLevel={convertedExpertiseLevel}
        />
      );
    case 'build_evaluation':
      return (
        <BuildEvaluationRenderer
          content={JSON.stringify(response)}
          expertiseLevel={convertedExpertiseLevel}
        />
      );
    case 'spec_upgrade':
      return (
        <SpecUpgradeRenderer
          content={JSON.stringify(response)}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'general_search':
      return (
        <GeneralSearchRenderer
          content={response.content || response.message || ""}
          expertiseLevel={expertiseLevel}
        />
      );
    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Unknown response type: {response.response_type}</p>
        </div>
      );
  }
};
