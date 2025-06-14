
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

/**
 * estimatesApiService - 견적 관련 API 서비스
 * 
 * 이 파일은 견적 관련 모든 API 호출을 중앙화하여 관리합니다.
 * 백엔드 서버와의 통신을 담당하며, 견적의 전체 생명주기를 지원합니다.
 * 
 * 주요 API 엔드포인트:
 * - GET /estimates - 저장된 견적 목록 조회
 * - POST /estimates/{id}/save - 견적 저장
 * - GET /estimates/{id} - 견적 상세 조회
 * - DELETE /estimates/{id} - 견적 삭제
 * - POST /generate-pdf - 견적 PDF 생성
 * 
 * 에러 처리:
 * - 모든 API 호출에 대해 일관된 에러 로깅
 * - 네트워크 오류, 서버 오류, 인증 오류 등 다양한 상황 대응
 */

// Types for API responses

/**
 * PartDetail - 견적 내 개별 부품 정보
 * 
 * AI가 추천한 각 부품의 상세 정보를 담습니다.
 * 사용자가 견적을 확인할 때 필요한 모든 정보를 포함합니다.
 */
export interface PartDetail {
  product_id: number;        // 부품의 고유 식별자
  name: string;              // 부품명 (예: "RTX 4070 Ti")
  reason: string;            // 추천 이유
  price: string;             // 가격 (문자열 형태, 예: "₩850,000")
  specs: any;                // 부품 스펙 (객체나 문자열 가능)
  specs_text: string;        // 스펙 텍스트 설명
  link: string;              // 구매 링크
  image_url: string;         // 부품 이미지 URL
  image?: string;            // 이미지 필드 (하위 호환성)
}

/**
 * EstimateResponse - 견적 응답 데이터
 * 
 * 서버에서 반환하는 견적의 전체 정보를 담습니다.
 * AI가 생성한 견적과 사용자가 저장한 견적 모두에 사용됩니다.
 */
export interface EstimateResponse {
  id?: string;                           // 견적 고유 ID (옵션)
  title: string;                         // 견적 제목 (예: "게임용 고사양 PC")
  parts: Record<string, PartDetail>;     // 부품 목록 (부품 타입별로 구성)
  total_price: number;                   // 총 예상 가격
  total_reason: string;                  // 총 견적에 대한 설명
  suggestion: string;                    // 추가 제안사항
  score?: number;                        // 종합 점수 (옵션)
  price_performance?: number;            // 가격 대비 성능 점수 (옵션)
  performance?: number;                  // 절대 성능 점수 (옵션)
  expandability?: number;                // 확장성 점수 (옵션)
  noise?: number;                        // 소음 점수 (옵션)
  created_at?: string;                   // 생성 시간 (옵션)
  rating?: {                             // 평가 점수들 (옵션)
    performance?: number;
    price_performance?: number;
    expandability?: number;
    noise?: number;
  };
}

/**
 * EstimatesListResponse - 견적 목록 응답
 * 
 * 사용자가 저장한 모든 견적 목록을 담는 응답 형태입니다.
 */
export interface EstimatesListResponse {
  responses: EstimateResponse[];
}

/**
 * SaveEstimateRequest - 견적 저장 요청
 */
export interface SaveEstimateRequest {
  estimate_id: string;
}

/**
 * SaveEstimateResponse - 견적 저장 응답
 */
export interface SaveEstimateResponse {
  success: boolean;
  message?: string;
}

/**
 * DeleteEstimateResponse - 견적 삭제 응답
 */
export interface DeleteEstimateResponse {
  success: boolean;
  message?: string;
}

/**
 * GeneratePdfResponse - PDF 생성 응답
 */
export interface GeneratePdfResponse {
  success: boolean;
  pdf_url?: string;
  message?: string;
}

/**
 * 견적 목록 조회 API
 * 
 * 사용자가 저장한 모든 견적을 가져옵니다.
 * 홈페이지의 BuildsList 컴포넌트에서 사용됩니다.
 * 
 * @returns 견적 목록이 포함된 응답 객체
 */
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

/**
 * 견적 저장 API
 * 
 * AI가 생성한 견적을 사용자 계정에 저장합니다.
 * BuildRecommendationRenderer에서 "견적 저장" 버튼을 클릭할 때 호출됩니다.
 * 
 * 처리 과정:
 * 1. 견적 ID를 서버에 전송
 * 2. 서버에서 해당 견적을 사용자 계정과 연결하여 저장
 * 3. 저장 성공/실패 결과 반환
 * 
 * @param estimateId - 저장할 견적의 고유 ID
 * @returns 저장 결과 응답
 */
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

/**
 * 견적 상세 조회 API
 * 
 * 특정 견적의 상세 정보를 가져옵니다.
 * BuildsList에서 견적을 클릭하거나 EstimateDetailsModal을 열 때 호출됩니다.
 * 
 * 반환 정보:
 * - 견적 기본 정보 (제목, 총 가격, 생성일)
 * - 각 부품별 상세 정보 (이름, 스펙, 가격, 추천 이유, 구매 링크, 이미지)
 * - 견적 평가 점수 (성능, 가성비, 확장성, 소음)
 * - 추천 설명 및 제안사항
 * 
 * @param estimateId - 조회할 견적의 고유 ID
 * @returns 견적 상세 정보
 */
export const getEstimateDetails = async (estimateId: string): Promise<EstimateResponse> => {
  try {
    console.log('[🔄 견적 상세 조회] API 호출 시작:', estimateId);
    const response = await axios.get(`${API_BASE_URL}/estimates/${estimateId}`);
    console.log('[✅견적 상세 조회] API 응답 성공:', response.data);
    return response.data;
  } catch (error) {
    console.error('[❌ 견적 상세 조회 API 오류]:', error);
    throw error;
  }
};

/**
 * 견적 삭제 API
 * 
 * 불필요한 견적을 영구적으로 삭제합니다.
 * BuildsList에서 삭제 버튼을 클릭하고 확인 다이얼로그에서 승인할 때 호출됩니다.
 * 
 * 주의사항:
 * - 삭제된 견적은 복구할 수 없습니다
 * - 삭제 전에 사용자 확인 과정을 거쳐야 합니다
 * 
 * @param estimateId - 삭제할 견적의 고유 ID
 * @returns 삭제 결과 응답
 */
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

/**
 * PDF 생성 API
 * 
 * 견적을 PDF 파일로 변환하여 다운로드 가능한 URL을 반환합니다.
 * BuildsList나 EstimateDetailsModal에서 PDF 다운로드 버튼을 클릭할 때 호출됩니다.
 * 
 * PDF 내용:
 * - 견적 제목 및 총 가격
 * - 각 부품별 상세 정보 (이름, 스펙, 가격, 추천 이유)
 * - 견적 평가 점수 및 차트
 * - 추천 설명 및 제안사항
 * - 부품 이미지 (가능한 경우)
 * 
 * 처리 과정:
 * 1. 서버에 PDF 생성 요청
 * 2. 서버에서 견적 데이터를 PDF로 변환
 * 3. 생성된 PDF의 다운로드 URL 반환
 * 4. 클라이언트에서 자동 다운로드 실행
 * 
 * @param estimateId - PDF로 변환할 견적의 고유 ID
 * @returns PDF 생성 결과 및 다운로드 URL
 */
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
