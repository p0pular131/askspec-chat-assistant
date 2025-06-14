
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

/**
 * BuildRecommendationRenderer - AI 견적 추천 응답 렌더러
 * 
 * 이 컴포넌트는 AI가 생성한 PC 견적 추천을 시각적으로 표시합니다.
 * 견적 추천 모드에서 AI 응답을 받았을 때 ResponseRenderer에 의해 호출됩니다.
 * 
 * 주요 기능:
 * 1. 견적 정보 표시 - 제목, 총 가격, 추천 이유
 * 2. 부품별 상세 정보 - 각 부품의 이름, 스펙, 가격, 추천 이유, 구매 링크, 이미지
 * 3. 견적 저장 - 사용자가 견적을 계정에 저장할 수 있는 기능
 * 4. 부품 정렬 - 일관된 순서로 부품 표시 (VGA → CPU → 메인보드 → 메모리 → 저장장치 → 파워 → 케이스 → 쿨러)
 * 5. 추가 제안 - AI의 추가 제안사항 표시
 * 
 * 데이터 처리:
 * - JSON 파싱: AI 응답을 JSON으로 파싱하여 구조화된 데이터 추출
 * - 견적 ID 추출: 저장을 위한 견적 고유 ID 추출
 * - 부품 정렬: 고정 순서에 따른 부품 배치
 * - 부품 타입 자동 인식: 부품명 기반 타입 분류
 * 
 * 컴포넌트 구조:
 * - 요약 카드: 견적 제목, 총 가격, 저장 버튼
 * - 부품 그리드: 각 부품별 상세 카드
 * - 제안 카드: AI의 추가 제안사항
 * - 안내 메시지: 가격 및 호환성 안내
 * 
 * 상태 관리:
 * - 견적 저장 로딩 상태
 * - 에러 처리 및 사용자 알림
 * 
 * @param content - AI 응답 JSON 문자열
 * @param sessionId - 현재 세션 ID (사용하지 않음)
 * @param expertiseLevel - 사용자 전문가 수준 (사용하지 않음)
 * @param recommendationData - 대체 추천 데이터 (사용하지 않음)
 */

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
}

const BuildRecommendationRenderer: React.FC<BuildRecommendationRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'beginner',
  recommendationData 
}) => {
  const { saveEstimate, saveLoading } = useEstimates();
  const [isSaving, setIsSaving] = useState(false);

  /**
   * AI 응답 데이터 파싱 및 견적 ID 추출
   * 
   * AI 응답 JSON을 파싱하여 견적 데이터와 견적 ID를 추출합니다.
   * 파싱에 실패하면 샘플 데이터를 사용합니다.
   */
  let buildData;
  let estimateId = null;
  
  try {
    const parsedData = JSON.parse(content);
    console.log('[🔍 견적 데이터] 파싱된 데이터:', parsedData);
    
    // Extract estimate ID from various possible locations
    estimateId = parsedData.id || parsedData.estimate_id || null;
    console.log('[🔍 견적 ID] 추출된 견적 ID:', estimateId);
    
    // Check if the parsed data has the expected structure
    if (parsedData.response && parsedData.response.title && parsedData.response.parts) {
      buildData = parsedData.response;
      console.log('[✅ 견적 데이터] response 구조에서 데이터 추출');
    } else if (parsedData.title && parsedData.parts) {
      buildData = parsedData;
      console.log('[✅ 견적 데이터] 직접 구조에서 데이터 추출');
    } else {
      throw new Error('Invalid data structure');
    }
  } catch (error) {
    console.warn('[⚠️ 견적 데이터] 파싱 실패, 샘플 데이터 사용:', error);
    buildData = recommendationData || sampleBuildRecommendation;
  }
  
  /**
   * 부품 타입 자동 인식 함수
   * 
   * 부품명을 분석하여 표준화된 부품 타입을 반환합니다.
   * 부품명에 포함된 키워드를 기반으로 분류합니다.
   * 
   * @param part - 부품 정보 객체
   * @returns 표준화된 부품 타입 문자열
   */
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

  /**
   * 부품 정렬 함수
   * 
   * 부품들을 고정된 순서에 따라 정렬합니다.
   * 배열 형태와 객체 형태 데이터를 모두 처리할 수 있습니다.
   * 
   * @returns 정렬된 부품 배열
   */
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
  
  /**
   * 견적 저장 핸들러
   * 
   * 사용자가 "견적 저장" 버튼을 클릭했을 때 실행됩니다.
   * 견적 ID를 사용하여 서버에 견적을 저장합니다.
   * 
   * 처리 과정:
   * 1. 견적 ID 유효성 검사
   * 2. useEstimates 훅을 통한 저장 API 호출
   * 3. 저장 성공시 다른 컴포넌트에 알림 (estimatesSaved 이벤트)
   * 4. 에러 처리 및 사용자 알림
   */
  const handleSaveEstimate = async () => {
    try {
      setIsSaving(true);
      
      // Use the actual estimate ID from the API response
      if (!estimateId) {
        console.warn('[⚠️ 견적 저장] 견적 ID를 찾을 수 없음');
        toast({
          title: "저장 실패",
          description: "견적 ID를 찾을 수 없습니다.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('[🔄 견적 저장] 견적 ID로 저장 시작:', estimateId);
      const success = await saveEstimate(estimateId);
      
      if (success) {
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('estimatesSaved'));
      }
      
    } catch (error) {
      console.error('[❌ 견적 저장] 저장 중 오류:', error);
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
      {/* 견적 요약 카드 - 제목, 총 가격, 저장 버튼 */}
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
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <p className="text-muted-foreground italic">{buildData.total_reason}</p>
        </CardContent>
      </Card>

      {/* 부품 그리드 - 정렬된 순서로 부품 표시 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedParts.map((part, index) => (
          <Card key={index} className="overflow-hidden h-full flex flex-col">
            {/* 부품 이미지 영역 */}
            <div className="h-56 overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
              {(part.image || part.image_url) ? (
                <img 
                  src={part.image || part.image_url} 
                  alt={part.name}
                  className="max-h-full max-w-full object-contain"
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
            
            {/* 부품 정보 헤더 */}
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
            
            {/* 부품 상세 정보 */}
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
            
            {/* 구매 링크 버튼 */}
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
      
      {/* AI 추가 제안 카드 */}
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
      
      {/* 안내 메시지 */}
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
