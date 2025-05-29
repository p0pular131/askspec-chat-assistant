
import React, { useEffect, useState } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight, Loader2 } from 'lucide-react';
import { callPartRecommendationAPI } from '../../services/apiService';
import { PartRecommendationResponse } from '../../types/apiTypes';
import { samplePartRecommendations } from '../../data/sampleData';

interface PartRecommendationRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

// Helper function to parse markdown-style bold text
const parseBoldText = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return part;
  });
};

const PartRecommendationRenderer: React.FC<PartRecommendationRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'beginner'
}) => {
  const [partData, setPartData] = useState<PartRecommendationResponse>(samplePartRecommendations);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPartRecommendation = async () => {
      if (!sessionId || !content.trim()) {
        return;
      }

      setLoading(true);
      try {
        const apiResponse = await callPartRecommendationAPI({
          sessionId,
          userPrompt: content,
          userLevel: expertiseLevel
        });

        // JSON 파싱 시도
        try {
          const parsed = typeof apiResponse === 'string'
            ? JSON.parse(apiResponse)
            : apiResponse;

          console.log('[✅ 부품 추천 파싱된 응답]');
          console.dir(parsed, { depth: null });
          
          if (parsed.parts && parsed.suggestion) {
            setPartData(parsed);
          }
        } catch (parseError) {
          console.warn('[⚠️ 부품 추천 응답이 JSON 형식이 아님]');
        }
      } catch (error) {
        console.error('[❌ 부품 추천 API 호출 실패]:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPartRecommendation();
  }, [content, sessionId, expertiseLevel]);

  if (loading) {
    return (
      <div className="part-recommendation-response space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>부품 추천 데이터를 가져오는 중...</span>
        </div>
      </div>
    );
  }

  // Convert parts object to array for easier rendering
  const partsArray = Object.values(partData.parts);

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
                  {parseBoldText(part.price)}
                </div>
              </div>
              
              {/* Content Section */}
              <div className="md:w-2/3 flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold text-gray-800 dark:text-gray-200">
                    {parseBoldText(part.name)}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="flex-grow space-y-4">
                  {/* Specs Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      ⚙️ 주요 스펙
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parseBoldText(part.specs)}
                    </p>
                  </div>
                  
                  {/* Reason Section */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                      💡 추천 이유
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {parseBoldText(part.reason)}
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
      
      {/* Suggestion Card */}
      <Card className="bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
            <ArrowRight size={20} />
            다음 단계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-700 dark:text-purple-300 leading-relaxed">
            {parseBoldText(partData.suggestion)}
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
