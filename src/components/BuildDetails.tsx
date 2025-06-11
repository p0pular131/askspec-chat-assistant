
import React from 'react';
import { Build, Component } from '@/hooks/useBuilds';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, DollarSign, VolumeX, Zap, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { RatingIndicator } from "@/components/RatingIndicator";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface BuildDetailsProps {
  build: Build;
}

export const BuildDetails: React.FC<BuildDetailsProps> = ({ build }) => {
  // Fixed order for component types
  const COMPONENT_ORDER = ["VGA", "CPU", "Motherboard", "Memory", "Storage", "PSU", "Case", "Cooler"];

  // Function to get standardized component type
  const getStandardizedComponentType = (component: Component): string => {
    // First check if the component already has a valid type from the standard order
    if (COMPONENT_ORDER.includes(component.type)) {
      return component.type;
    }
    
    // If not, derive type from component name using the standard mapping
    const name = component.name.toLowerCase();
    
    if (name.includes('rtx') || name.includes('gtx') || name.includes('radeon') || name.includes('graphics') || name.includes('vga')) {
      return 'VGA';
    }
    if (name.includes('cpu') || name.includes('processor') || name.includes('intel') || name.includes('amd ryzen')) {
      return 'CPU';
    }
    if (name.includes('motherboard') || name.includes('mainboard')) {
      return 'Motherboard';
    }
    if (name.includes('ram') || name.includes('memory') || name.includes('ddr')) {
      return 'Memory';
    }
    if (name.includes('ssd') || name.includes('hdd') || name.includes('storage') || name.includes('nvme')) {
      return 'Storage';
    }
    if (name.includes('psu') || name.includes('power') || name.includes('supply')) {
      return 'PSU';
    }
    if (name.includes('case') || name.includes('tower')) {
      return 'Case';
    }
    if (name.includes('cooler') || name.includes('fan')) {
      return 'Cooler';
    }
    
    return 'Unknown';
  };

  // Sort components according to the fixed order
  const getSortedComponents = (components: Component[]): Component[] => {
    // Create a map of components by their standardized type
    const componentsByType: Record<string, Component[]> = {};
    
    components.forEach(component => {
      const standardizedType = getStandardizedComponentType(component);
      if (!componentsByType[standardizedType]) {
        componentsByType[standardizedType] = [];
      }
      componentsByType[standardizedType].push(component);
    });

    // Return components sorted by the fixed order
    const sortedComponents: Component[] = [];
    
    COMPONENT_ORDER.forEach(type => {
      if (componentsByType[type]) {
        sortedComponents.push(...componentsByType[type]);
      }
    });
    
    // Add any unknown types at the end
    if (componentsByType['Unknown']) {
      sortedComponents.push(...componentsByType['Unknown']);
    }
    
    return sortedComponents;
  };

  // Get sorted components for display
  const sortedComponents = getSortedComponents(build.components);

  // Group components by type for tabs (also sorted)
  const groupedComponents = sortedComponents.reduce((acc, component) => {
    const type = getStandardizedComponentType(component);
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(component);
    return acc;
  }, {} as Record<string, Component[]>);

  // Create ordered tabs based on the fixed order
  const orderedTabTypes = COMPONENT_ORDER.filter(type => groupedComponents[type]);

  // Extract rating scores if they exist, otherwise use placeholders
  const hasRatings = build.rating && typeof build.rating === 'object';
  const performance = hasRatings && build.rating.performance !== undefined ? build.rating.performance : null;
  const pricePerformance = hasRatings && build.rating.price_performance !== undefined ? build.rating.price_performance : null;
  const expandability = hasRatings && build.rating.expandability !== undefined ? build.rating.expandability : null;
  const noise = hasRatings && build.rating.noise !== undefined ? build.rating.noise : null;

  // Function to export the build details as PDF
  const exportAsPDF = async () => {
    try {
      toast({
        title: "PDF 생성 중",
        description: "PDF를 생성 중입니다. 잠시만 기다려주세요.",
      });

      const pdf = new jsPDF();
      let yPos = 20;

      pdf.setFontSize(20);
      pdf.text(build.name, 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      pdf.text(`총 가격: ${formatCurrency(build.total_price)}`, 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(16);
      pdf.text('견적 추천 설명', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      const recommendationLines = pdf.splitTextToSize(build.recommendation, 170);
      pdf.text(recommendationLines, 20, yPos);
      yPos += recommendationLines.length * 7 + 10;
      
      pdf.setFontSize(16);
      pdf.text('견적 평가', 20, yPos);
      yPos += 10;

      pdf.setFontSize(12);
      pdf.text(`절대 성능: ${performance !== null ? `${performance}/10` : "평가 없음"}`, 20, yPos);
      yPos += 7;
      pdf.text(`가격 대비 성능: ${pricePerformance !== null ? `${pricePerformance}/10` : "평가 없음"}`, 20, yPos);
      yPos += 7;
      pdf.text(`확장성: ${expandability !== null ? `${expandability}/10` : "평가 없음"}`, 20, yPos);
      yPos += 7;
      pdf.text(`소음: ${noise !== null ? `${noise}/10` : "평가 없음"}`, 20, yPos);
      yPos += 15;
      
      pdf.setFontSize(16);
      pdf.text('구성 요소', 20, yPos);
      yPos += 10;

      const componentRows = sortedComponents.map(component => [
        component.name,
        getStandardizedComponentType(component),
        component.specs,
        formatCurrency(component.price || 0)
      ]);
      
      autoTable(pdf, {
        startY: yPos,
        head: [['Component', 'Type', 'Specs', 'Price']],
        body: componentRows,
        margin: { top: 20, left: 20, right: 20, bottom: 20 },
        styles: { overflow: 'linebreak', cellWidth: 'wrap' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 80 },
          3: { cellWidth: 20 }
        }
      });
      
      pdf.save(`${build.name} - PC Build.pdf`);

      toast({
        title: "PDF 내보내기 완료",
        description: "PC 견적 PDF가 다운로드되었습니다.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "PDF 내보내기 실패",
        description: "PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{build.name}</h1>
          <p className="text-muted-foreground mt-1">총 가격: {formatCurrency(build.total_price)}</p>
        </div>
        <Button onClick={exportAsPDF} className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>내보내기</span>
        </Button>
      </div>
      
      {/* Recommendation Card */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>견적 추천 설명</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{build.recommendation}</p>
        </CardContent>
      </Card>
      
      {/* Separate Evaluation Card with Circular Indicators */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>견적 평가</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-row flex-wrap justify-around gap-4">
              <RatingIndicator 
                label="절대 성능" 
                value={performance} 
                maxValue={10} 
                icon={<Zap className="h-4 w-4" />}
                color="#F97316" 
              />
              <RatingIndicator 
                label="가격 대비 성능" 
                value={pricePerformance} 
                maxValue={10} 
                icon={<DollarSign className="h-4 w-4" />} 
                color="#9b87f5"
              />
              <RatingIndicator 
                label="확장성" 
                value={expandability} 
                maxValue={10} 
                icon={<Zap className="h-4 w-4" />}
                color="#10B981" 
              />
              <RatingIndicator 
                label="소음" 
                value={noise} 
                maxValue={10} 
                icon={<VolumeX className="h-4 w-4" />}
                color="#0EA5E9" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Components</TabsTrigger>
          {orderedTabTypes.map(type => (
            <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Component</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Specs</TableHead>
                <TableHead className="text-right">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedComponents.map((component, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{component.name}</TableCell>
                  <TableCell>{getStandardizedComponentType(component)}</TableCell>
                  <TableCell>
                    <div className="h-12 w-20 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      {component.image ? (
                        <img 
                          src={component.image} 
                          alt={component.name} 
                          className="rounded-md object-cover h-12 w-20"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-xs">이미지 준비중</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-xs">
                          이미지 준비중
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{component.specs}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <a href={component.purchase_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        <Link className="h-3 w-3" />
                        <span>Buy</span>
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Content for component type tabs in fixed order */}
        {orderedTabTypes.map((type) => (
          <TabsContent key={type} value={type} className="space-y-4 mt-4">
            {groupedComponents[type].map((component, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{component.name}</CardTitle>
                  <CardDescription>{getStandardizedComponentType(component)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">
                      {component.image ? (
                        <img 
                          src={component.image} 
                          alt={component.name} 
                          className="rounded-md object-cover h-40 w-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = '<div class="flex items-center justify-center h-full text-gray-500 text-sm">이미지 준비중</div>';
                            }
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                          이미지 준비중
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Specifications</h3>
                      <p className="text-sm">{component.specs}</p>
                      
                      <h3 className="font-medium mb-1 mt-4">Why it was recommended</h3>
                      <p className="text-sm">{component.reason}</p>
                      
                      <div className="mt-4">
                        <Button asChild>
                          <a href={component.purchase_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                            <Link className="h-4 w-4" />
                            <span>Purchase</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {component.alternatives && component.alternatives.length > 0 && (
                    <Accordion type="single" collapsible className="mt-4">
                      <AccordionItem value="alternatives">
                        <AccordionTrigger>Alternative Options</AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Specs</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {component.alternatives.map((alt, altIdx) => (
                                <TableRow key={altIdx}>
                                  <TableCell className="font-medium">{alt.name}</TableCell>
                                  <TableCell>{alt.specs}</TableCell>
                                  <TableCell className="text-right">
                                    <Button size="sm" variant="outline" asChild>
                                      <a href={alt.purchase_link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                                        <Link className="h-3 w-3" />
                                        <span>Buy</span>
                                      </a>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
