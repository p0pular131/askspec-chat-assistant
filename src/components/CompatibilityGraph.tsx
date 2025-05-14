
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { CircuitBoard, Cpu, HardDrive, Database, Power, Fan } from 'lucide-react';

interface CompatibilityGraphProps {
  data: {
    components: string[];
    links: Array<{ source: string; target: string; status: string }>;
  };
}

const CompatibilityGraph: React.FC<CompatibilityGraphProps> = ({ data }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Get icon component for a given component name
  const getIconComponent = (name: string) => {
    switch (name.toLowerCase()) {
      case 'cpu':
        return Cpu;
      case 'gpu':
        return HardDrive; // Changed from Gpu to HardDrive as Gpu isn't available
      case 'motherboard':
        return CircuitBoard;
      case 'storage':
        return Database;
      case 'psu':
        return Power;
      case 'cooling':
        return Fan;
      default:
        return CircuitBoard;
    }
  };

  useEffect(() => {
    if (!svgRef.current || !data || !data.components || !data.links) return;

    // Clear previous graph
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up dimensions
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    
    // Create a force simulation
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Create SVG element
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
      
    // Prepare nodes and links
    const nodes = data.components.map(name => ({ id: name }));
    const links = data.links.map(link => ({
      source: link.source,
      target: link.target,
      status: link.status
    }));
    
    // Create links
    const linkElements = svg.append("g")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", 2)
      .attr("stroke", (d) => d.status === "success" ? "#4ade80" : "#f43f5e");
      
    // Create node groups
    const nodeGroups = svg.append("g")
      .selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
    // Add circles for nodes
    nodeGroups.append("circle")
      .attr("r", 25)
      .attr("fill", "white")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-width", 2);
      
    // Add icons to nodes using foreignObject
    nodeGroups.each(function(d: any) {
      const IconComponent = getIconComponent(d.id);
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      icon.setAttribute("width", "24");
      icon.setAttribute("height", "24");
      icon.setAttribute("x", "-12");
      icon.setAttribute("y", "-12");
      
      const div = document.createElement("div");
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.display = "flex";
      div.style.alignItems = "center";
      div.style.justifyContent = "center";
      
      // Render the icon
      div.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IconComponent().props.children}</svg>`;
      
      icon.appendChild(div);
      this.appendChild(icon);
    });
      
    // Add labels
    nodeGroups.append("text")
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "500")
      .text((d: any) => d.id);
      
    // Update positions on each tick
    simulation
      .nodes(nodes as any)
      .on("tick", () => {
        linkElements
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);
          
        nodeGroups.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
      });
      
    (simulation.force("link") as d3.ForceLink<any, any>).links(links);
    
    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
  }, [data]);
  
  return <svg ref={svgRef} width="100%" height="100%" />;
};

export default CompatibilityGraph;
