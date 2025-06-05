
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Download } from 'lucide-react';
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
    if (onGeneratePdf) {
      onGeneratePdf(estimate.id);
    }
  };

  // Convert estimate data to Build format for BuildDetails component
  const buildData = convertEstimateToBuil(estimate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{estimate.title}</span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePdfGenerate}
                disabled={pdfLoading}
              >
                {pdfLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    PDF 생성 중...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    PDF 다운로드
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {/* Use existing BuildDetails component with converted API data */}
          <BuildDetails build={buildData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsModal;
