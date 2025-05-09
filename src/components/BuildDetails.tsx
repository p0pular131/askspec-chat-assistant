
import React from 'react';
import { Build, Component } from '@/hooks/useBuilds';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link, DollarSign, VolumeX, Zap, FileExport } from 'lucide-react';
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
  // Group components by type
  const groupedComponents = build.components.reduce((acc, component) => {
    const type = component.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(component);
    return acc;
  }, {} as Record<string, Component[]>);

  // Extract rating scores if they exist, otherwise use placeholders
  const hasRatings = build.rating && typeof build.rating === 'object';
  const valueForMoney = hasRatings && build.rating.valueForMoney !== undefined ? build.rating.valueForMoney : null;
  const noise = hasRatings && build.rating.noise !== undefined ? build.rating.noise : null;
  const performance = hasRatings && build.rating.performance !== undefined ? build.rating.performance : null;

  // Function to export the build details as PDF
  const exportAsPDF = async () => {
    try {
      toast({
        title: "PDF 생성 중",
        description: "PDF를 생성 중입니다. 잠시만 기다려주세요.",
      });

      // Create a new PDF document
      const pdf = new jsPDF();
      let yPos = 20;

      // Add title
      pdf.setFontSize(20);
      pdf.text(build.name, 20, yPos);
      yPos += 10;
      
      // Add price
      pdf.setFontSize(12);
      pdf.text(`총 가격: ${formatCurrency(build.total_price)}`, 20, yPos);
      yPos += 15;
      
      // Add recommendation section
      pdf.setFontSize(16);
      pdf.text('견적 추천 설명', 20, yPos);
      yPos += 10;
      
      pdf.setFontSize(12);
      const recommendationLines = pdf.splitTextToSize(build.recommendation, 170);
      pdf.text(recommendationLines, 20, yPos);
      yPos += recommendationLines.length * 7 + 10;
      
      // Add evaluation section
      pdf.setFontSize(16);
      pdf.text('견적 평가', 20, yPos);
      yPos += 10;

      pdf.setFontSize(12);
      pdf.text(`가성비: ${valueForMoney !== null ? `${valueForMoney}/10` : "평가 없음"}`, 20, yPos);
      yPos += 7;
      pdf.text(`소음: ${noise !== null ? `${noise}/10` : "평가 없음"}`, 20, yPos);
      yPos += 7;
      pdf.text(`성능: ${performance !== null ? `${performance}/10` : "평가 없음"}`, 20, yPos);
      yPos += 15;
      
      // Add components table
      pdf.setFontSize(16);
      pdf.text('구성 요소', 20, yPos);
      yPos += 10;

      // Create a table for components
      const componentRows = build.components.map(component => [
        component.name,
        component.type,
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
      
      // Save the PDF
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
          <FileExport className="h-4 w-4" />
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
            {/* Circular rating indicators in horizontal layout */}
            <div className="flex flex-row flex-wrap justify-around gap-4">
              <RatingIndicator 
                label="가성비" 
                value={valueForMoney} 
                maxValue={10} 
                icon={<DollarSign className="h-4 w-4" />} 
                color="#9b87f5"
              />
              <RatingIndicator 
                label="소음" 
                value={noise} 
                maxValue={10} 
                icon={<VolumeX className="h-4 w-4" />}
                color="#0EA5E9" 
              />
              <RatingIndicator 
                label="성능" 
                value={performance} 
                maxValue={10} 
                icon={<Zap className="h-4 w-4" />}
                color="#F97316" 
              />
            </div>
            {/* Description text */}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Components</TabsTrigger>
          {Object.keys(groupedComponents).map(type => (
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
              {build.components.map((component, idx) => (
                <TableRow key={idx}>
                  <TableCell className="font-medium">{component.name}</TableCell>
                  <TableCell>{component.type}</TableCell>
                  <TableCell>
                    {component.image && (
                      <img 
                        src={component.image} 
                        alt={component.name} 
                        className="rounded-md object-cover h-12 w-20"
                      />
                    )}
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

        {/* Content for component type tabs */}
        {Object.entries(groupedComponents).map(([type, components]) => (
          <TabsContent key={type} value={type} className="space-y-4 mt-4">
            {components.map((component, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{component.name}</CardTitle>
                  <CardDescription>{component.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {component.image && (
                      <div>
                        <img 
                          src={component.image} 
                          alt={component.name} 
                          className="rounded-md object-cover h-40 w-full"
                        />
                      </div>
                    )}
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
