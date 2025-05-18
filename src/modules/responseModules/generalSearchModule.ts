
import { ResponseModule } from './types';
import { supabase } from '../../integrations/supabase/client';

const sampleSearchResponse = `컴퓨터 하드웨어는 매우 다양한 종류가 있으며, 용도에 따라 적합한 부품이 달라집니다. 
CPU는 컴퓨터의 두뇌로, Intel과 AMD가 주요 제조사입니다. 
GPU는 그래픽 처리를 담당하며 NVIDIA와 AMD가 주로 생산합니다.
RAM은 작업 중인 데이터를 임시로 저장하는 메모리이고, SSD와 HDD는 영구 저장장치입니다.
메인보드는 이 모든 부품이 연결되는 중심 부품이며, 파워 서플라이는 전력을 공급합니다.`;

export const generalSearchModule: ResponseModule = {
  name: 'generalSearch',
  moduleType: '범용 검색',
  process: async (message: string, expertiseLevel: string = 'intermediate') => {
    try {
      // Call the edge function but ignore the response - we'll use sample data
      const response = await supabase.functions.invoke('chat-completion', {
        body: {
          message,
          expertiseLevel,
          chatMode: '범용 검색',
        },
      });
      
      // Always return the sample data regardless of the edge function response
      return sampleSearchResponse;
    } catch (error) {
      console.error('Error in general search module:', error);
      
      // Return the sample data even on error
      return sampleSearchResponse;
    }
  }
};
