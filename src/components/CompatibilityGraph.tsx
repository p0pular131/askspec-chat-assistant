
import React, { useEffect, useRef } from 'react';
import { Cpu, HardDrive, VideoIcon, CircuitBoard, MemoryStick, Power, Fan, CheckCircle, XCircle } from 'lucide-react';

interface CompatNode {
  id: string;
  x: number;
  y: number;
}

interface CompatLink {
  source: string;
  target: string;
  status: 'success' | 'failure';
}

interface CompatData {
  components: string[];
  links: CompatLink[];
}

interface CompatibilityGraphProps {
  data: CompatData;
}

const CompatibilityGraph: React.FC<CompatibilityGraphProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodes: Record<string, CompatNode> = {};
  
  // Map component types to icons
  const getIconForComponent = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cpu':
        return <Cpu className="h-6 w-6" />;
      case 'storage':
        return <HardDrive className="h-6 w-6" />;
      case 'gpu':
        return <VideoIcon className="h-6 w-6" />;
      case 'motherboard':
        return <CircuitBoard className="h-6 w-6" />;
      case 'ram':
        return <MemoryStick className="h-6 w-6" />;
      case 'psu':
        return <Power className="h-6 w-6" />;
      case 'cooling':
        return <Fan className="h-6 w-6" />;
      default:
        return <HardDrive className="h-6 w-6" />;
    }
  };

  // Position nodes in a circle
  useEffect(() => {
    if (!canvasRef.current || !data.components || data.components.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate positions
    const radius = Math.min(canvas.width, canvas.height) / 2.5;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create nodes with positions
    data.components.forEach((component, i) => {
      const angle = (i / data.components.length) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      nodes[component] = { id: component, x, y };
    });
    
    // Draw links first (so they're behind the nodes)
    data.links.forEach(link => {
      const sourceNode = nodes[link.source];
      const targetNode = nodes[link.target];
      
      if (sourceNode && targetNode) {
        // Draw link
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.strokeStyle = link.status === 'success' ? '#10b981' : '#ef4444';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw status indicator icon in the middle of the link
        const midX = (sourceNode.x + targetNode.x) / 2;
        const midY = (sourceNode.y + targetNode.y) / 2;
        
        ctx.fillStyle = link.status === 'success' ? '#10b981' : '#ef4444';
        ctx.beginPath();
        ctx.arc(midX, midY, 10, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add a status icon (check or x)
        ctx.fillStyle = '#ffffff';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(link.status === 'success' ? '✓' : '✗', midX, midY);
      }
    });
    
    // Then draw nodes (so they're on top)
    Object.values(nodes).forEach(node => {
      // Draw node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = '#f3f4f6';
      ctx.fill();
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw node label
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.id, node.x, node.y + 45);
    });
    
  }, [data]);

  return (
    <div className="compatibility-graph-container">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={400} 
        className="w-full max-h-96"
      />
      <div className="flex justify-center mt-4 gap-8">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">호환 가능</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">호환 불가</span>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityGraph;
