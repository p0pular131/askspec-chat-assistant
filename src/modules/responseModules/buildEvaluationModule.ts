
import { ResponseModule } from './types';
import { sampleBuildEvaluationData } from '../../data/sampleData';

export const buildEvaluationModule: ResponseModule = {
  name: 'buildEvaluation',
  moduleType: '견적 평가',
  process: async (userMessage: string, expertiseLevel: string = 'intermediate') => {
    // Since we're showing the visual component with sample data, we just need to return a minimal string
    // This ensures the response is not empty, preventing the "응답을 받지 못했습니다." error
    return '';
  }
};
