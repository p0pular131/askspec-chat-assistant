
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { X, Download, ExternalLink } from 'lucide-react';
import { EstimateItem } from '../hooks/useEstimates';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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

        <div className="space-y-6">
          {/* 총 가격 */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">총 예상 가격</h3>
            <p className="text-2xl font-bold text-blue-900">{estimate.total_price}</p>
          </div>

          {/* 부품 목록 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">부품 구성</h3>
            {Object.entries(estimate.parts || {}).map(([category, part]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Badge variant="secondary" className="mb-2">
                      {category}
                    </Badge>
                    <h4 className="font-semibold text-gray-900">{part.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{part.specs}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg text-gray-900">{part.price}</p>
                    {part.link && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => window.open(part.link, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        구매 링크
                      </Button>
                    )}
                  </div>
                </div>
                
                {part.image_url && (
                  <div className="mb-3">
                    <img 
                      src={part.image_url} 
                      alt={part.name}
                      className="w-32 h-32 object-cover rounded border"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-700">
                    <strong>추천 이유:</strong> {part.reason}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* 총평 */}
          {estimate.total_reason && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">총평</h3>
              <p className="text-gray-700">{estimate.total_reason}</p>
            </div>
          )}

          {/* 추가 제안사항 */}
          {estimate.suggestion && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold text-green-800 mb-2">추가 제안사항</h3>
              <p className="text-green-700">{estimate.suggestion}</p>
            </div>
          )}

          {/* 생성 날짜 */}
          <div className="text-sm text-gray-500 text-center pt-4 border-t">
            생성일: {new Date(estimate.created_at).toLocaleString('ko-KR')}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EstimateDetailsModal;
