
// API 응답 데이터 구조체 정의

// 범용 검색 응답
export interface GeneralSearchResponse {
  content: string;
  expertiseLevel: 'beginner' | 'intermediate' | 'expert';
}

// 부품 추천 응답
export interface PartRecommendationResponse {
  parts: {
    [key: string]: {
      name: string;
      reason: string;
      price: string;
      specs: string;
      link: string;
      image_url: string;
    };
  };
  suggestion: string;
}

// 호환성 검사 응답
export interface CompatibilityCheckResponse {
  components: string[];
  [key: string]: boolean | string | string[] | null;
  edge_case?: boolean;
  edge_reason?: string;
  suggestion?: string;
}

// 견적 추천 응답
export interface BuildRecommendationResponse {
  title: string;
  parts: {
    [key: string]: {
      name: string;
      price: string;
      specs: string;
      reason: string;
      link: string;
      image_url: string;
    };
  };
  total_price: string;
  total_reason: string;
  suggestion: string;
}

// 스펙 업그레이드 응답
export interface SpecUpgradeResponse {
  title: string;
  parts: {
    [key: string]: {
      name: string;
      price: string;
      specs: string;
      reason: string;
      link: string;
      image_url: string;
    };
  };
  total_price: string;
  total_reason: string;
  suggestion: string;
}

// 견적 평가 응답
export interface BuildEvaluationResponse {
  performance: {
    score: number;
    comment: string;
  };
  price_performance: {
    score: number;
    comment: string;
  };
  expandability: {
    score: number;
    comment: string;
  };
  noise: {
    score: number;
    comment: string;
  };
  average_score: number;
  suggestion?: string;
}
