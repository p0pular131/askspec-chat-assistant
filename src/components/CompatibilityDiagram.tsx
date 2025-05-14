
import React from 'react';
import CompatibilityGraph from './CompatibilityGraph';

export interface CompatibilityDiagramProps {
  data: {
    components: string[];
    links: Array<{ source: string; target: string; status: string }>;
  };
}

const CompatibilityDiagram: React.FC<CompatibilityDiagramProps> = ({ data }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">호환성 다이어그램</h3>
      <div className="flex justify-center">
        <div className="w-full h-[300px]">
          <CompatibilityGraph data={data} />
        </div>
      </div>
    </div>
  );
};

export default CompatibilityDiagram;
