
import { ResponseModule } from './types';
import { callPartRecommendationAPI } from '../../services/apiService';

export const partRecommendationModule: ResponseModule = {
  name: 'partRecommendation',
  moduleType: '부품 추천',
  process: async (message: string, expertiseLevel?: string, sessionId?: string) => {
    if (!sessionId) {
      console.warn('[⚠️ 부품 추천] sessionId가 없어 샘플 응답 반환');
      return `부품 추천을 위해 세션이 필요합니다.`;
    }

    try {
      console.log('[🔄 부품 추천] API 호출 시작:', { message, expertiseLevel, sessionId });
      
      const apiResponse = await callPartRecommendationAPI({
        sessionId,
        userPrompt: message,
        userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert' || 'beginner'
      });

      console.log('[✅ 부품 추천] API 응답 성공');
      
      // API 응답이 JSON 형태인지 확인
      if (typeof apiResponse === 'object') {
        return JSON.stringify(apiResponse);
      }
      
      return apiResponse;
    } catch (error) {
      console.error('[❌ 부품 추천] API 호출 실패:', error);
      return `부품 추천 중 오류가 발생했습니다: ${error.message}`;
    }
  }
};
