
import { ResponseModule } from './types';
import { supabase } from '../../integrations/supabase/client';
import { sampleGeneralSearchResponses } from '../../data/sampleData';

export const generalSearchModule: ResponseModule = {
  name: 'generalSearch',
  moduleType: '범용 검색',
  process: async (message: string, expertiseLevel: string = 'intermediate') => {
    try {
      // Call the edge function but ignore the response - we'll use sample data
      await supabase.functions.invoke('chat-completion', {
        body: {
          message,
          expertiseLevel,
          chatMode: '범용 검색',
        },
      });
      
      // Map the expertise level to the appropriate response
      let level = 'intermediate';
      switch (expertiseLevel.toLowerCase()) {
        case 'beginner':
          level = 'beginner';
          break;
        case 'intermediate':
          level = 'intermediate';
          break;
        case 'expert':
          level = 'expert';
          break;
      }
      
      // Return the appropriate sample response based on expertise level
      return sampleGeneralSearchResponses[level];
    } catch (error) {
      console.error('Error in general search module:', error);
      
      // Return the intermediate sample data even on error
      return sampleGeneralSearchResponses.intermediate;
    }
  }
};
