
import React from 'react';
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
import { ExternalLink, Save, TrendingUp } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { sampleSpecUpgradeData } from '../../modules/responseModules/specUpgradeModule';

// Define the interface for Spec Upgrade data
export interface SpecUpgradeResponse {
  title: string;
  parts: Record<string, {
    name: string;
    price: string;
    specs: string;
    reason: string;
    link: string;
    image_url: string;
  }>;
  total_price: string;
  total_reason: string;
  suggestion: string;
}

interface SpecUpgradeRendererProps {
  content: string;
  upgradeData?: SpecUpgradeResponse;
}

const SpecUpgradeRenderer: React.FC<SpecUpgradeRendererProps> = ({ content, upgradeData }) => {
  // Parse content if it's JSON, otherwise use provided data or fall back to sample data
  let specData = upgradeData || sampleSpecUpgradeData;
  
  try {
    if (content && content.trim().startsWith('{')) {
      specData = JSON.parse(content);
    }
  } catch (error) {
    console.error('Error parsing spec upgrade content:', error);
    // Fall back to sample data
  }
  
  // Convert parts object to array for easier rendering
  const partsArray = Object.entries(specData.parts).map(([type, part]) => ({
    type,
    ...part
  }));
  
  // Function to save the spec upgrade to local storage and show feedback
  const handleSaveSpecUpgrade = () => {
    try {
      // Create a spec upgrade object from the current recommendation data
      const newSpecUpgrade = {
        id: Date.now(), // Simple ID generation for local storage
        name: specData.title,
        total_price: typeof specData.total_price === 'string' 
          ? parseInt(specData.total_price.replace(/[₩,]/g, '')) 
          : specData.total_price,
        created_at: new Date().toISOString(),
        parts: partsArray,
        total_reason: specData.total_reason,
        type: 'spec_upgrade' // Tag to differentiate from build recommendations
      };

      // Get existing builds from localStorage
      const existingBuilds = JSON.parse(localStorage.getItem('savedBuilds') || '[]');
      
      // Add the new spec upgrade
      const updatedBuilds = [newSpecUpgrade, ...existingBuilds];
      
      // Save back to localStorage
      localStorage.setItem('savedBuilds', JSON.stringify(updatedBuilds));
      
      // Show success toast
      toast({
        title: "스펙 업그레이드 저장 완료",
        description: "업그레이드 견적이 성공적으로 저장되었습니다.",
      });

      // Trigger a custom event to notify other components of the update
      window.dispatchEvent(new CustomEvent('buildsUpdated'));
      
    } catch (error) {
      console.error('Error saving spec upgrade:', error);
      toast({
        title: "저장 실패",
        description: "스펙 업그레이드 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="spec-upgrade-response space-y-6">
      {/* Summary Card with Total Price and Reasoning - Green theme for differentiation */}
      <Card className="w-full border-2 border-green-200">
        <CardHeader className="bg-green-50 dark:bg-green-950/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl font-bold">{specData.title}</CardTitle>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 border-green-300 hover:bg-green-100"
              onClick={handleSaveSpecUpgrade}
            >
              <Save size={16} />
              <span>업그레이드 저장</span>
            </Button>
          </div>
          <div className="flex justify-between items-center mt-2">
            <CardDescription className="text-xl font-semibold text-green-600 dark:text-green-400">
              총 업그레이드 가격: {specData.total_price}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground italic">{specData.total_reason}</p>
        </CardContent>
      </Card>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {partsArray.map((part, index) => (
          <Card key={index} className="overflow-hidden h-full flex flex-col border-green-100">
            <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              {part.image_url && (
                <img 
                  src={part.image_url} 
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
                <div className="flex flex-col gap-1">
                  <div className="text-sm text-green-600 font-medium">{part.type}</div>
                  <CardTitle className="text-lg font-bold">{part.name}</CardTitle>
                </div>
                <div className="text-right font-semibold text-green-600 dark:text-green-400">
                  {part.price}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-semibold">스펙</h4>
                  <p className="text-sm text-muted-foreground">{part.specs}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold">업그레이드 이유</h4>
                  <p className="text-sm text-muted-foreground">{part.reason}</p>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="pt-0">
              {part.link ? (
                <a 
                  href={part.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-full"
                >
                  <Button variant="outline" className="w-full flex gap-2 items-center border-green-300 hover:bg-green-50">
                    <span>제품 상세 보기</span>
                    <ExternalLink size={16} />
                  </Button>
                </a>
              ) : (
                <Button variant="outline" disabled className="w-full">
                  상세 정보 준비 중
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Footer Notes */}
      <Card className="border-green-100">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            * 업그레이드 가격은 대략적인 견적이며, 판매처와 시기에 따라 달라질 수 있습니다.<br />
            * 기존 부품과의 호환성은 검증되었으나, 구매 전 최종 확인하는 것을 권장합니다.<br />
            * 업그레이드 관련 추가 문의는 챗봇에게 물어보세요.
          </p>
          {specData.suggestion && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-md border border-green-200">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>💡 다음 단계:</strong> {specData.suggestion}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SpecUpgradeRenderer;
