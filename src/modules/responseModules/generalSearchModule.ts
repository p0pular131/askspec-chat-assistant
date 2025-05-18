
import { ResponseModule } from './types';
import { supabase } from '../../integrations/supabase/client';

export const generalSearchModule: ResponseModule = {
  name: 'generalSearch',
  moduleType: '범용 검색',
  process: async (message: string, expertiseLevel: string = 'intermediate') => {
    // For general search, we'll try to use the Supabase edge function
    try {
      const response = await supabase.functions.invoke('chat-completion', {
        body: {
          message,
          expertiseLevel,
          chatMode: '범용 검색',
        },
      });

      if (response.error) {
        throw new Error(`Edge function error: ${response.error.message}`);
      }

      return response.data?.response || response.data?.content || 'No response received';
    } catch (error) {
      console.error('Error in general search module:', error);
      
      // Fallback to a mock response
      return `${message}에 대한 답변입니다. 컴퓨터 하드웨어는 매우 다양한 종류가 있으며, 용도에 따라 적합한 부품이 달라집니다.`;
    }
  }
};
