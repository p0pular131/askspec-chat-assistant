
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

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  response, 
  expertiseLevel = "low"
}) => {
  switch (response.response_type) {
    case 'build_recommendation':
      return (
        <BuildRecommendationRenderer
          response={response}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'part_recommendation':
      return (
        <PartRecommendationRenderer
          response={response}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'compatibility_check':
      return (
        <CompatibilityCheckRenderer
          response={response}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'build_evaluation':
      return (
        <BuildEvaluationRenderer
          response={response}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'spec_upgrade':
      return (
        <SpecUpgradeRenderer
          response={response}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'general_search':
      return (
        <GeneralSearchRenderer
          response={response}
          expertiseLevel={expertiseLevel}
        />
      );
    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-600">Unknown response type: {(response as any).response_type}</p>
        </div>
      );
  }
};
