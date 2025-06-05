
import React from 'react';
import { BuildRecommendationRenderer } from './BuildRecommendationRenderer';
import { PartRecommendationRenderer } from './PartRecommendationRenderer';
import { CompatibilityCheckRenderer } from './CompatibilityCheckRenderer';
import { BuildEvaluationRenderer } from './BuildEvaluationRenderer';
import { SpecUpgradeRenderer } from './SpecUpgradeRenderer';
import { GeneralSearchRenderer } from './GeneralSearchRenderer';
import { ResponseData } from '../types';

interface ResponseRendererProps {
  response: ResponseData;
  expertiseLevel?: string | null;
}

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  response, 
  expertiseLevel 
}) => {
  // Map expertise levels from ChatHeader format to component format
  const mapExpertiseLevel = (level: string | null | undefined): "beginner" | "intermediate" | "expert" => {
    switch(level) {
      case 'low':
        return 'beginner';
      case 'middle':
        return 'intermediate';
      case 'high':
        return 'expert';
      default:
        return 'beginner';
    }
  };

  const mappedExpertiseLevel = mapExpertiseLevel(expertiseLevel);

  switch (response.response_type) {
    case 'build_recommendation':
      return (
        <BuildRecommendationRenderer
          response={response}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case 'part_recommendation':
      return (
        <PartRecommendationRenderer
          response={response}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case 'compatibility_check':
      return (
        <CompatibilityCheckRenderer
          response={response}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case 'build_evaluation':
      return (
        <BuildEvaluationRenderer
          response={response}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case 'spec_upgrade':
      return (
        <SpecUpgradeRenderer
          response={response}
          expertiseLevel={mappedExpertiseLevel}
        />
      );
    case 'general_search':
      return (
        <GeneralSearchRenderer
          response={response}
          expertiseLevel={mappedExpertiseLevel}
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
