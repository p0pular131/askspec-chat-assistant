
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PcCase, HardDrive, Cpu, MemoryStick, Layers, Power, Fan, ServerCog } from 'lucide-react';
import { Build } from '@/hooks/useBuilds';
import { formatCurrency } from '@/lib/utils';

interface BuildCardProps {
  build: Build;
  onClick?: () => void;
}

export const BuildCard: React.FC<BuildCardProps> = ({ build, onClick }) => {
  // Count the number of components by type
  const componentCount = build.components.reduce((acc, component) => {
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
        return <PcCase className="h-3 w-3" />;
    }
  };

  return (
    <Card 
      className="hover:bg-accent hover:cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{build.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-muted-foreground">Total Price</span>
          <span className="font-medium">{formatCurrency(build.total_price)}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          {Object.entries(componentCount).map(([type, count]) => (
            <Badge key={type} variant="outline" className="flex items-center gap-1">
              {getComponentIcon(type)}
              <span>{count} {type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
