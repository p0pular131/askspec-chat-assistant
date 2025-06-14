
import React from 'react';
import BuildRecommendationRenderer from './BuildRecommendationRenderer';
import PartRecommendationRenderer from './PartRecommendationRenderer';
import CompatibilityCheckRenderer from './CompatibilityCheckRenderer';
import BuildEvaluationRenderer from './BuildEvaluationRenderer';
import SpecUpgradeRenderer from './SpecUpgradeRenderer';
import GeneralSearchRenderer from './GeneralSearchRenderer';
import ErrorMessageRenderer from './ErrorMessageRenderer';
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

/**
 * ResponseRenderer - AI 응답을 적절한 형태로 렌더링하는 컴포넌트
 * 
 * 이 컴포넌트는 AI로부터 받은 응답을 분석하여 적절한 렌더러를 선택합니다.
 * 
 * 지원하는 응답 유형:
 * 1. 견적 추천 (build_recommendation) - PC 견적 추천 결과
 * 2. 부품 추천 (part_recommendation) - 개별 부품 추천 결과  
 * 3. 호환성 검사 (compatibility_check) - 부품 호환성 분석 결과
 * 4. 견적 평가 (build_evaluation) - 기존 견적 평가 결과
 * 5. 스펙 업그레이드 (spec_upgrade) - 업그레이드 제안 결과
 * 6. 범용 검색 (general_search) - 일반적인 질의응답 결과
 * 7. 오류 메시지 (error) - API 오류 또는 처리 실패
 * 
 * 처리 플로우:
 * 1. 응답이 오류인지 먼저 확인
 * 2. JSON 형태인지 확인하여 구조화된 응답인지 판단
 * 3. 응답 타입에 따라 적절한 렌더러 선택
 * 4. 채팅 모드를 기반으로 폴백 렌더러 결정
 */

/**
 * 전문가 수준 변환 함수
 * UI에서 사용하는 형태를 내부 처리용으로 변환
 * @param level - UI 전문가 수준
 * @returns 내부 처리용 전문가 수준
 */
const convertExpertiseLevel = (level: "low" | "middle" | "high"): "beginner" | "intermediate" | "expert" => {
  switch (level) {
    case "low": return "beginner";
    case "middle": return "intermediate";
    case "high": return "expert";
    default: return "beginner";
  }
};

/**
 * JSON 응답 데이터인지 확인하는 함수
 * @param text - 확인할 텍스트
 * @returns JSON 응답 여부
 */
const isJsonResponse = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' && parsed.response_type;
  } catch {
    return false;
  }
};

/**
 * 오류 메시지인지 확인하는 함수
 * 다양한 오류 형태를 감지합니다:
 * - API 응답 오류 (detail.success === false)
 * - 직접 오류 객체 (success === false)
 * - 오류 응답 타입 (response_type === 'error')
 * 
 * @param text - 확인할 텍스트
 * @returns 오류 메시지 여부
 */
const isErrorMessage = (text: string): boolean => {
  try {
    const parsed = JSON.parse(text);
    
    // API 응답 오류 (detail 객체에 success: false)
    if (parsed.detail && parsed.detail.success === false) {
      return true;
    }
    
    // 직접 오류 객체
    if (parsed.success === false) {
      return true;
    }
    
    // 오류 응답 타입
    if (parsed.response_type === 'error') {
      return true;
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * 채팅 모드를 기반으로 응답 타입을 결정하는 함수
 * JSON 파싱에 실패했을 때 채팅 모드를 기반으로 적절한 렌더러를 선택
 * 
 * @param chatMode - 현재 채팅 모드
 * @returns 해당하는 응답 타입
 */
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
  
  // 1단계: 오류 메시지 확인 (최우선)
  if (isErrorMessage(content)) {
    return (
      <ErrorMessageRenderer
        content={content}
        sessionId={sessionId}
        expertiseLevel={expertiseLevel}
      />
    );
  }
  
  // 2단계: JSON 응답인지 확인
  if (isJsonResponse(content)) {
    try {
      const response: ResponseData = JSON.parse(content);
      
      // 응답 타입에 따른 렌더러 선택
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
          // 알 수 없는 응답 타입인 경우 채팅 모드 기반 폴백
          const fallbackResponseType = getResponseTypeFromChatMode(chatMode);
          return renderByResponseType(fallbackResponseType, content, sessionId, expertiseLevel, convertedExpertiseLevel);
      }
    } catch (error) {
      console.warn('JSON 응답 파싱 실패, 채팅 모드 기반 렌더링으로 폴백:', error);
      // JSON 파싱 실패시 채팅 모드 기반 폴백
      const responseType = getResponseTypeFromChatMode(chatMode);
      return renderByResponseType(responseType, content, sessionId, expertiseLevel, convertedExpertiseLevel);
    }
  }
  
  // 3단계: 일반 텍스트 응답 - 채팅 모드 기반 렌더링
  const responseType = getResponseTypeFromChatMode(chatMode);
  return renderByResponseType(responseType, content, sessionId, expertiseLevel, convertedExpertiseLevel);
};

/**
 * 응답 타입에 따라 렌더러를 선택하는 헬퍼 함수
 * 코드 중복을 줄이기 위해 분리된 함수
 * 
 * @param responseType - 응답 타입
 * @param content - 응답 내용
 * @param sessionId - 세션 ID
 * @param expertiseLevel - UI 전문가 수준
 * @param convertedExpertiseLevel - 변환된 전문가 수준
 * @returns 적절한 렌더러 컴포넌트
 */
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
