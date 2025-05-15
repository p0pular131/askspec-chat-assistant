
import { ResponseModule } from './types';

export const buildEvaluationModule: ResponseModule = {
  name: 'buildEvaluation',
  moduleType: '견적 평가',
  process: async () => {
    // Placeholder for future implementation
    return `
    # 견적 평가
    
    이 기능은 아직 구현 중입니다. 곧 견적 평가 서비스를 제공할 예정입니다.
    
    현재는 일반 검색 모드를 통해 견적 평가에 관해 문의해주시면 답변 드리겠습니다.
    `;
  }
};
