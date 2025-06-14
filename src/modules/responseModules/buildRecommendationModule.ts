
import { ResponseModule } from './types';
import { callBuildRecommendationAPI } from '../../services/apiService';

/**
 * buildRecommendationModule - 견적 추천 응답 모듈
 * 
 * 이 모듈은 "견적 추천" 채팅 모드에서 사용되는 응답 처리 모듈입니다.
 * 사용자의 요구사항을 분석하여 적합한 PC 견적을 추천하는 AI API를 호출합니다.
 * 
 * 주요 기능:
 * 1. 사용자 요구사항 분석 - 용도, 예산, 성능 요구사항 파악
 * 2. AI 견적 추천 API 호출 - 백엔드 AI 서비스를 통한 맞춤형 견적 생성
 * 3. 응답 데이터 처리 - 견적 ID 추출 및 응답 형태 표준화
 * 4. 에러 처리 - API 호출 실패시 적절한 에러 응답 반환
 * 
 * API 호출 매개변수:
 * - sessionId: 현재 대화 세션 ID (대화 컨텍스트 유지)
 * - userPrompt: 사용자 입력 메시지 (견적 요구사항)
 * - userLevel: 사용자 전문가 수준 (beginner/intermediate/expert)
 * 
 * 응답 형태:
 * - 성공시: 견적 ID와 함께 구조화된 견적 데이터 반환
 * - 실패시: 에러 응답 형태로 반환 (ErrorMessageRenderer에서 처리)
 * 
 * 견적 데이터 구조:
 * - 견적 기본 정보: 제목, 총 가격, 추천 이유
 * - 부품별 상세 정보: 각 부품의 이름, 스펙, 가격, 추천 이유, 구매 링크, 이미지
 * - 견적 평가: 성능, 가성비, 확장성, 소음 점수
 * - 추가 제안: AI의 추가 제안사항
 * 
 * 사용 예시:
 * - "게임용 고사양 PC 추천해주세요"
 * - "100만원 예산으로 사무용 PC 견적 부탁드립니다"
 * - "4K 영상 편집용 워크스테이션 추천"
 */

export const buildRecommendationModule: ResponseModule = {
  name: 'buildRecommendation',
  moduleType: '견적 추천',
  
  /**
   * 견적 추천 처리 함수
   * 
   * 사용자의 견적 요구사항을 받아 AI API를 호출하고 추천 견적을 반환합니다.
   * 
   * @param content - 사용자 입력 메시지 (견적 요구사항)
   * @param expertiseLevel - 사용자 전문가 수준 (기본값: 'beginner')
   * @param sessionId - 현재 세션 ID (대화 컨텍스트 유지용)
   * @returns 견적 추천 응답 JSON 문자열 또는 에러 응답
   */
  process: async (content: string, expertiseLevel?: string, sessionId?: string) => {
    // 세션 ID 유효성 검사
    if (!sessionId) {
      console.warn('[⚠️ 견적 추천] sessionId가 없어 샘플 응답 반환');
      return `견적 추천을 위해 세션이 필요합니다.`;
    }

    try {
      console.log('[🔄 견적 추천] API 호출 시작:', { content, expertiseLevel, sessionId });
      
      // 백엔드 AI 견적 추천 API 호출
      const apiResponse = await callBuildRecommendationAPI({
        sessionId,
        userPrompt: content,
        userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert' || 'beginner'
      });

      console.log('[✅ 견적 추천] API 응답 성공');
      
      /**
       * 응답 데이터 구조화
       * 
       * API 응답에서 견적 ID를 최상위 레벨로 추출하여
       * BuildRecommendationRenderer에서 저장 기능에 사용할 수 있도록 합니다.
       */
      const responseWithId = {
        id: apiResponse.id, // 견적 저장을 위한 고유 ID
        response_type: 'build_recommendation', // 응답 타입 식별자
        response: apiResponse.response || apiResponse, // 원본 견적 데이터
        ...apiResponse // API 응답의 모든 필드 포함
      };
      
      return JSON.stringify(responseWithId);
      
    } catch (error) {
      console.error('[❌ 견적 추천] API 호출 실패:', error);
      
      /**
       * 에러 응답 처리
       * 
       * API 호출 실패시 ErrorMessageRenderer가 처리할 수 있는 형태로
       * 에러 응답을 구조화합니다.
       */
      const errorResponse = {
        success: false,
        response_type: 'error',
        message: '견적 추천 중 오류가 발생했습니다.',
        detail: {
          success: false,
          message: error?.response?.data?.message || error?.message || '알 수 없는 오류가 발생했습니다.',
          original_error: error?.response?.data || error?.message
        }
      };
      
      return JSON.stringify(errorResponse);
    }
  }
};
