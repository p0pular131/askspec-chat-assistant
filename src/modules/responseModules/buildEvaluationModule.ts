
import { ResponseModule } from './types';
import { sampleBuildEvaluationData } from '../../data/sampleData';

export const buildEvaluationModule: ResponseModule = {
  name: 'buildEvaluation',
  moduleType: '견적 평가',
  process: async (userMessage: string, expertiseLevel: string = 'intermediate') => {
    // Safely extract the score, handling both object with score property and direct number
    const getScoreValue = (scoreData: number | { score: number } | undefined) => {
      if (typeof scoreData === 'object' && scoreData && 'score' in scoreData) {
        return scoreData.score;
      } else if (typeof scoreData === 'number') {
        return scoreData;
      }
      return 0;
    };
    
    const averageScore = getScoreValue(sampleBuildEvaluationData.average_score);
      
    return `견적 평가가 완료되었습니다. 총 평가 점수는 ${averageScore}점입니다. 추가 질문이 있으면 물어봐주세요!`;
  }
};
