
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { EstimateItem } from '../hooks/useEstimates';
import { BuildDetails } from './BuildDetails';
import { convertEstimateToBuilder } from '../utils/estimateDataConverter';

interface EstimateDetailsModalProps {
  estimate: EstimateItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EstimateDetailsModal: React.FC<EstimateDetailsModalProps> = ({
  estimate,
  isOpen,
  onClose
}) => {
  if (!estimate) return null;

  // Convert estimate data to Build format
  const buildData = convertEstimateToBuilder(estimate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>견적 상세 보기</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <BuildDetails build={buildData} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
