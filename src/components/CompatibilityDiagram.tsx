
import React, { useState } from 'react';
import { Check, X, Cpu, HardDrive, VideoIcon, Motherboard, MemoryStick, Power, Fan } from 'lucide-react';
import { CompatibilityGraph } from './CompatibilityGraph';
import { Button } from './ui/button';

interface CompatibilityLink {
  source: string;
  target: string;
  status: 'success' | 'failure';
}

interface CompatibilityDiagramProps {
  compatData: any | null;
}

const componentIcons: Record<string, React.ReactNode> = {
  CPU: <Cpu size={24} />,
  GPU: <VideoIcon size={24} />,
  RAM: <MemoryStick size={24} />,
  Motherboard: <Motherboard size={24} />,
  Storage: <HardDrive size={24} />,
  PSU: <Power size={24} />,
  Cooling: <Fan size={24} />
};

export const CompatibilityDiagram: React.FC<CompatibilityDiagramProps> = ({ compatData }) => {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph');

  if (!compatData) {
    return <div className="text-center p-4 text-gray-400">No compatibility data available</div>;
  }

  const components = Array.isArray(compatData.components) 
    ? compatData.components 
    : Object.keys(compatData).filter(key => key !== 'links');
    
  const links: CompatibilityLink[] = Array.isArray(compatData.links) 
    ? compatData.links 
    : Object.keys(compatData)
        .filter(source => typeof compatData[source] === 'object')
        .flatMap(source => 
          Object.keys(compatData[source])
            .map(target => ({
              source,
              target,
              status: compatData[source][target] === true ? 'success' : 'failure'
            }))
        );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Hardware Compatibility Analysis</h3>
        <div className="flex gap-2">
          <Button 
            variant={viewMode === 'graph' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('graph')}
          >
            Graph View
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
        </div>
      </div>
      
      {viewMode === 'graph' ? (
        <CompatibilityGraph compatData={compatData} width={500} height={400} />
      ) : (
        <div className="flex flex-col items-center">
          {/* Component nodes */}
          <div className="flex flex-wrap justify-center gap-6 mb-6">
            {components.map((component: string) => (
              <div 
                key={component}
                className="flex flex-col items-center justify-center p-3 bg-gray-100 rounded-lg w-24 h-24 text-center"
              >
                <div className="mb-2">
                  {componentIcons[component] || component.charAt(0)}
                </div>
                <span className="text-sm font-medium">{component}</span>
              </div>
            ))}
          </div>

          {/* Compatibility links */}
          <div className="w-full mt-4">
            <h4 className="text-sm font-medium mb-2">Component Compatibility:</h4>
            <ul className="space-y-2">
              {links.map((link, index) => (
                <li key={index} className="flex items-center p-2 bg-gray-50 rounded">
                  <span className="font-medium text-sm flex-1">{link.source}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium text-sm flex-1">{link.target}</span>
                  <span className={`ml-3 p-1 rounded-full ${link.status === 'success' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {link.status === 'success' ? <Check size={16} /> : <X size={16} />}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
