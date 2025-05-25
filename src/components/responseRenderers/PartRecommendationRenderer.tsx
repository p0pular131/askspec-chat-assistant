
import React from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Info } from 'lucide-react';
import { samplePartRecommendations } from '../../data/sampleData';

// Define the interface for Part Recommendation data
interface PartDetail {
  name: string;
  reason: string;
  price: string;
  specs: string;
  link: string;
  image_url: string;
}

interface PartsResponse {
  parts: {
    [key: string]: PartDetail;
  };
  suggestion: string;
}

interface PartRecommendationRendererProps {
  content: string;
  partData?: PartsResponse;
}

const PartRecommendationRenderer: React.FC<PartRecommendationRendererProps> = ({ 
  content, 
  partData 
}) => {
  // Use provided data or fall back to sample data to ensure consistency
  const data = partData || samplePartRecommendations;
  
  // Convert parts object to array for easier rendering
  const partsArray = Object.values(data.parts);

  return (
    <div className="part-recommendation-response space-y-6">
      {/* Header - Left aligned, no subtitle */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
          부품 추천 결과
        </h2>
      </div>

      {/* Parts - Vertical Stack Layout */}
      <div className="space-y-6">
        {partsArray.map((part, index) => (
          <Card key={index} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col md:flex-row">
              {/* Product Image */}
              <div className="md:w-1/3 h-48 md:h-auto overflow-hidden bg-gray-100 dark:bg-gray-800 relative">
                {part.image_url && (
                  <img 
                    src={part.image_url} 
                    alt={part.name}
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://placehold.co/400x300?text=이미지+없음";
                    }}
                  />
                )}
                {/* Price Badge */}
                <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-md text-sm font-semibold">
                  {part.price}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="md:w-2/3 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {part.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow space-y-4">
                  {/* Specs Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      ⚙️ 주요 스펙
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {part.specs}
                    </p>
                  </div>
                  
                  {/* Reason Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      💡 추천 이유
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {part.reason}
                    </p>
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
                      <Button variant="default" className="w-full flex gap-2 items-center">
                        <span>구매하기</span>
                        <ExternalLink size={16} />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      링크 없음
                    </Button>
                  )}
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* System Suggestion Section */}
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Info size={20} />
            추천 가이드
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 dark:text-blue-300 leading-relaxed">
            {data.suggestion}
          </p>
        </CardContent>
      </Card>
      
      {/* Footer Notes */}
      <Card className="bg-gray-50 dark:bg-gray-900/50">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            * 제시된 가격은 참고용이며, 실제 판매가와 다를 수 있습니다.<br />
            * 구매 전 호환성 및 최신 가격을 확인하시기 바랍니다.<br />
            * 추가 문의사항이 있으시면 챗봇에게 질문해주세요.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartRecommendationRenderer;
