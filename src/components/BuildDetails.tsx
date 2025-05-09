
import React from 'react';
import { Build, Component } from '@/hooks/useBuilds';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Link } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

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

  // Extract rating scores if they exist
  const hasRatings = build.rating && typeof build.rating === 'object' && Object.keys(build.rating).length > 0;
  
  // Debug ratings data
  console.log("Build rating data:", build.rating);
  console.log("hasRatings:", hasRatings);
  
  const valueForMoney = hasRatings && build.rating.valueForMoney ? build.rating.valueForMoney : null;
  const noise = hasRatings && build.rating.noise ? build.rating.noise : null;
  
  console.log("valueForMoney:", valueForMoney);
  console.log("noise:", noise);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{build.name}</h1>
        <p className="text-muted-foreground mt-1">Total Price: {formatCurrency(build.total_price)}</p>
        
        <Card className="mt-4">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Recommendation</CardTitle>
              <CardDescription>Why this build was recommended</CardDescription>
            </div>
            {hasRatings && (
              <div className="flex flex-col gap-2">
                {valueForMoney !== null && (
                  <Badge variant="outline" className="ml-auto">
                    Value for Money: {valueForMoney}/10
                  </Badge>
                )}
                {noise !== null && (
                  <Badge variant="outline" className="ml-auto">
                    Noise: {noise}/10
                  </Badge>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <p>{build.recommendation}</p>
          </CardContent>
        </Card>
      </div>

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
