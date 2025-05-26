
import { ResponseModule, CompatibilityData } from './types';
import { sampleCompatibilityData } from '../../data/sampleData';

export const compatibilityCheckModule: ResponseModule = {
  name: 'compatibilityCheck',
  moduleType: '호환성 검사',
  process: async (content) => {
    // Add the missing components property to match CompatibilityData interface
    const compatibilityDataWithComponents: CompatibilityData = {
      ...sampleCompatibilityData,
      components: ['CPU', 'Memory', 'Motherboard', 'VGA', 'PSU', 'Case', 'Cooler', 'Storage']
    };
    
    return JSON.stringify(compatibilityDataWithComponents);
  }
};
