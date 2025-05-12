
import React, { useEffect, useRef } from 'react';
import { Cpu, HardDrive, VideoIcon, CircuitBoard, MemoryStick, Power, Fan, CheckCircle, XCircle } from 'lucide-react';

interface CompatNode {
  id: string;
  label: string;
  x?: number;
  y?: number;
}

interface CompatLink {
  source: string;
  target: string;
  status: string;
}

interface CompatibilityGraphProps {
  data: {
    components: string[];
    links: CompatLink[];
  };
}

const CompatibilityGraph: React.FC<CompatibilityGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Create a function to get an icon based on component type
  const getIconForComponent = (type: string): JSX.Element => {
    switch (type.toLowerCase()) {
      case 'cpu':
        return <Cpu />;
      case 'gpu':
        return <VideoIcon />;
      case 'motherboard':
        return <CircuitBoard />;
      case 'ram':
        return <MemoryStick />;
      case 'psu':
        return <Power />;
      case 'cooling':
        return <Fan />;
      case 'storage':
        return <HardDrive />;
      default:
        return <HardDrive />;
    }
  };

  useEffect(() => {
    if (!svgRef.current || !data.components || !data.links) return;

    const svg = svgRef.current;
    const width = 320;
    const height = 320;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.35;
    
    // Clear SVG
    svg.innerHTML = '';
    
    // Function to calculate position on a circle
    const getPositionOnCircle = (index: number, total: number) => {
      const angle = (index / total) * 2 * Math.PI;
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    };
    
    // Create nodes (components)
    const nodes: CompatNode[] = data.components.map((component, index) => ({
      id: component,
      label: component,
      ...getPositionOnCircle(index, data.components.length)
    }));
    
    // Create a map for quick node lookup
    const nodeMap: Record<string, CompatNode> = {};
    nodes.forEach(node => {
      nodeMap[node.id] = node;
    });
    
    // Create links
    data.links.forEach(link => {
      const sourceNode = nodeMap[link.source];
      const targetNode = nodeMap[link.target];
      
      if (sourceNode && targetNode) {
        // Draw line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceNode.x!.toString());
        line.setAttribute('y1', sourceNode.y!.toString());
        line.setAttribute('x2', targetNode.x!.toString());
        line.setAttribute('y2', targetNode.y!.toString());
        line.setAttribute('stroke', link.status === 'success' ? '#22c55e' : '#ef4444');
        line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        
        // Add status indicator in middle of line
        const midX = (sourceNode.x! + targetNode.x!) / 2;
        const midY = (sourceNode.y! + targetNode.y!) / 2;
        
        const statusGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const statusCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        statusCircle.setAttribute('cx', midX.toString());
        statusCircle.setAttribute('cy', midY.toString());
        statusCircle.setAttribute('r', '10');
        statusCircle.setAttribute('fill', 'white');
        statusCircle.setAttribute('stroke', link.status === 'success' ? '#22c55e' : '#ef4444');
        statusCircle.setAttribute('stroke-width', '1');
        statusGroup.appendChild(statusCircle);
        
        // Status icon (✓ or ✗)
        const statusText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        statusText.setAttribute('x', midX.toString());
        statusText.setAttribute('y', (midY + 1).toString());
        statusText.setAttribute('text-anchor', 'middle');
        statusText.setAttribute('dominant-baseline', 'middle');
        statusText.setAttribute('font-size', '12');
        statusText.setAttribute('fill', link.status === 'success' ? '#22c55e' : '#ef4444');
        statusText.textContent = link.status === 'success' ? '✓' : '✗';
        statusGroup.appendChild(statusText);
        
        svg.appendChild(statusGroup);
      }
    });
    
    // Create node circles and labels
    nodes.forEach(node => {
      const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', node.x!.toString());
      circle.setAttribute('cy', node.y!.toString());
      circle.setAttribute('r', '24');
      circle.setAttribute('fill', 'white');
      circle.setAttribute('stroke', '#3b82f6');
      circle.setAttribute('stroke-width', '2');
      nodeGroup.appendChild(circle);
      
      // Add label text
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', node.x!.toString());
      label.setAttribute('y', (node.y! + 45).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '12');
      label.setAttribute('fill', '#1f2937');
      label.textContent = node.label;
      nodeGroup.appendChild(label);
      
      svg.appendChild(nodeGroup);
    });
    
  }, [data]);
  
  return (
    <div className="w-full flex justify-center">
      <svg 
        ref={svgRef} 
        width="320" 
        height="360" 
        viewBox="0 0 320 360"
        className="overflow-visible"
      ></svg>
    </div>
  );
};

export default CompatibilityGraph;
