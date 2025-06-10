
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Download, Loader2 } from 'lucide-react';
import { EstimateItem } from '../hooks/useEstimates';
import { BuildDetails } from './BuildDetails';
import { convertEstimateToBuil } from '../utils/estimateDataConverter';

interface EstimateDetailsModalProps {
  estimate: EstimateItem | null;
  isOpen: boolean;
  onClose: () => void;
  onGeneratePdf?: (estimateId: string) => void;
  pdfLoading?: boolean;
}

const EstimateDetailsModal: React.FC<EstimateDetailsModalProps> = ({
  estimate,
  isOpen,
  onClose,
  onGeneratePdf,
  pdfLoading = false
}) => {
  if (!estimate) return null;

  const handlePdfGenerate = () => {
    if (onGeneratePdf && estimate.id) {
      onGeneratePdf(estimate.id);
    }
  };

  // Convert estimate data to Build format for BuildDetails component
  const buildData = convertEstimateToBuil(estimate);

  console.log('[🔍 견적 모달] 견적 데이터:', estimate);
  console.log('[🔍 견적 모달] 변환된 빌드 데이터:', buildData);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{estimate.title || '견적 상세'}</span>
            <div className="flex items-center gap-2">
              {onGeneratePdf && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePdfGenerate}
                  disabled={pdfLoading}
                >
                  {pdfLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      PDF 생성 중...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      PDF 다운로드
                    </>
                  )}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* BuildDetails 컴포넌트를 통해 견적 상세 정보 렌더링 */}
          {buildData ? (
            <BuildDetails build={buildData} />
          ) : (
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
