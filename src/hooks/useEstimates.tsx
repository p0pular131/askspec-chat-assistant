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

// EstimateItem now properly extends EstimateResponse and includes all necessary fields
export interface EstimateItem extends EstimateResponse {
  id: string;
  created_at: string;
}

export function useEstimates() {
  const [estimates, setEstimates] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoadingStates, setPdfLoadingStates] = useState<Record<string, boolean>>({});

  // Fetch estimates list
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

  // Save estimate
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

  // Get estimate details - now properly handles all EstimateResponse fields
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

  // Delete estimate
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

  // Generate PDF with custom filename based on estimate title
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

  // Helper function to check if a specific estimate is loading PDF
  const isPdfLoading = useCallback((estimateId: string) => {
    return pdfLoadingStates[estimateId] || false;
  }, [pdfLoadingStates]);

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
