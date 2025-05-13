
import React from 'react';
import CompatibilityGraph from './CompatibilityGraph';

interface CompatibilityDiagramProps {
  compatData: {
    components: string[];
    links: Array<{ source: string; target: string; status: string }>;
  };
}

const CompatibilityDiagram: React.FC<CompatibilityDiagramProps> = ({ compatData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">호환성 다이어그램</h3>
      <div className="flex justify-center">
        <div className="w-full h-[300px]">
          <CompatibilityGraph compatData={compatData} />
        </div>
      </div>
    </div>
  );
};

export default CompatibilityDiagram;
