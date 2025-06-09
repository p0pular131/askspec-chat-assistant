
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

// Helper function to determine response type based on chat mode
const getResponseTypeFromChatMode = (chatMode: string): string => {
  const chatModeToResponseType: Record<string, string> = {
    '견적 추천': 'build_recommendation',
    '부품 추천': 'part_recommendation',
    '호환성 검사': 'compatibility_check',
    '견적 평가': 'build_evaluation',
    '스펙 업그레이드': 'spec_upgrade',
    '범용 검색': 'general_search'
  };
  
  return chatModeToResponseType[chatMode] || 'general_search';
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
              sessionId={sessionId}
              expertiseLevel={convertedExpertiseLevel}
            />
          );
        case 'part_recommendation':
          return (
            <PartRecommendationRenderer
              content={content}
              sessionId={sessionId}
              expertiseLevel={expertiseLevel}
            />
          );
        case 'compatibility_check':
          return (
            <CompatibilityCheckRenderer
              content={content}
              sessionId={sessionId}
              expertiseLevel={convertedExpertiseLevel}
            />
          );
        case 'build_evaluation':
          return (
            <BuildEvaluationRenderer
              content={content}
              sessionId={sessionId}
              expertiseLevel={convertedExpertiseLevel}
            />
          );
        case 'spec_upgrade':
          return (
            <SpecUpgradeRenderer
              content={content}
              sessionId={sessionId}
              expertiseLevel={expertiseLevel}
            />
          );
        case 'general_search':
          return (
            <GeneralSearchRenderer
              content={response.content || response.message || content}
              sessionId={sessionId}
              expertiseLevel={expertiseLevel}
            />
          );
        default:
          // Unknown response type, fallback based on chat mode
          const fallbackResponseType = getResponseTypeFromChatMode(chatMode);
          return renderByResponseType(fallbackResponseType, content, sessionId, expertiseLevel, convertedExpertiseLevel);
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, falling back based on chat mode:', error);
      // Fallback to chat mode based rendering
      const responseType = getResponseTypeFromChatMode(chatMode);
      return renderByResponseType(responseType, content, sessionId, expertiseLevel, convertedExpertiseLevel);
    }
  }
  
  // For non-JSON content, determine renderer based on chat mode
  const responseType = getResponseTypeFromChatMode(chatMode);
  return renderByResponseType(responseType, content, sessionId, expertiseLevel, convertedExpertiseLevel);
};

// Helper function to render by response type
const renderByResponseType = (
  responseType: string, 
  content: string, 
  sessionId: string | undefined, 
  expertiseLevel: "low" | "middle" | "high", 
  convertedExpertiseLevel: "beginner" | "intermediate" | "expert"
) => {
  switch (responseType) {
    case 'build_recommendation':
      return (
        <BuildRecommendationRenderer
          content={content}
          sessionId={sessionId}
          expertiseLevel={convertedExpertiseLevel}
        />
      );
    case 'part_recommendation':
      return (
        <PartRecommendationRenderer
          content={content}
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'compatibility_check':
      return (
        <CompatibilityCheckRenderer
          content={content}
          sessionId={sessionId}
          expertiseLevel={convertedExpertiseLevel}
        />
      );
    case 'build_evaluation':
      return (
        <BuildEvaluationRenderer
          content={content}
          sessionId={sessionId}
          expertiseLevel={convertedExpertiseLevel}
        />
      );
    case 'spec_upgrade':
      return (
        <SpecUpgradeRenderer
          content={content}
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
    case 'general_search':
    default:
      return (
        <GeneralSearchRenderer
          content={content}
          sessionId={sessionId}
          expertiseLevel={expertiseLevel}
        />
      );
  }
};
