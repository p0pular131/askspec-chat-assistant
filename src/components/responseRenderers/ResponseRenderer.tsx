
import React from 'react';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import ReactMarkdown from 'react-markdown';

interface ResponseData {
  response_type: string;
  [key: string]: any;
}

interface ResponseRendererProps {
  content: string;
  chatMode: string;
  sessionId?: string;
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

// Helper function to detect if content is JSON response data
const isJsonResponse = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && parsed.response_type;
  } catch {
    return false;
  }
};

export const ResponseRenderer: React.FC<ResponseRendererProps> = ({ 
  content, 
  chatMode,
  sessionId,
  expertiseLevel = "low"
}) => {
  const convertedExpertiseLevel = convertExpertiseLevel(expertiseLevel);
  
  // Check if the content is a JSON response
  if (isJsonResponse(content)) {
    try {
      const response: ResponseData = JSON.parse(content);
      
      switch (response.response_type) {
        case 'build_recommendation':
          return (
            <BuildRecommendationRenderer
              content={content}
              expertiseLevel={convertedExpertiseLevel}
            />
          );
        case 'part_recommendation':
          return (
            <PartRecommendationRenderer
              content={content}
              expertiseLevel={expertiseLevel}
            />
          );
        case 'compatibility_check':
          return (
            <CompatibilityCheckRenderer
              content={content}
              expertiseLevel={convertedExpertiseLevel}
            />
          );
        case 'build_evaluation':
          return (
            <BuildEvaluationRenderer
              content={content}
              expertiseLevel={convertedExpertiseLevel}
            />
          );
        case 'spec_upgrade':
          return (
            <SpecUpgradeRenderer
              content={content}
              expertiseLevel={expertiseLevel}
            />
          );
        case 'general_search':
          return (
            <GeneralSearchRenderer
              content={response.content || response.message || content}
              expertiseLevel={expertiseLevel}
            />
          );
        default:
          // Unknown response type, fallback to general search
          return (
            <GeneralSearchRenderer
              content={content}
              expertiseLevel={expertiseLevel}
            />
          );
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back to markdown:', error);
      // Fallback to markdown rendering
      return (
        <div className="prose prose-zinc prose-sm max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      );
    }
  }
  
  // For non-JSON content, render as GeneralSearchRenderer
  return (
    <GeneralSearchRenderer
      content={content}
      sessionId={sessionId}
      expertiseLevel={expertiseLevel}
    />
  );
};
