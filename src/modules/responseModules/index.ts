
import { generalSearchModule } from './generalSearchModule';
import { partRecommendationModule } from './partRecommendationModule';
import { compatibilityCheckModule } from './compatibilityCheckModule';
import { buildRecommendationModule } from './buildRecommendationModule';
import { specUpgradeModule } from './specUpgradeModule';
import { buildEvaluationModule } from './buildEvaluationModule';
import { ResponseModule } from './types';

export type { ResponseModule };

export const responseModules: Record<string, ResponseModule> = {
  '범용 검색': generalSearchModule,
  '부품 추천': partRecommendationModule,
  '견적 추천': buildRecommendationModule,
  '호환성 검사': compatibilityCheckModule,
  '스펙 업그레이드': specUpgradeModule,
  '견적 평가': buildEvaluationModule,
};
