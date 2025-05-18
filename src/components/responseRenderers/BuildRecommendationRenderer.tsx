
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
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';
import { EstimateResponse } from '../../modules/responseModules/buildRecommendationModule';

interface BuildRecommendationRendererProps {
  content: string;
}

const BuildRecommendationRenderer: React.FC<BuildRecommendationRendererProps> = ({ content }) => {
  // Try parsing the content as JSON
  let buildData: EstimateResponse | null = null;
  
  try {
    // First, try to extract JSON if the content starts with text or is wrapped in other content
    let jsonContent = content;
    
    // 우선 완전한 JSON 덩어리만 추출
    const match = content.match(/{[\s\S]+}/);
    if (!match) throw new Error("No JSON object found in content");

    jsonContent = match[0].trim();
    console.log("Trying to parse this JSON string:\n", jsonContent.substring(0, 200));
    // In case the content is not valid JSON at all, handle the exception in the catch block
    buildData = JSON.parse(jsonContent) as EstimateResponse;
    
    // Basic validation of the parsed data
    if (!buildData || !Array.isArray(buildData.parts)) {
      console.error("Parsed data is not in the expected format:", buildData);
      throw new Error("Invalid data format");
    }
  } catch (error) {
    console.error("Failed to parse build recommendation data:", error);
    
    // Try to import the sample data directly from the module
    try {
      // Since we can't directly import at this point, we'll use a fallback error card
      return (
        <Card className="w-full border-red-300">
          <CardHeader>
            <CardTitle className="text-red-600">데이터 로딩 오류</CardTitle>
            <CardDescription>PC 견적 데이터를 불러오는 중 오류가 발생했습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">현재 견적 데이터를 파싱할 수 없습니다.</p>
            <p className="text-sm text-muted-foreground">AI가 제공한 응답이 예상 형식과 일치하지 않습니다. 새로운 견적을 요청해 보세요.</p>
          </CardContent>
        </Card>
      );
    } catch (moduleError) {
      console.error("Could not load sample data:", moduleError);
    }
  }

  // If we couldn't parse the data or it's invalid, show a message
  if (!buildData || !buildData.parts || buildData.parts.length === 0) {
    return (
      <div className="build-recommendation-response">
        <Card className="w-full border-yellow-300">
          <CardHeader>
            <CardTitle>견적 데이터 없음</CardTitle>
            <CardDescription>현재 견적 데이터가 준비되지 않았습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>다음 중 하나를 시도해보세요:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>새로고침을 통해 다시 시도하기</li>
              <li>새 견적 요청하기</li>
              <li>고객 지원에 문의하기</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="build-recommendation-response space-y-6">
      {/* Summary Card with Total Price and Reasoning */}
      <Card className="w-full border-2 border-blue-200">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/30">
          <CardTitle className="text-2xl font-bold">맞춤 PC 견적</CardTitle>
          <div className="flex justify-between items-center mt-2">
            <CardDescription className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              총 예상 가격: {buildData.total_price}
            </CardDescription>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full p-0 w-8 h-8">
                  <Info size={16} />
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <p>이 견적은 사용자의 요구사항과 예산에 맞게 최적화되었습니다. 가격은 시장 상황에 따라 변동될 수 있습니다.</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground italic">{buildData.total_reason}</p>
        </CardContent>
      </Card>

      {/* Components Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {buildData.parts.map((part, index) => (
          <Card key={index} className="overflow-hidden h-full flex flex-col">
            <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
              {part.image && (
                <img 
                  src={part.image} 
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
      
      {/* Footer Notes */}
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
