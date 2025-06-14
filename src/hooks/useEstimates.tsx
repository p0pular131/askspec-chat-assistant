
import { useState, useCallback } from 'react';
import { toast } from '../components/ui/use-toast';
import {
  fetchEstimates as fetchEstimatesAPI,
  saveEstimate as saveEstimateAPI,
  getEstimateDetails as getEstimateDetailsAPI,
  deleteEstimate as deleteEstimateAPI,
  generatePdf as generatePdfAPI,
  EstimateResponse,
  EstimatesListResponse
} from '../services/estimatesApiService';

/**
 * useEstimates - 견적 관리 전용 훅
 * 
 * 이 훅은 PC 견적의 전체 생명주기를 관리합니다.
 * AI가 생성한 견적을 저장하고, 조회하고, 삭제하고, PDF로 내보내는 기능을 제공합니다.
 * 
 * 주요 기능:
 * 1. 견적 목록 조회 - 사용자가 저장한 모든 견적 목록 가져오기
 * 2. 견적 저장 - AI가 생성한 견적을 사용자 계정에 저장
 * 3. 견적 상세 조회 - 특정 견적의 상세 정보 가져오기 (부품 목록, 가격, 추천 이유 등)
 * 4. 견적 삭제 - 불필요한 견적 제거
 * 5. PDF 생성 - 견적을 PDF 파일로 다운로드
 * 
 * 데이터 흐름:
 * - AI 응답 → 견적 생성 → 저장 → 목록 조회 → 상세 조회 → PDF 생성
 * 
 * 상태 관리:
 * - estimates: 저장된 견적 목록
 * - selectedEstimate: 현재 선택된 견적의 상세 정보
 * - loading 상태들: 각 작업별 로딩 상태 추적
 */

// EstimateItem now properly extends EstimateResponse and includes all necessary fields
export interface EstimateItem extends EstimateResponse {
  id: string;
  created_at: string;
}

export function useEstimates() {
  // 사용자가 저장한 견적 목록
  const [estimates, setEstimates] = useState<EstimateItem[]>([]);
  
  // 견적 목록 로딩 상태
  const [loading, setLoading] = useState(false);
  
  // 에러 상태
  const [error, setError] = useState<string | null>(null);
  
  // 현재 선택된 견적의 상세 정보
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateItem | null>(null);
  
  // 견적 상세 조회 로딩 상태
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // 견적 저장 로딩 상태
  const [saveLoading, setSaveLoading] = useState(false);
  
  // 견적 삭제 로딩 상태
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // PDF 생성 로딩 상태 (견적별로 관리)
  const [pdfLoadingStates, setPdfLoadingStates] = useState<Record<string, boolean>>({});

  /**
   * 견적 목록 조회 함수
   * 
   * 사용자가 저장한 모든 견적을 API에서 가져와 상태에 저장합니다.
   * 앱 시작시, 견적 저장/삭제 후에 호출되어 최신 목록을 유지합니다.
   * 
   * API 응답 처리:
   * - 서버에서 받은 견적 목록을 EstimateItem 형태로 변환
   * - ID와 생성일시가 없는 경우 자동 생성
   * - 에러 발생시 사용자에게 토스트 알림
   */
  const fetchEstimates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[🔄 견적 목록 호출] useEstimates 시작');

      const response: EstimatesListResponse = await fetchEstimatesAPI();
      
      // Transform response to include IDs and timestamps
      const transformedEstimates: EstimateItem[] = response.responses.map((estimate, index) => ({
        ...estimate,
        id: estimate.id || `estimate_${Date.now()}_${index}`, // Use actual ID if available, fallback to generated ID
        created_at: estimate.created_at || new Date().toISOString(), // Use actual timestamp if available, fallback to current time
      }));

      setEstimates(transformedEstimates);
      console.log('[✅ 견적 목록] 로드 완료:', transformedEstimates.length, '개');
      
      toast({
        title: "견적 목록 로드 완료",
        description: `${transformedEstimates.length}개의 견적을 불러왔습니다.`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 목록을 불러오는데 실패했습니다.';
      console.error('[❌ 견적 목록] 로드 실패:', err);
      setError(errorMessage);
      
      toast({
        title: "견적 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 견적 저장 함수
   * 
   * AI가 생성한 견적을 사용자 계정에 저장합니다.
   * BuildRecommendationRenderer에서 "견적 저장" 버튼을 클릭할 때 호출됩니다.
   * 
   * 처리 과정:
   * 1. 견적 ID로 서버에 저장 요청
   * 2. 저장 성공시 견적 목록 새로고침
   * 3. 사용자에게 결과 알림
   * 
   * @param estimateId - 저장할 견적의 고유 ID (AI 응답에서 제공)
   * @returns 저장 성공 여부
   */
  const saveEstimate = useCallback(async (estimateId: string) => {
    try {
      setSaveLoading(true);
      console.log('[🔄 견적 저장] useEstimates 시작:', estimateId);
      
      const response = await saveEstimateAPI(estimateId);
      
      if (response.success) {
        console.log('[✅ 견적 저장] 완료');
        toast({
          title: "견적 저장 완료",
          description: "견적이 성공적으로 저장되었습니다.",
        });
        
        // Refresh estimates list
        await fetchEstimates();
        
        return true;
      } else {
        throw new Error(response.message || '견적 저장에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 저장에 실패했습니다.';
      console.error('[❌ 견적 저장] 실패:', err);
      
      toast({
        title: "견적 저장 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setSaveLoading(false);
    }
  }, [fetchEstimates]);

  /**
   * 견적 상세 조회 함수
   * 
   * 특정 견적의 상세 정보를 가져옵니다.
   * BuildsList에서 견적을 클릭하거나 EstimateDetailsModal을 열 때 호출됩니다.
   * 
   * 상세 정보에는 다음이 포함됩니다:
   * - 견적 제목과 총 가격
   * - 각 부품별 상세 정보 (이름, 스펙, 가격, 추천 이유, 구매 링크, 이미지)
   * - 견적 평가 점수 (성능, 가성비, 확장성, 소음)
   * - 추천 설명 및 제안사항
   * 
   * @param estimateId - 조회할 견적의 고유 ID
   * @returns 견적 상세 정보 또는 null (실패시)
   */
  const getEstimateDetails = useCallback(async (estimateId: string) => {
    try {
      setDetailsLoading(true);
      setError(null);
      console.log('[🔄 견적 상세 조회] useEstimates 시작:', estimateId);

      const estimateData = await getEstimateDetailsAPI(estimateId);
      
      if (estimateData) {
        // EstimateItem now properly extends EstimateResponse, so all fields are included
        const detailedEstimate: EstimateItem = {
          ...estimateData, // This includes all fields from EstimateResponse
          id: estimateId,
          created_at: estimateData.created_at || new Date().toISOString(),
        };

        setSelectedEstimate(detailedEstimate);
        console.log('[✅ 견적 상세 조회] 완료:', detailedEstimate);
        return detailedEstimate;
      } else {
        throw new Error('견적 상세 정보를 찾을 수 없습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 상세 정보를 불러오는데 실패했습니다.';
      console.error('[❌ 견적 상세 조회] 실패:', err);
      setError(errorMessage);
      
      toast({
        title: "견적 상세 로드 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  /**
   * 견적 삭제 함수
   * 
   * 불필요한 견적을 영구적으로 삭제합니다.
   * BuildsList에서 삭제 버튼을 클릭하고 확인 다이얼로그에서 승인할 때 호출됩니다.
   * 
   * 처리 과정:
   * 1. 서버에서 견적 삭제
   * 2. 로컬 상태에서도 즉시 제거 (UI 응답성 향상)
   * 3. 현재 선택된 견적이 삭제된 경우 선택 해제
   * 4. 사용자에게 결과 알림
   * 
   * @param estimateId - 삭제할 견적의 고유 ID
   * @returns 삭제 성공 여부
   */
  const deleteEstimate = useCallback(async (estimateId: string) => {
    try {
      setDeleteLoading(true);
      console.log('[🔄 견적 삭제] useEstimates 시작:', estimateId);
      
      const response = await deleteEstimateAPI(estimateId);
      
      if (response.success) {
        // Remove from local state immediately
        setEstimates(prev => prev.filter(estimate => estimate.id !== estimateId));
        
        // Clear selected estimate if it was deleted
        if (selectedEstimate?.id === estimateId) {
          setSelectedEstimate(null);
        }
        
        console.log('[✅ 견적 삭제] 완료');
        toast({
          title: "견적 삭제 완료",
          description: "견적이 성공적으로 삭제되었습니다.",
        });
        
        return true;
      } else {
        throw new Error(response.message || '견적 삭제에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 삭제에 실패했습니다.';
      console.error('[❌ 견적 삭제] 실패:', err);
      
      toast({
        title: "견적 삭제 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setDeleteLoading(false);
    }
  }, [selectedEstimate]);

  /**
   * PDF 생성 함수
   * 
   * 견적을 PDF 파일로 변환하여 다운로드합니다.
   * BuildsList나 EstimateDetailsModal에서 PDF 다운로드 버튼을 클릭할 때 호출됩니다.
   * 
   * 처리 과정:
   * 1. 견적 상세 정보를 가져와서 제목 추출 (파일명 생성용)
   * 2. 서버에 PDF 생성 요청
   * 3. 응답받은 PDF URL로 자동 다운로드 실행
   * 4. 견적 제목을 파일명으로 사용 (예: "게임용 고사양 PC.pdf")
   * 
   * PDF 내용:
   * - 견적 제목 및 총 가격
   * - 각 부품별 상세 정보
   * - 추천 이유 및 설명
   * - 견적 평가 점수
   * 
   * @param estimateId - PDF로 변환할 견적의 고유 ID
   * @returns PDF URL 또는 null (실패시)
   */
  const generatePdf = useCallback(async (estimateId: string) => {
    try {
      setPdfLoadingStates(prev => ({ ...prev, [estimateId]: true }));
      console.log('[🔄 PDF 생성] useEstimates 시작:', estimateId);
      
      // First, get the estimate details to retrieve the title
      let estimateTitle = 'PC견적서';
      try {
        const estimateDetails = await getEstimateDetailsAPI(estimateId);
        if (estimateDetails && estimateDetails.title) {
          // Clean the title for use as filename (remove invalid characters)
          estimateTitle = estimateDetails.title
            .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid filename characters
            .substring(0, 50); // Limit length
          console.log('[📝 PDF 제목] 견적 제목 사용:', estimateTitle);
        }
      } catch (titleError) {
        console.warn('[⚠️ PDF 제목] 견적 제목 가져오기 실패, 기본값 사용:', titleError);
      }
      
      const response = await generatePdfAPI(estimateId);
      
      if (response.success && response.pdf_url) {
        // Create a download link with custom filename
        const link = document.createElement('a');
        link.href = response.pdf_url;
        link.download = `${estimateTitle}.pdf`;
        link.target = '_blank';
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('[✅ PDF 생성] 완료:', response.pdf_url, '파일명:', `${estimateTitle}.pdf`);
        toast({
          title: "PDF 생성 완료",
          description: `${estimateTitle}.pdf 파일이 다운로드됩니다.`,
        });
        
        return response.pdf_url;
      } else {
        throw new Error(response.message || 'PDF 생성에 실패했습니다.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF 생성에 실패했습니다.';
      console.error('[❌ PDF 생성] 실패:', err);
      
      toast({
        title: "PDF 생성 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setPdfLoadingStates(prev => ({ ...prev, [estimateId]: false }));
    }
  }, []);

  /**
   * 특정 견적의 PDF 생성 로딩 상태 확인 함수
   * 
   * 견적별로 PDF 생성 로딩 상태를 개별적으로 관리합니다.
   * 여러 견적의 PDF를 동시에 생성할 때 각각의 상태를 구분하기 위해 사용됩니다.
   * 
   * @param estimateId - 확인할 견적의 고유 ID
   * @returns 해당 견적의 PDF 생성 로딩 상태
   */
  const isPdfLoading = useCallback((estimateId: string) => {
    return pdfLoadingStates[estimateId] || false;
  }, [pdfLoadingStates]);

  /**
   * 훅에서 제공하는 상태와 함수들 반환
   * 
   * 반환되는 요소들:
   * - 상태: estimates, loading, error, selectedEstimate, 각종 로딩 상태
   * - 액션 함수: fetchEstimates, saveEstimate, getEstimateDetails, deleteEstimate, generatePdf
   * - 유틸리티 함수: setSelectedEstimate, isPdfLoading
   */
  return {
    estimates,
    loading,
    error,
    selectedEstimate,
    detailsLoading,
    saveLoading,
    deleteLoading,
    pdfLoading: Object.values(pdfLoadingStates).some(loading => loading), // Keep for backward compatibility
    fetchEstimates,
    saveEstimate,
    getEstimateDetails,
    deleteEstimate,
    generatePdf,
    setSelectedEstimate,
    isPdfLoading
  };
}
