
import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Json } from '../integrations/supabase/types';

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

// A type for the raw build data from the database
interface RawBuild {
  id: string;
  name: string;
  conversation_id: string;
  components: Json;
  total_price: number;
  recommendation: string;
  created_at: string;
  rating: Json;
  user_id: string | null;
}

export function useBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);

  // Function to convert raw build data to our Build interface
  const convertRawBuild = (rawBuild: RawBuild): Build => {
    return {
      id: rawBuild.id,
      name: rawBuild.name,
      conversation_id: rawBuild.conversation_id,
      components: rawBuild.components as Component[], // Type assertion here
      total_price: rawBuild.total_price,
      recommendation: rawBuild.recommendation,
      created_at: rawBuild.created_at
    };
  };

  const loadBuilds = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: rawData, error } = await supabase
        .from('pc_builds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the raw data to match our Build interface
      const transformedBuilds = (rawData || []).map(convertRawBuild);
      setBuilds(transformedBuilds);
    } catch (err) {
      console.error('Error loading builds:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getBuild = async (id: string) => {
    try {
      const { data: rawBuild, error } = await supabase
        .from('pc_builds')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      const transformedBuild = convertRawBuild(rawBuild);
      setSelectedBuild(transformedBuild);
      return transformedBuild;
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
      const { data: rawBuild, error } = await supabase
        .from('pc_builds')
        .insert({
          name,
          conversation_id: conversationId,
          components: components as unknown as Json, // Type assertion for Supabase
          total_price: totalPrice,
          recommendation,
          rating: {}
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Convert and add to local state
      const transformedBuild = convertRawBuild(rawBuild);
      setBuilds([transformedBuild, ...builds]);
      return transformedBuild;
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
