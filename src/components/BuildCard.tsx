
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PcCase, HardDrive, Cpu, MemoryStick } from 'lucide-react';
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
          {componentCount['cpu'] && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Cpu className="h-3 w-3" />
              <span>{componentCount['cpu']} CPU</span>
            </Badge>
          )}
          
          {componentCount['gpu'] && (
            <Badge variant="outline" className="flex items-center gap-1">
              <PcCase className="h-3 w-3" />
              <span>{componentCount['gpu']} GPU</span>
            </Badge>
          )}
          
          {componentCount['storage'] && (
            <Badge variant="outline" className="flex items-center gap-1">
              <HardDrive className="h-3 w-3" />
              <span>{componentCount['storage']} Storage</span>
            </Badge>
          )}
          
          {componentCount['ram'] && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              <span>{componentCount['ram']} RAM</span>
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
