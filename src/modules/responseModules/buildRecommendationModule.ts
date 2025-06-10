
import { ResponseModule } from './types';
import { callBuildRecommendationAPI } from '../../services/apiService';

export const buildRecommendationModule: ResponseModule = {
  name: 'buildRecommendation',
  moduleType: '견적 추천',
  process: async (content: string, expertiseLevel?: string, sessionId?: string) => {
    if (!sessionId) {
      console.warn('[⚠️ 견적 추천] sessionId가 없어 샘플 응답 반환');
      return `견적 추천을 위해 세션이 필요합니다.`;
    }

    try {
      console.log('[🔄 견적 추천] API 호출 시작:', { content, expertiseLevel, sessionId });
      
      const apiResponse = await callBuildRecommendationAPI({
        sessionId,
        userPrompt: content,
        userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert' || 'beginner'
      });

      console.log('[✅ 견적 추천] API 응답 성공:', apiResponse);
      
      // Ensure the estimateId is included at multiple levels for better extraction
      const responseWithId = {
        success: true,
        response_type: 'build_recommendation',
        id: apiResponse.id, // Top level ID
        estimate_id: apiResponse.id, // Alternative ID field
        estimateId: apiResponse.id, // Another alternative ID field
        response: {
          ...apiResponse.response,
          id: apiResponse.id, // ID in response object
          estimate_id: apiResponse.id // Alternative ID in response object
        },
        ...apiResponse // Include all other fields from the API response
      };
      
      console.log('[🔍 견적 추천] 최종 응답 구조:', responseWithId);
      return JSON.stringify(responseWithId);
    } catch (error) {
      console.error('[❌ 견적 추천] API 호출 실패:', error);
      
      // API 에러 응답을 ErrorMessageRenderer가 처리할 수 있는 형태로 반환
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
