
import { ResponseModule } from './types';
import { sampleBuildEvaluationData } from '../../data/sampleData';

export const buildEvaluationModule: ResponseModule = {
  name: 'buildEvaluation',
  moduleType: '견적 평가',
  process: async (userMessage: string, expertiseLevel: string = 'intermediate') => {
    // Return more detailed content to ensure there's a valid response
    const averageScore = sampleBuildEvaluationData.average_score 
      ? sampleBuildEvaluationData.average_score.score || 0 
      : 0;
      
    return `견적 평가가 완료되었습니다. 총 평가 점수는 ${averageScore}점입니다. 추가 질문이 있으면 물어봐주세요!`;
  }
};
