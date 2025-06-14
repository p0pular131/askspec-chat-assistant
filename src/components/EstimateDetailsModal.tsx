
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Download, Loader2 } from 'lucide-react';
import { EstimateItem } from '../hooks/useEstimates';
import { BuildDetails } from './BuildDetails';
import { convertEstimateToBuil } from '../utils/estimateDataConverter';

/**
 * EstimateDetailsModal - 견적 상세 정보 모달 컴포넌트
 * 
 * 이 컴포넌트는 선택된 견적의 상세 정보를 모달 창으로 표시합니다.
 * BuildsList에서 견적을 클릭했을 때 열리며, 견적의 모든 세부사항을 확인할 수 있습니다.
 * 
 * 주요 기능:
 * 1. 견적 상세 정보 표시 - BuildDetails 컴포넌트를 통한 상세 렌더링
 * 2. PDF 다운로드 - 모달 내에서 직접 PDF 생성 및 다운로드
 * 3. 모달 제어 - 열기/닫기 상태 관리
 * 4. 로딩 상태 표시 - 데이터 로딩 및 PDF 생성 중 상태 표시
 * 
 * 컴포넌트 구조:
 * - 모달 헤더: 견적 제목과 PDF 다운로드 버튼
 * - 모달 본문: BuildDetails 컴포넌트를 통한 견적 상세 정보
 * - 에러 상태: 데이터 로딩 실패시 에러 메시지
 * 
 * 데이터 변환:
 * - EstimateItem → Build 형태로 변환하여 BuildDetails에 전달
 * - convertEstimateToBuil 유틸리티 함수 사용
 * 
 * 상태 관리:
 * - 모달 열림/닫힘 상태는 부모 컴포넌트에서 관리
 * - PDF 생성 로딩 상태는 부모에서 전달받아 표시
 * 
 * @param estimate - 표시할 견적 정보 (EstimateItem 타입)
 * @param isOpen - 모달 열림 상태
 * @param onClose - 모달 닫기 콜백 함수
 * @param onGeneratePdf - PDF 생성 콜백 함수 (옵션)
 * @param pdfLoading - PDF 생성 로딩 상태 (옵션)
 */

interface EstimateDetailsModalProps {
  estimate: EstimateItem | null;    // 표시할 견적 정보 (null이면 모달 표시 안함)
  isOpen: boolean;                  // 모달 열림 상태
  onClose: () => void;              // 모달 닫기 함수
  onGeneratePdf?: (estimateId: string) => void;  // PDF 생성 함수 (옵션)
  pdfLoading?: boolean;             // PDF 생성 로딩 상태 (기본값: false)
}

const EstimateDetailsModal: React.FC<EstimateDetailsModalProps> = ({
  estimate,
  isOpen,
  onClose,
  onGeneratePdf,
  pdfLoading = false
}) => {
  // 견적 정보가 없으면 모달을 렌더링하지 않음
  if (!estimate) return null;

  /**
   * PDF 생성 핸들러
   * 
   * 모달 헤더의 PDF 다운로드 버튼을 클릭했을 때 실행됩니다.
   * 부모 컴포넌트에서 전달받은 onGeneratePdf 함수를 호출합니다.
   */
  const handlePdfGenerate = () => {
    if (onGeneratePdf && estimate.id) {
      onGeneratePdf(estimate.id);
    }
  };

  /**
   * 견적 데이터 변환
   * 
   * EstimateItem 형태의 데이터를 BuildDetails 컴포넌트에서 사용할 수 있는
   * Build 형태로 변환합니다. convertEstimateToBuil 유틸리티 함수를 사용합니다.
   */
  const buildData = convertEstimateToBuil(estimate);

  // 데이터 변환 과정 로깅 (디버깅용)
  console.log('[🔍 견적 모달] 견적 데이터:', estimate);
  console.log('[🔍 견적 모달] 변환된 빌드 데이터:', buildData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* 모달 헤더 */}
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {/* 견적 제목 */}
            <span>{estimate.title || '견적 상세'}</span>
            
            {/* PDF 다운로드 버튼 영역 */}
            <div className="flex items-center gap-2">
              {onGeneratePdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePdfGenerate}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    // PDF 생성 중 상태
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      PDF 생성 중...
                    </>
                  ) : (
                    // 기본 상태
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      PDF 다운로드
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* 모달 본문 */}
        <div className="mt-4">
          {buildData ? (
            // 견적 상세 정보 표시
            <BuildDetails build={buildData} />
          ) : (
            // 데이터 로딩 실패시 에러 메시지
            <div className="flex items-center justify-center h-48">
              <p className="text-muted-foreground">견적 데이터를 불러올 수 없습니다.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsModal;
