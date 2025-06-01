
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// 견적 목록 조회 API
export const getEstimatesList = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/estimates/`);
    console.log('[✅ 견적 목록 조회] 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 목록 조회 API 오류]:', error);
    throw error;
  }
};

// 견적 저장 API
export const saveEstimate = async (estimateId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/estimates/${estimateId}/save/`);
    console.log('[✅ 견적 저장] 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 저장 API 오류]:', error);
    throw error;
  }
};

// 견적 상세 조회 API
export const getEstimateDetails = async (estimateId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/estimates/${estimateId}/`);
    console.log('[✅ 견적 상세 조회] 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 상세 조회 API 오류]:', error);
    throw error;
  }
};

// 견적 삭제 API
export const deleteEstimate = async (estimateId: string) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/estimates/${estimateId}`);
    console.log('[✅ 견적 삭제] 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 삭제 API 오류]:', error);
    throw error;
  }
};
