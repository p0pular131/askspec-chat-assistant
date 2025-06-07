
import { ResponseModule } from './types';
import { callSpecUpgradeAPI } from '../../services/apiService';

export const specUpgradeModule: ResponseModule = {
  name: 'specUpgrade',
  moduleType: '스펙 업그레이드',
  process: async (content: string, expertiseLevel?: string, sessionId?: string) => {
    if (!sessionId) {
      console.warn('[⚠️ 스펙 업그레이드] sessionId가 없어 샘플 응답 반환');
      return `스펙 업그레이드를 위해 세션이 필요합니다.`;
    }

    try {
      console.log('[🔄  스펙 업그레이드] API 호출 시작:', { content, expertiseLevel, sessionId });
      
      const apiResponse = await callSpecUpgradeAPI({
        sessionId,
        userPrompt: content,
        userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert' || 'beginner'
      });

      console.log('[✅ 스펙 업그레이드] API 응답 성공');
      
      // Return the full API response including the ID
      return JSON.stringify(apiResponse);
    } catch (error) {
      console.error('[❌ 스펙 업그레이드] API 호출 실패:', error);
      return `스펙 업그레이드 중 오류가 발생했습니다: ${error.message}`;
    }
  }
};
