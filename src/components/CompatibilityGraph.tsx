
import React, { useEffect, useRef } from 'react';
import { Cpu, HardDrive, VideoIcon, Motherboard, MemoryStick, Power, Fan, CheckCircle, XCircle } from 'lucide-react';

interface CompatNode {
  id: string;
  type: string;
}

interface CompatLink {
  source: string;
  target: string;
  status: 'success' | 'failure';
}

interface CompatibilityGraphProps {
  compatData: any | null;
  width?: number;
  height?: number;
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

const getNodeColor = (type: string) => {
  const colors: Record<string, string> = {
    CPU: '#f87171',     // Red
    GPU: '#60a5fa',     // Blue
    RAM: '#34d399',     // Green
    Motherboard: '#a78bfa', // Purple
    Storage: '#fbbf24',   // Yellow
    PSU: '#818cf8',     // Indigo
    Cooling: '#6ee7b7'   // Emerald
  };
  
  return colors[type] || '#9ca3af';
};

export const CompatibilityGraph: React.FC<CompatibilityGraphProps> = ({ 
  compatData, 
  width = 600, 
  height = 400 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!compatData || !svgRef.current) return;

    try {
      // Parse component nodes
      let nodes: CompatNode[] = [];
      let links: CompatLink[] = [];

      // Extract components and links from compatData
      if (Array.isArray(compatData.components)) {
        nodes = compatData.components.map((comp: string) => ({ id: comp, type: comp }));
      } else {
        nodes = Object.keys(compatData)
          .filter(key => key !== 'links')
          .map(comp => ({ id: comp, type: comp }));
      }

      // Extract links
      if (Array.isArray(compatData.links)) {
        links = compatData.links;
      } else {
        links = Object.keys(compatData)
          .filter(source => typeof compatData[source] === 'object')
          .flatMap(source => 
            Object.keys(compatData[source])
              .map(target => ({
                source,
                target,
                status: compatData[source][target] === true ? 'success' : 'failure'
              }))
          );
      }

      // Simple circle layout algorithm
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.35;
      const nodePositions: Record<string, { x: number; y: number }> = {};
      
      // Position nodes in a circle
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodePositions[node.id] = { x, y };
      });

      // Clear previous content
      const svg = svgRef.current;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }

      // Add links
      links.forEach(link => {
        const source = nodePositions[link.source];
        const target = nodePositions[link.target];
        
        if (!source || !target) return;
        
        // Create line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', source.x.toString());
        line.setAttribute('y1', source.y.toString());
        line.setAttribute('x2', target.x.toString());
        line.setAttribute('y2', target.y.toString());
        line.setAttribute('stroke', link.status === 'success' ? '#10b981' : '#ef4444');
        line.setAttribute('stroke-width', '2');
        svg.appendChild(line);
        
        // Add status indicator in the middle of the line
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;
        
        const statusCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        statusCircle.setAttribute('cx', midX.toString());
        statusCircle.setAttribute('cy', midY.toString());
        statusCircle.setAttribute('r', '8');
        statusCircle.setAttribute('fill', link.status === 'success' ? '#10b981' : '#ef4444');
        svg.appendChild(statusCircle);
        
        const statusIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        statusIcon.setAttribute('x', midX.toString());
        statusIcon.setAttribute('y', midY.toString());
        statusIcon.setAttribute('text-anchor', 'middle');
        statusIcon.setAttribute('dominant-baseline', 'middle');
        statusIcon.setAttribute('fill', 'white');
        statusIcon.setAttribute('font-size', '10');
        statusIcon.textContent = link.status === 'success' ? '✓' : '✗';
        svg.appendChild(statusIcon);
      });

      // Add nodes
      nodes.forEach(node => {
        const pos = nodePositions[node.id];
        if (!pos) return;
        
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x.toString());
        circle.setAttribute('cy', pos.y.toString());
        circle.setAttribute('r', '24');
        circle.setAttribute('fill', getNodeColor(node.type));
        svg.appendChild(circle);
        
        // Node label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x.toString());
        text.setAttribute('y', (pos.y + 40).toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.textContent = node.id;
        svg.appendChild(text);
        
        // Node icon (simplified as text for now)
        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        icon.setAttribute('x', pos.x.toString());
        icon.setAttribute('y', pos.y.toString());
        icon.setAttribute('text-anchor', 'middle');
        icon.setAttribute('dominant-baseline', 'middle');
        icon.setAttribute('fill', 'white');
        icon.setAttribute('font-size', '14');
        icon.textContent = node.id.charAt(0);
        svg.appendChild(icon);
      });
    } catch (error) {
      console.error('Error rendering compatibility graph:', error);
    }
  }, [compatData, width, height]);

  if (!compatData) {
    return <div className="text-center p-4 text-gray-400">No compatibility data available</div>;
  }

  return (
    <div className="w-full flex flex-col items-center py-4">
      <h3 className="text-lg font-medium mb-4">Hardware Compatibility Graph</h3>
      <div className="border rounded-lg bg-white p-4 shadow-sm">
        <svg 
          ref={svgRef} 
          width={width} 
          height={height} 
          className="mx-auto"
        />
      </div>
      <div className="flex justify-center mt-4 gap-4">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
          <span className="text-sm">Compatible</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <span className="text-sm">Not Compatible</span>
        </div>
      </div>
    </div>
  );
};
