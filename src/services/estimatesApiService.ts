import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Types for API responses
export interface PartDetail {
  name: string;
  reason: string;
  price: string;
  specs: string;
  link: string;
  image_url: string;
}

export interface EstimateResponse {
  title: string;
  parts: Record<string, PartDetail>;
  total_price: string;
  total_reason: string;
  suggestion: string;
}

export interface EstimatesListResponse {
  responses: EstimateResponse[];
}

export interface SaveEstimateRequest {
  estimate_id: string;
}

export interface SaveEstimateResponse {
  success: boolean;
  message?: string;
}

export interface DeleteEstimateResponse {
  success: boolean;
  message?: string;
}

export interface GeneratePdfResponse {
  success: boolean;
  pdf_url?: string;
  message?: string;
}

// 견적 목록 조회 API
export const fetchEstimates = async (): Promise<EstimatesListResponse> => {
  try {
    console.log('[🔄 견적 목록] API 호출 시작');
    const response = await axios.get(`${API_BASE_URL}/estimates`);
    console.log('[✅ 견적 목록] API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 목록 조회 API 오류]:', error);
    throw error;
  }
};

// 견적 저장 API
export const saveEstimate = async (estimateId: string): Promise<SaveEstimateResponse> => {
  try {
    console.log('[🔄 견적 저장] API 호출 시작:', estimateId);
    const response = await axios.post(`${API_BASE_URL}/estimates/${estimateId}/save`, {
      estimate_id: estimateId
    });
    console.log('[✅ 견적 저장] API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 저장 API 오류]:', error);
    throw error;
  }
};

// 견적 상세 조회 API
export const getEstimateDetails = async (estimateId: string): Promise<EstimatesListResponse> => {
  try {
    console.log('[🔄 견적 상세 조회] API 호출 시작:', estimateId);
    const response = await axios.get(`${API_BASE_URL}/estimates/${estimateId}`);
    console.log('[✅ 견적 상세 조회] API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 상세 조회 API 오류]:', error);
    throw error;
  }
};

// 견적 삭제 API
export const deleteEstimate = async (estimateId: string): Promise<DeleteEstimateResponse> => {
  try {
    console.log('[🔄 견적 삭제] API 호출 시작:', estimateId);
    const response = await axios.delete(`${API_BASE_URL}/estimates/${estimateId}`);
    console.log('[✅ 견적 삭제] API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 삭제 API 오류]:', error);
    throw error;
  }
};

// PDF 생성 API
export const generatePdf = async (estimateId: string): Promise<GeneratePdfResponse> => {
  try {
    console.log('[🔄 PDF 생성] API 호출 시작:', estimateId);
    const response = await axios.post(`${API_BASE_URL}/generate-pdf`, {
      estimate_id: estimateId
    });
    console.log('[✅ PDF 생성] API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ PDF 생성 API 오류]:', error);
    throw error;
  }
};
