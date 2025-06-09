
import { ResponseModule } from './types';
import { callGeneralSearchAPI } from '../../services/apiService';

export const generalSearchModule: ResponseModule = {
  name: 'generalSearch',
  moduleType: '범용 검색',
  process: async (message: string, expertiseLevel: string = 'intermediate', sessionId?: string) => {
    if (!sessionId) {
      console.warn('[⚠️ 범용 검색] sessionId가 없어 샘플 응답 반환');
      return `범용 검색을 위해 세션이 필요합니다.`;
    }

    try {
      console.log('[🔄 범용 검색] API 호출 시작:', { message, expertiseLevel, sessionId });
      
      const apiResponse = await callGeneralSearchAPI({
        sessionId,
        userPrompt: message,
        userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert'
      });

      console.log('[✅ 범용 검색] API 응답 성공');
      
      // API 응답이 JSON 형태인지 확인
      if (typeof apiResponse === 'object') {
        return JSON.stringify(apiResponse);
      }
      
      return apiResponse;
    } catch (error) {
      console.error('[❌ 범용 검색] API 호출 실패:', error);
      
      // API 에러 응답을 ErrorMessageRenderer가 처리할 수 있는 형태로 반환
      const errorResponse = {
        success: false,
        response_type: 'error',
        message: '범용 검색 중 오류가 발생했습니다.',
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
