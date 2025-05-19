
import { ResponseModule } from './types';
import { sampleSpecUpgradeData } from '../../data/sampleData';

export const specUpgradeModule: ResponseModule = {
  name: 'specUpgrade',
  moduleType: '스펙 업그레이드',
  process: async () => {
    // Use sample data for future implementation
    return `
    # 스펙 업그레이드 추천
    
    이 기능은 아직 구현 중입니다. 곧 현재 PC 사양을 기반으로 한 업그레이드 추천 서비스를 제공할 예정입니다.
    
    현재는 일반 검색 모드를 통해 스펙 업그레이드에 대한 문의를 해주시면 답변 드리겠습니다.
    `;
  }
};
