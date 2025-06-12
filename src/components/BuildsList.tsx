import React, { useState, useCallback, memo, useEffect } from 'react';
import { toast } from '../components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertCircle, Loader2, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useEstimates } from '../hooks/useEstimates';
import EstimateDetailsModal from './EstimateDetailsModal';

interface BuildsListProps {
  onViewBuild: (buildId: string) => void;
  onRefresh?: () => void;
}

const BuildsList: React.FC<BuildsListProps> = ({
  onViewBuild,
  onRefresh
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buildToDelete, setBuildToDelete] = useState<string | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    estimates,
    loading,
    error,
    saveLoading,
    deleteLoading,
    pdfLoading,
    fetchEstimates,
    deleteEstimate,
    generatePdf,
    getEstimateDetails,
    isPdfLoading
  } = useEstimates();

  // Load estimates when component mounts
  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  // Improved handleViewEstimate with better error handling and logging
  const handleViewEstimate = useCallback(async (estimateId: string) => {
    try {
      console.log('[🔄 견적 상세 조회] 견적 ID:', estimateId);
      
      // Show loading state
      setSelectedEstimate(null);
      setModalOpen(true);
      
      const estimateDetails = await getEstimateDetails(estimateId);
      
      if (estimateDetails) {
        console.log('[✅ 견적 상세 조회] 성공:', estimateDetails);
        setSelectedEstimate(estimateDetails);
      } else {
        console.error('[❌ 견적 상세 조회] 데이터 없음');
        toast({
          title: "견적 조회 실패",
          description: "견적 상세 정보를 찾을 수 없습니다.",
          variant: "destructive",
        });
        setModalOpen(false);
      }
    } catch (error) {
      console.error('[❌ 견적 상세 조회] 오류:', error);
      toast({
        title: "견적 조회 실패",
        description: "견적 상세 정보를 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      setModalOpen(false);
    }
  }, [getEstimateDetails]);

  const handleDelete = useCallback((e: React.MouseEvent, buildId: string) => {
    e.stopPropagation();
    setBuildToDelete(buildId);
    setDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (buildToDelete) {
      const success = await deleteEstimate(buildToDelete);
      if (success) {
        setDialogOpen(false);
        setBuildToDelete(null);
      }
    }
  }, [buildToDelete, deleteEstimate]);

  const cancelDelete = useCallback(() => {
    setBuildToDelete(null);
    setDialogOpen(false);
  }, []);

  const handleGeneratePdf = useCallback(async (e: React.MouseEvent, estimateId: string) => {
    e.stopPropagation();
    await generatePdf(estimateId);
  }, [generatePdf]);

  const handleRefresh = useCallback(() => {
    fetchEstimates();
    onRefresh?.();
  }, [fetchEstimates, onRefresh]);

  const renderContent = useCallback(() => {
    if (error) {
      return (
        <div className="p-4 rounded-md bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">데이터 로딩 실패</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>견적 목록을 불러오는 중 오류가 발생했습니다.</p>
                <p className="mt-1 text-xs text-red-600">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      로딩 중...
                    </>
                  ) : (
                    '다시 시도'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (loading) {
      return (
        <div className="p-4 text-sm text-center flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          견적 목록을 불러오는 중...
        </div>
      );
    }
    
    if (estimates.length === 0) {
      return (
        <div className="p-4 text-sm text-center text-gray-500">
          <p>저장된 견적이 없습니다.</p>
          <p className="text-xs mt-1 text-gray-400">
            견적 추천을 받아 저장해보세요.
          </p>
        </div>
      );
    }
    
    return estimates.map((estimate) => (
      <div key={estimate.id} className="border-b border-gray-100 pb-2 mb-2 last:border-b-0">
        <div className="flex items-center gap-2">
          <button
            className="p-3 w-full text-sm text-left rounded-lg text-neutral-700 hover:bg-neutral-100 flex-1"
            onClick={() => handleViewEstimate(estimate.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 line-clamp-2">{estimate.title}</h4>
                <p className="text-sm text-gray-600 mt-1">
                  총 예상 가격: {estimate.total_price}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(estimate.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </button>

          <div className="flex flex-col gap-1">
            {/* PDF Generation Button - disabled when any PDF is loading */}
            <button
              onClick={(e) => handleGeneratePdf(e, estimate.id)}
              className="p-1 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
              aria-label="PDF 다운로드"
              disabled={pdfLoading}
              title="PDF 다운로드"
            >
              {isPdfLoading(estimate.id) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* Delete Button */}
            <button
              onClick={(e) => handleDelete(e, estimate.id)}
              className="p-1 text-red-500 rounded hover:bg-red-50 disabled:opacity-50"
              aria-label="견적 삭제"
              disabled={deleteLoading}
              title="견적 삭제"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ));
  }, [estimates, loading, error, pdfLoading, deleteLoading, handleViewEstimate, handleDelete, handleGeneratePdf, handleRefresh, isPdfLoading]);

  return (
    <div className="flex flex-col gap-2">
      <div className="pl-2 mb-2 flex justify-between items-center">
        <span className="text-xs text-stone-500">견적 목록</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
          className="h-6 px-2 text-xs"
        >
          {loading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            '새로고침'
          )}
        </Button>
      </div>
      
      {renderContent()}
      
      {/* Enhanced Estimate Details Modal with per-estimate loading state */}
      <EstimateDetailsModal
        estimate={selectedEstimate}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEstimate(null);
        }}
        onGeneratePdf={generatePdf}
        pdfLoading={selectedEstimate ? isPdfLoading(selectedEstimate.id) : false}
      />

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 견적을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없으며 견적이 서버에서 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete} disabled={deleteLoading}>
              취소
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  삭제 중...
                </>
              ) : (
                '삭제'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default memo(BuildsList);
