
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// API 요청 공통 인터페이스
interface APIRequest {
  sessionId: string;
  userPrompt: string;
  userLevel: 'beginner' | 'intermediate' | 'expert';
}

// 범용 검색 API
export const callGeneralSearchAPI = async (params: APIRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/general?session_id=${params.sessionId}`, {
      user_prompt: params.userPrompt,
      user_level: params.userLevel
    });
    return response.data.response;
  } catch (error) {
    console.error('[❌ 범용 검색 API 오류]:', error);
    throw error;
  }
};

// 부품 추천 API
export const callPartRecommendationAPI = async (params: APIRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/part-recommendation?session_id=${params.sessionId}`, {
      user_prompt: params.userPrompt,
      user_level: params.userLevel
    });
    return response.data.response;
  } catch (error) {
    console.error('[❌ 부품 추천 API 오류]:', error);
    throw error;
  }
};

// 호환성 검사 API
export const callCompatibilityCheckAPI = async (params: APIRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/compatibility-check?session_id=${params.sessionId}`, {
      user_prompt: params.userPrompt,
      user_level: params.userLevel
    });
    return response.data.response;
  } catch (error) {
    console.error('[❌ 호환성 검사 API 오류]:', error);
    throw error;
  }
};

// 견적 추천 API
export const callBuildRecommendationAPI = async (params: APIRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/build-recommendation?session_id=${params.sessionId}`, {
      user_prompt: params.userPrompt,
      user_level: params.userLevel
    });
    return response.data.response;
  } catch (error) {
    console.error('[❌ 견적 추천 API 오류]:', error);
    throw error;
  }
};

// 스펙 업그레이드 API
export const callSpecUpgradeAPI = async (params: APIRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/spec-upgrade?session_id=${params.sessionId}`, {
      user_prompt: params.userPrompt,
      user_level: params.userLevel
    });
    return response.data.response;
  } catch (error) {
    console.error('[❌ 스펙 업그레이드 API 오류]:', error);
    throw error;
  }
};

// 견적 평가 API
export const callBuildEvaluationAPI = async (params: APIRequest) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/build-evaluation?session_id=${params.sessionId}`, {
      user_prompt: params.userPrompt,
      user_level: params.userLevel
    });
    return response.data.response;
  } catch (error) {
    console.error('[❌ 견적 평가 API 오류]:', error);
    throw error;
  }
};
