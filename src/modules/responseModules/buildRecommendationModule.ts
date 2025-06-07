
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

      console.log('[✅ 견적 추천] API 응답 성공');
      
      // Return the full API response including the ID
      return JSON.stringify(apiResponse);
    } catch (error) {
      console.error('[❌ 견적 추천] API 호출 실패:', error);
      return `견적 추천 중 오류가 발생했습니다: ${error.message}`;
    }
  }
};
