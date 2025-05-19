
import { ResponseModule } from './types';
import { sampleBuildEvaluationData } from '../../data/sampleData';

export const buildEvaluationModule: ResponseModule = {
  name: 'buildEvaluation',
  moduleType: '견적 평가',
  process: async () => {
    // Generate a simple message that will be rendered alongside our visual component
    return `
    # 견적 평가 결과
    
    견적의 세부 평가 결과는 위 카드에서 확인하실 수 있습니다.
    
    이 견적은 전반적으로 ${sampleBuildEvaluationData.average_score}점으로 평가됩니다.
    `;
  }
};
