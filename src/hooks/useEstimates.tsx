
import { useState, useCallback } from 'react';
import { 
  getEstimatesList, 
  saveEstimate, 
  getEstimateDetails, 
  deleteEstimate 
} from '../services/estimatesApiService';
import { toast } from '../components/ui/use-toast';

export function useEstimates() {
  const [estimates, setEstimates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<any | null>(null);

  // 견적 목록 로드
  const loadEstimates = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getEstimatesList();
      setEstimates(data);
      console.log('[📋 견적 목록] 로드 완료:', data.length, '개');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 목록을 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      toast({
        title: "견적 목록 로딩 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // 견적 저장
  const handleSaveEstimate = useCallback(async (estimateId: string) => {
    try {
      setLoading(true);
      await saveEstimate(estimateId);
      
      toast({
        title: "견적 저장 완료",
        description: "견적이 성공적으로 저장되었습니다.",
      });
      
      // 목록 다시 로드
      await loadEstimates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 저장 중 오류가 발생했습니다.';
      
      toast({
        title: "견적 저장 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [loadEstimates]);

  // 견적 상세 조회
  const handleGetEstimateDetails = useCallback(async (estimateId: string) => {
    try {
      setLoading(true);
      const data = await getEstimateDetails(estimateId);
      setSelectedEstimate(data);
      
      console.log('[📄 견적 상세] 로드 완료:', data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 상세 정보를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      
      toast({
        title: "견적 상세 조회 실패",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 견적 삭제
  const handleDeleteEstimate = useCallback(async (estimateId: string) => {
    try {
      setLoading(true);
      await deleteEstimate(estimateId);
      
      toast({
        title: "견적 삭제 완료",
        description: "견적이 성공적으로 삭제되었습니다.",
      });
      
      // 목록에서 제거
      setEstimates(prev => prev.filter(estimate => estimate.id !== estimateId));
      
      // 선택된 견적이 삭제된 것이라면 초기화
      if (selectedEstimate?.id === estimateId) {
        setSelectedEstimate(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '견적 삭제 중 오류가 발생했습니다.';
      
      toast({
        title: "견적 삭제 실패",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedEstimate]);

  return {
    estimates,
    loading,
    error,
    selectedEstimate,
    loadEstimates,
    handleSaveEstimate,
    handleGetEstimateDetails,
    handleDeleteEstimate,
    setSelectedEstimate
  };
}
