import React, { useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ExternalLink, Save, ArrowRight } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { sampleBuildRecommendation } from '../../data/sampleData';
import { useEstimates } from '../../hooks/useEstimates';

// Fixed order for component types
const COMPONENT_ORDER = ["VGA", "CPU", "Motherboard", "Memory", "Storage", "PSU", "Case", "Cooler"];

// Define the interface for Build Recommendation data
export interface PartDetail {
  name: string;
  price: string;
  specs: string;
  reason: string;
  link: string;
  image?: string;
  image_url?: string;
}

export interface EstimateResponse {
  title: string;
  parts: PartDetail[] | Record<string, PartDetail>;
  total_price: string;
  total_reason: string;
  suggestion?: string;
}

interface BuildRecommendationRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
  recommendationData?: EstimateResponse;
  estimateId?: string | null; // 견적 ID prop 추가
}

const BuildRecommendationRenderer: React.FC<BuildRecommendationRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'beginner',
  recommendationData,
  estimateId = null // 견적 ID 받기
}) => {
  const { saveEstimate, saveLoading } = useEstimates();
  const [isSaving, setIsSaving] = useState(false);

  // Try to parse content as JSON, fallback to sample data if parsing fails
  let buildData;
  let finalEstimateId = estimateId; // 먼저 prop으로 받은 견적 ID 사용
  
  console.log('[🔍 BuildRecommendationRenderer] 받은 estimateId:', estimateId);
  console.log('[🔍 BuildRecommendationRenderer] content:', content.substring(0, 200));
  
  try {
    const parsedData = JSON.parse(content);
    console.log('[🔍 BuildRecommendationRenderer] 파싱된 데이터:', parsedData);
    
    // Extract estimate ID if available in content and not provided via prop
    if (!finalEstimateId && parsedData.id) {
      finalEstimateId = parsedData.id;
      console.log('[🔍 견적 ID] content에서 견적 ID 추출:', finalEstimateId);
    }
    
    // Check if the parsed data has the expected structure
    if (parsedData.response && parsedData.response.title && parsedData.response.parts) {
      buildData = parsedData.response;
    } else if (parsedData.title && parsedData.parts) {
      buildData = parsedData;
    } else {
      throw new Error('Invalid data structure');
    }
  } catch (error) {
    console.warn('Failed to parse build recommendation data, using sample data');
    buildData = recommendationData || sampleBuildRecommendation;
  }
  
  console.log('[🔍 BuildRecommendationRenderer] 최종 estimateId:', finalEstimateId);
  
  // Function to get standardized part type from part details
  const getStandardizedPartType = (part: PartDetail): string => {
    const name = part.name.toLowerCase();
    
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

  // Sort parts according to the fixed order
  const getSortedParts = (): PartDetail[] => {
    let partsToSort: PartDetail[];
    
    // Convert parts to array format if it's an object
    if (Array.isArray(buildData.parts)) {
      partsToSort = buildData.parts;
    } else {
      // If it's an object with keys matching our standard types, use the fixed order
      const partsObject = buildData.parts as Record<string, PartDetail>;
      partsToSort = [];
      
      // First, try to use the fixed order with exact key matches
      COMPONENT_ORDER.forEach(componentType => {
        if (partsObject[componentType]) {
          partsToSort.push(partsObject[componentType]);
        }
      });
      
      // Add any remaining parts that don't match the standard keys
      Object.entries(partsObject).forEach(([key, part]) => {
        if (!COMPONENT_ORDER.includes(key)) {
          partsToSort.push(part);
        }
      });
      
      // If we didn't find parts with exact key matches, fall back to name-based sorting
      if (partsToSort.length === 0) {
        partsToSort = Object.values(partsObject);
      }
    }
    
    // If we have an array, sort it according to our standardized types
    if (partsToSort.length > 0 && Array.isArray(partsToSort)) {
      // Group parts by their standardized type
      const partsByType: Record<string, PartDetail[]> = {};
      
      partsToSort.forEach(part => {
        const standardizedType = getStandardizedPartType(part);
        if (!partsByType[standardizedType]) {
          partsByType[standardizedType] = [];
        }
        partsByType[standardizedType].push(part);
      });

      // Return parts sorted by the fixed order
      const sortedParts: PartDetail[] = [];
      
      COMPONENT_ORDER.forEach(type => {
        if (partsByType[type]) {
          sortedParts.push(...partsByType[type]);
        }
      });
      
      // Add any unknown types at the end
      if (partsByType['Unknown']) {
        sortedParts.push(...partsByType['Unknown']);
      }
      
      return sortedParts;
    }
    
    return partsToSort;
  };

  const sortedParts = getSortedParts();
  
  // Function to save the estimate via API
  const handleSaveEstimate = async () => {
    try {
      setIsSaving(true);
      
      // Use the final estimate ID (from prop or content)
      if (!finalEstimateId) {
        console.warn('No estimate ID found, cannot save estimate');
        toast({
          title: "저장 실패",
          description: "견적 ID를 찾을 수 없습니다.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('[💾 견적 저장] 견적 ID로 저장 시도:', finalEstimateId);
      const success = await saveEstimate(finalEstimateId);
      
      if (success) {
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('estimatesSaved'));
      }
      
    } catch (error) {
      console.error('Error saving estimate:', error);
      toast({
        title: "저장 실패",
        description: "견적 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="build-recommendation-response space-y-6">
      {/* Summary Card with Total Price and Reasoning */}
      <Card className="w-full border-2 border-blue-200">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">{buildData.title}</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleSaveEstimate}
              disabled={isSaving || saveLoading}
            >
              {isSaving || saveLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>견적 저장</span>
                </>
              )}
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <CardDescription className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              총 예상 가격: {buildData.total_price}
            </CardDescription>
            {finalEstimateId && (
              <CardDescription className="text-sm text-muted-foreground">
                견적 ID: {finalEstimateId}
              </CardDescription>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground italic">{buildData.total_reason}</p>
        </CardContent>
      </Card>

      {/* Components Grid - now sorted by fixed order */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedParts.map((part, index) => (
          <Card key={index} className="overflow-hidden h-full flex flex-col">
            <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              {(part.image || part.image_url) && (
                <img 
                  src={part.image || part.image_url} 
                  alt={part.name}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400?text=이미지+없음";
                  }}
                />
              )}
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{part.name}</CardTitle>
                <div className="text-right font-semibold text-blue-600 dark:text-blue-400">
                  {part.price}
                </div>
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {getStandardizedPartType(part)}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold">스펙</h4>
                  <p className="text-sm text-muted-foreground">{part.specs}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold">추천 이유</h4>
                  <p className="text-sm text-muted-foreground">{part.reason}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0">
              <a 
                href={part.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-full"
              >
                <Button variant="outline" className="w-full flex gap-2 items-center">
                  <span>제품 상세 보기</span>
                  <ExternalLink size={16} />
                </Button>
              </a>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Suggestion Card */}
      {buildData.suggestion && (
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <ArrowRight size={20} />
              다음 단계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
              {buildData.suggestion}
            </p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            * 제시된 가격은 대략적인 견적이며, 판매처와 시기에 따라 달라질 수 있습니다.<br />
            * 호환성은 검증되었으나, 구매 전 최종 확인하는 것을 권장합니다.<br />
            * 상세 문의는 챗봇에게 물어보세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuildRecommendationRenderer;
