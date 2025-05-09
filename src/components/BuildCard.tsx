
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PcCase, HardDrive, Cpu, MemoryStick, Layers, Power, Fan, ServerCog, MonitorSmartphone } from 'lucide-react';
import { Build } from '@/hooks/useBuilds';
import { formatCurrency } from '@/lib/utils';

interface BuildCardProps {
  build: Build;
  onClick?: () => void;
}

export const BuildCard: React.FC<BuildCardProps> = ({ build, onClick }) => {
  // Ensure components is an array, even if data is incomplete
  const safeComponents = Array.isArray(build.components) ? build.components : [];
  
  // Count the number of components by type
  const componentCount = safeComponents.reduce((acc, component) => {
    if (!component || !component.type) return acc;
    const type = component.type.toLowerCase();
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get icon for component type
  const getComponentIcon = (type: string) => {
    switch(type.toLowerCase()) {
      case 'cpu':
        return <Cpu className="h-3 w-3" />;
      case 'gpu':
        return <ServerCog className="h-3 w-3" />;
      case 'ram':
        return <MemoryStick className="h-3 w-3" />;
      case 'storage':
        return <HardDrive className="h-3 w-3" />;
      case 'motherboard':
        return <Layers className="h-3 w-3" />;
      case 'case':
        return <PcCase className="h-3 w-3" />;
      case 'psu':
        return <Power className="h-3 w-3" />;
      case 'cooling':
        return <Fan className="h-3 w-3" />;
      default:
        return <MonitorSmartphone className="h-3 w-3" />;
    }
  };

  // Format component type name for display
  const formatTypeName = (type: string): string => {
    // Handle common abbreviations
    if (type.toLowerCase() === 'psu') return 'PSU';
    if (type.toLowerCase() === 'cpu') return 'CPU';
    if (type.toLowerCase() === 'gpu') return 'GPU';
    if (type.toLowerCase() === 'ram') return 'RAM';
    
    // Otherwise capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Function to truncate build name if it's too long
  const formatBuildName = (name: string) => {
    return name.length > 30 ? `${name.substring(0, 30)}...` : name;
  };

  return (
    <Card 
      className="hover:bg-accent hover:cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{formatBuildName(build.name)}</CardTitle>
        {build.recommendation && build.recommendation.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {build.recommendation.length > 60
              ? `${build.recommendation.substring(0, 60)}...`
              : build.recommendation}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="font-medium">{formatCurrency(build.total_price)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.keys(componentCount).length > 0 ? (
            Object.entries(componentCount).map(([type, count]) => (
              <Badge key={type} variant="outline" className="flex items-center gap-1">
                {getComponentIcon(type)}
                <span>{count} {formatTypeName(type)}</span>
              </Badge>
            ))
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <PcCase className="h-3 w-3" />
              <span>PC Build</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
