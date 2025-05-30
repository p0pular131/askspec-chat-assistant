
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

      console.log('[✅ 견적 평가] API 응답 성공');
      
      // API 응답이 JSON 형태인지 확인
      if (typeof apiResponse === 'object') {
        return JSON.stringify(apiResponse);
      }
      
      return apiResponse;
    } catch (error) {
      console.error('[❌ 견적 평가] API 호출 실패:', error);
      return `견적 평가 중 오류가 발생했습니다: ${error.message}`;
    }
  }
};
