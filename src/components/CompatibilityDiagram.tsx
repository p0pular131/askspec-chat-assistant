
import React, { useState } from 'react';
import CompatibilityGraph from './CompatibilityGraph';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Cpu, HardDrive, VideoIcon, CircuitBoard, MemoryStick, Power, Fan, CheckCircle, XCircle } from 'lucide-react';

interface CompatLink {
  source: string;
  target: string;
  status: 'success' | 'failure';
}

interface CompatData {
  components: string[];
  links: CompatLink[];
}

interface CompatibilityDiagramProps {
  compatData: CompatData;
}

const CompatibilityDiagram: React.FC<CompatibilityDiagramProps> = ({ compatData }) => {
  const [view, setView] = useState<'graph' | 'list'>('graph');
  
  // Map component types to icons
  const getIconForComponent = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cpu':
        return <Cpu className="h-5 w-5" />;
      case 'storage':
        return <HardDrive className="h-5 w-5" />;
      case 'gpu':
        return <VideoIcon className="h-5 w-5" />;
      case 'motherboard':
        return <CircuitBoard className="h-5 w-5" />;
      case 'ram':
        return <MemoryStick className="h-5 w-5" />;
      case 'psu':
        return <Power className="h-5 w-5" />;
      case 'cooling':
        return <Fan className="h-5 w-5" />;
      default:
        return <HardDrive className="h-5 w-5" />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    return status === 'success' ? 
      <CheckCircle className="h-5 w-5 text-green-500" /> : 
      <XCircle className="h-5 w-5 text-red-500" />;
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 border border-gray-200">
      <h3 className="text-lg font-medium mb-4">부품 호환성 검사</h3>
      
      <Tabs defaultValue="graph" onValueChange={(value) => setView(value as 'graph' | 'list')}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="graph">그래프 보기</TabsTrigger>
          <TabsTrigger value="list">목록 보기</TabsTrigger>
        </TabsList>
        
        <TabsContent value="graph" className="mt-0">
          <CompatibilityGraph data={compatData} />
        </TabsContent>
        
        <TabsContent value="list" className="mt-0">
          <div className="space-y-4">
            {compatData.links.map((link, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">{link.source}</span>
                  <span className="text-gray-400 px-2">→</span>
                  <span className="text-gray-600">{link.target}</span>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(link.status)}
                  <span className={link.status === 'success' ? 'text-green-600' : 'text-red-600'}>
                    {link.status === 'success' ? '호환 가능' : '호환 불가'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompatibilityDiagram;
