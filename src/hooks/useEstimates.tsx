
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

export interface EstimateItem extends EstimateResponse {
  id: string;
  created_at: string;
  rating?: {
    performance?: number;
    price_performance?: number;
    expandability?: number;
    noise?: number;
  };
}

export function useEstimates() {
  const [estimates, setEstimates] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateItem | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

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
        rating: estimate.rating || undefined // Include rating if available
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

  // Get estimate details - improved to handle API response structure
  const getEstimateDetails = useCallback(async (estimateId: string) => {
    try {
      setDetailsLoading(true);
      setError(null);
      console.log('[🔄 견적 상세 조회] useEstimates 시작:', estimateId);

      const response = await getEstimateDetailsAPI(estimateId);
      
      if (response.responses && response.responses.length > 0) {
        const estimateData = response.responses[0];
        
        const detailedEstimate: EstimateItem = {
          ...estimateData,
          id: estimateId,
          created_at: estimateData.created_at || new Date().toISOString(), // Use actual timestamp if available, fallback to current time
          rating: estimateData.rating || undefined // Include rating if available
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

  // Generate PDF
  const generatePdf = useCallback(async (estimateId: string) => {
    try {
      setPdfLoading(true);
      console.log('[🔄 PDF 생성] useEstimates 시작:', estimateId);
      
      const response = await generatePdfAPI(estimateId);
      
      if (response.success && response.pdf_url) {
        // Open PDF in new window or download
        window.open(response.pdf_url, '_blank');
        
        console.log('[✅ PDF 생성] 완료:', response.pdf_url);
        toast({
          title: "PDF 생성 완료",
          description: "PDF가 성공적으로 생성되었습니다.",
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
      setPdfLoading(false);
    }
  }, []);

  return {
    estimates,
    loading,
    error,
    selectedEstimate,
    detailsLoading,
    saveLoading,
    deleteLoading,
    pdfLoading,
    fetchEstimates,
    saveEstimate,
    getEstimateDetails,
    deleteEstimate,
    generatePdf,
    setSelectedEstimate
  };
}
