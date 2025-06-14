
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

/**
 * BuildsList - 저장된 견적 목록 컴포넌트
 * 
 * 이 컴포넌트는 사용자가 저장한 PC 견적들의 목록을 표시하고 관리하는 기능을 제공합니다.
 * 사이드바에 위치하여 저장된 견적들을 한눈에 볼 수 있게 합니다.
 * 
 * 주요 기능:
 * 1. 견적 목록 표시 - 제목, 총 가격, 생성일 표시
 * 2. 견적 상세 보기 - 견적 클릭시 EstimateDetailsModal 열기
 * 3. PDF 다운로드 - 각 견적을 PDF로 다운로드
 * 4. 견적 삭제 - 확인 다이얼로그와 함께 견적 삭제
 * 5. 목록 새로고침 - 최신 견적 목록 다시 불러오기
 * 
 * 상태 관리:
 * - useEstimates 훅을 통해 견적 데이터와 액션 관리
 * - 로딩 상태별 UI 표시 (로딩, 에러, 빈 목록)
 * - 견적별 개별 PDF 생성 상태 관리
 * 
 * UI 구성:
 * - 견적 카드: 제목, 가격, 날짜 표시
 * - 액션 버튼: PDF 다운로드, 삭제
 * - 확인 다이얼로그: 삭제 전 사용자 확인
 * - 상세 모달: EstimateDetailsModal을 통한 견적 상세 보기
 * 
 * 데이터 흐름:
 * 1. 컴포넌트 마운트시 견적 목록 자동 로드
 * 2. 견적 클릭 → 상세 조회 → 모달 표시
 * 3. PDF 버튼 클릭 → PDF 생성 → 자동 다운로드
 * 4. 삭제 버튼 클릭 → 확인 다이얼로그 → 삭제 실행
 */

interface BuildsListProps {
  onViewBuild: (buildId: string) => void;
  onRefresh?: () => void;
}

const BuildsList: React.FC<BuildsListProps> = ({
  onViewBuild,
  onRefresh
}) => {
  // 삭제 확인 다이얼로그 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buildToDelete, setBuildToDelete] = useState<string | null>(null);
  
  // 견적 상세 모달 상태
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // 견적 관리 훅에서 필요한 상태와 함수들 가져오기
  const {
    estimates,           // 저장된 견적 목록
    loading,            // 목록 로딩 상태
    error,              // 에러 상태
    saveLoading,        // 저장 로딩 상태 (사용하지 않음)
    deleteLoading,      // 삭제 로딩 상태
    pdfLoading,         // 전체 PDF 로딩 상태 (하위 호환성)
    fetchEstimates,     // 견적 목록 새로고침
    deleteEstimate,     // 견적 삭제
    generatePdf,        // PDF 생성
    getEstimateDetails, // 견적 상세 조회
    isPdfLoading        // 견적별 PDF 로딩 상태 확인
  } = useEstimates();

  // 컴포넌트 마운트시 견적 목록 자동 로드
  useEffect(() => {
    fetchEstimates();
  }, [fetchEstimates]);

  /**
   * 견적 상세 보기 핸들러
   * 
   * 견적 카드를 클릭했을 때 실행되는 함수입니다.
   * 선택된 견적의 상세 정보를 가져와 모달로 표시합니다.
   * 
   * 처리 과정:
   * 1. 모달을 먼저 열고 로딩 상태 표시
   * 2. API를 통해 견적 상세 정보 조회
   * 3. 성공시 상세 정보를 모달에 표시
   * 4. 실패시 에러 메시지 표시 후 모달 닫기
   * 
   * @param estimateId - 조회할 견적의 고유 ID
   */
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

  /**
   * 견적 삭제 준비 핸들러
   * 
   * 삭제 버튼을 클릭했을 때 확인 다이얼로그를 표시합니다.
   * 이벤트 버블링을 방지하여 견적 상세 보기가 실행되지 않도록 합니다.
   * 
   * @param e - 클릭 이벤트 (버블링 방지용)
   * @param buildId - 삭제할 견적의 고유 ID
   */
  const handleDelete = useCallback((e: React.MouseEvent, buildId: string) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setBuildToDelete(buildId);
    setDialogOpen(true);
  }, []);

  /**
   * 견적 삭제 확인 핸들러
   * 
   * 사용자가 삭제 확인 다이얼로그에서 "삭제"를 클릭했을 때 실행됩니다.
   * 실제 견적 삭제를 수행하고 UI를 업데이트합니다.
   */
  const confirmDelete = useCallback(async () => {
    if (buildToDelete) {
      const success = await deleteEstimate(buildToDelete);
      if (success) {
        setDialogOpen(false);
        setBuildToDelete(null);
      }
    }
  }, [buildToDelete, deleteEstimate]);

  /**
   * 견적 삭제 취소 핸들러
   * 
   * 사용자가 삭제 확인 다이얼로그에서 "취소"를 클릭했을 때 실행됩니다.
   */
  const cancelDelete = useCallback(() => {
    setBuildToDelete(null);
    setDialogOpen(false);
  }, []);

  /**
   * PDF 생성 핸들러
   * 
   * PDF 다운로드 버튼을 클릭했을 때 실행됩니다.
   * 이벤트 버블링을 방지하고 PDF 생성을 요청합니다.
   * 
   * @param e - 클릭 이벤트 (버블링 방지용)
   * @param estimateId - PDF로 변환할 견적의 고유 ID
   */
  const handleGeneratePdf = useCallback(async (e: React.MouseEvent, estimateId: string) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    await generatePdf(estimateId);
  }, [generatePdf]);

  /**
   * 목록 새로고침 핸들러
   * 
   * 새로고침 버튼을 클릭했을 때 견적 목록을 다시 불러옵니다.
   * 상위 컴포넌트의 새로고침 콜백도 함께 실행합니다.
   */
  const handleRefresh = useCallback(() => {
    fetchEstimates();
    onRefresh?.();
  }, [fetchEstimates, onRefresh]);

  /**
   * 컨텐츠 렌더링 함수
   * 
   * 현재 상태에 따라 적절한 UI를 반환합니다:
   * - 에러 상태: 에러 메시지와 재시도 버튼
   * - 로딩 상태: 스피너와 로딩 메시지
   * - 빈 목록: 안내 메시지
   * - 정상 상태: 견적 목록
   */
  const renderContent = useCallback(() => {
    // 에러 상태 UI
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
    
    // 로딩 상태 UI
    if (loading) {
      return (
        <div className="p-4 text-sm text-center flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          견적 목록을 불러오는 중...
        </div>
      );
    }
    
    // 빈 목록 UI
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
    
    // 견적 목록 UI
    return estimates.map((estimate) => (
      <div key={estimate.id} className="border-b border-gray-100 pb-2 mb-2 last:border-b-0">
        <div className="flex items-center gap-2">
          {/* 견적 정보 카드 (클릭 가능) */}
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

          {/* 액션 버튼들 */}
          <div className="flex flex-col gap-1">
            {/* PDF 다운로드 버튼 */}
            <button
              onClick={(e) => handleGeneratePdf(e, estimate.id)}
              className="p-1 text-blue-600 rounded hover:bg-blue-50 disabled:opacity-50"
              aria-label="PDF 다운로드"
              disabled={pdfLoading} // 전체 PDF 로딩 상태로 버튼 비활성화
              title="PDF 다운로드"
            >
              {isPdfLoading(estimate.id) ? (
                // 개별 견적의 PDF 로딩 상태에 따른 스피너 표시
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>

            {/* 삭제 버튼 */}
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
      {/* 헤더: 제목과 새로고침 버튼 */}
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
      
      {/* 메인 컨텐츠 영역 */}
      {renderContent()}
      
      {/* 견적 상세 모달 - 개별 견적의 PDF 로딩 상태 전달 */}
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

      {/* 삭제 확인 다이얼로그 */}
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
