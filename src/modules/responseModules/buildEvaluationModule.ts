
import { ResponseModule } from './types';
import { callBuildEvaluationAPI } from '../../services/apiService';

export const buildEvaluationModule: ResponseModule = {
  name: 'buildEvaluation',
  moduleType: '견적 평가',
  process: async (userMessage: string, expertiseLevel: string = 'intermediate', sessionId?: string) => {
    if (!sessionId) {
      console.warn('[⚠️ 견적 평가] sessionId가 없어 샘플 응답 반환');
      return `견적 평가를 위해 세션이 필요합니다.`;
    }

    try {
      console.log('[🔄 견적 평가] API 호출 시작:', { userMessage, expertiseLevel, sessionId });
      
      const apiResponse = await callBuildEvaluationAPI({
        sessionId,
        userPrompt: userMessage,
        userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert'
      });

      console.log('[✅ 견적 평가] API 응답 성공:', apiResponse);
      
      // Include estimate ID in the response if available
      let responseWithId;
      if (apiResponse.id) {
        responseWithId = {
          success: true,
          response_type: 'build_evaluation',
          id: apiResponse.id,
          estimate_id: apiResponse.id,
          estimateId: apiResponse.id,
          ...apiResponse
        };
      } else {
        // API 응답이 JSON 형태인지 확인
        if (typeof apiResponse === 'object') {
          responseWithId = {
            success: true,
            response_type: 'build_evaluation',
            ...apiResponse
          };
        } else {
          responseWithId = apiResponse;
        }
      }
      
      console.log('[🔍 견적 평가] 최종 응답 구조:', responseWithId);
      return typeof responseWithId === 'object' ? JSON.stringify(responseWithId) : responseWithId;
    } catch (error) {
      console.error('[❌ 견적 평가] API 호출 실패:', error);
      
      // API 에러 응답을 ErrorMessageRenderer가 처리할 수 있는 형태로 반환
      const errorResponse = {
        success: false,
        response_type: 'error',
        message: '견적 평가 중 오류가 발생했습니다.',
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
