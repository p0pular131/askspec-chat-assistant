
import { ResponseModule } from './types';
import { sampleBuildEvaluationData } from '../../data/sampleData';

export const specUpgradeModule: ResponseModule = {
  name: 'specUpgrade',
  moduleType: '스펙 업그레이드',
  process: async () => {
    // Always return the sample data as a JSON string
    return JSON.stringify(sampleSpecUpgradeData);
  }
};
