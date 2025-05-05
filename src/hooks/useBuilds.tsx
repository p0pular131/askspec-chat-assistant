
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

export interface Component {
  name: string;
  type: string;
  image: string;
  specs: string;
  reason: string;
  purchase_link: string;
  alternatives: {
    name: string;
    specs: string;
    purchase_link: string;
  }[];
}

export interface Build {
  id: string;
  name: string;
  conversation_id: string;
  components: Component[];
  total_price: number;
  recommendation: string;
  created_at: string;
}

export function useBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  const loadBuilds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('pc_builds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setBuilds(data || []);
    } catch (err) {
      console.error('Error loading builds:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBuild = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('pc_builds')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      setSelectedBuild(data);
      return data;
    } catch (err) {
      console.error('Error getting build:', err);
      throw err;
    }
  };

  const saveBuild = async (
    name: string,
    conversationId: string,
    components: Component[],
    totalPrice: number,
    recommendation: string
  ) => {
    try {
      const { data, error } = await supabase
        .from('pc_builds')
        .insert({
          name,
          conversation_id: conversationId,
          components,
          total_price: totalPrice,
          recommendation,
          rating: {}
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setBuilds([data, ...builds]);
      return data;
    } catch (err) {
      console.error('Error saving build:', err);
      throw err;
    }
  };

  const deleteBuild = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pc_builds')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setBuilds(builds.filter(build => build.id !== id));
      
      if (selectedBuild?.id === id) {
        setSelectedBuild(null);
      }
    } catch (err) {
      console.error('Error deleting build:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadBuilds();
  }, []);

  return {
    builds,
    loading,
    error,
    loadBuilds,
    saveBuild,
    deleteBuild,
    getBuild,
    selectedBuild,
    setSelectedBuild
  };
}
