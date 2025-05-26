
import { supabase } from '../integrations/supabase/client';
import { Build } from '../types/conversation';

export const loadBuilds = async (): Promise<Build[]> => {
  const { data, error } = await supabase
    .from('estimates')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    throw error;
  }
  
  if (data) {
    return data.map(item => ({
      id: item.id,
      name: item.purpose || 'Unnamed Build',
      session_id: 0,
      created_at: item.created_at || '',
      total_price: item.total_price || 0,
      parts: item.metrics_score_json || {}
    }));
  }

  return [];
};

export const deleteBuild = async (buildId: number): Promise<boolean> => {
  const { error } = await supabase
    .from('estimates')
    .delete()
    .eq('id', buildId);

  if (error) {
    throw new Error(`견적 삭제 실패: ${error.message}`);
  }

  return true;
};
