
import { ResponseModule } from './types';
import { samplePartRecommendations } from '../../data/sampleData';

export const partRecommendationModule: ResponseModule = {
  name: 'partRecommendation',
  moduleType: '부품 추천',
  process: async (message: string, expertiseLevel?: string) => {
    // For now, return a simple acknowledgment message
    // The actual UI rendering will be handled by the PartRecommendationRenderer component
    return `
요청하신 부품 추천을 준비했습니다. 

**요청 내용:** ${message}

아래에서 추천 부품들을 확인하실 수 있습니다. 각 부품의 상세 정보와 구매 링크도 함께 제공됩니다.

추가 질문이나 다른 부품에 대한 정보가 필요하시면 언제든 말씀해 주세요.
    `.trim();
  }
};
