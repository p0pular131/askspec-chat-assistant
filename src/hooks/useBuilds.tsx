
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Json } from '../integrations/supabase/types';
import { toast } from '../components/ui/use-toast';

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
  const [retryCount, setRetryCount] = useState(0);

  // Function to convert raw build data to our Build interface
  const convertRawBuild = (rawBuild: RawBuild): Build => {
    // Parse the components from JSON to Component[] with proper type checking
    const componentsArray = Array.isArray(rawBuild.components) 
      ? rawBuild.components.map((comp: any): Component => ({
          name: comp.name || '',
          type: comp.type || '',
          image: comp.image || '',
          specs: comp.specs || '',
          reason: comp.reason || '',
          purchase_link: comp.purchase_link || '',
          alternatives: Array.isArray(comp.alternatives) 
            ? comp.alternatives.map((alt: any) => ({
                name: alt.name || '',
                specs: alt.specs || '',
                purchase_link: alt.purchase_link || ''
              }))
            : []
        }))
      : [];
    
    return {
      id: rawBuild.id,
      name: rawBuild.name,
      conversation_id: rawBuild.conversation_id,
      components: componentsArray,
      total_price: rawBuild.total_price,
      recommendation: rawBuild.recommendation,
      created_at: rawBuild.created_at
    };
  };

  const loadBuilds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching builds from database...');
      const { data: rawData, error: fetchError } = await supabase
        .from('pc_builds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error loading builds:', fetchError);
        setError(`오류가 발생했습니다: ${fetchError.message}`);
        throw fetchError;
      }
      
      console.log('Raw builds data:', rawData);
      console.log('Loaded builds count:', rawData?.length || 0);
      
      // Transform the raw data to match our Build interface
      const transformedBuilds = (rawData || []).map(convertRawBuild);
      console.log('Transformed builds:', transformedBuilds);
      setBuilds(transformedBuilds);
      return transformedBuilds;
    } catch (err) {
      console.error('Error loading builds:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      
      // Show an error toast only on the first attempt
      if (retryCount === 0) {
        toast({
          title: "빌드 로딩 실패",
          description: "PC 빌드 목록을 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const getBuild = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if the build is already in our local state
      const cachedBuild = builds.find(build => build.id === id);
      if (cachedBuild) {
        setSelectedBuild(cachedBuild);
        setLoading(false);
        return cachedBuild;
      }
      
      // If not in cache, fetch from database
      const { data: rawBuild, error: fetchError } = await supabase
        .from('pc_builds')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        setError(`빌드를 불러오는 중 오류가 발생했습니다: ${fetchError.message}`);
        throw fetchError;
      }
      
      const transformedBuild = convertRawBuild(rawBuild);
      setSelectedBuild(transformedBuild);
      return transformedBuild;
    } catch (err) {
      console.error('Error getting build:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      toast({
        title: "빌드 로딩 실패",
        description: "PC 빌드 정보를 불러오는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
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
      // Prepare components for saving to database
      const componentsJson = components as unknown as Json;
      
      const { data: rawBuild, error } = await supabase
        .from('pc_builds')
        .insert({
          name,
          conversation_id: conversationId,
          components: componentsJson,
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
      toast({
        title: "빌드 저장 실패",
        description: "PC 빌드를 저장하는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
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
      
      return true;
    } catch (err) {
      console.error('Error deleting build:', err);
      toast({
        title: "빌드 삭제 실패",
        description: "PC 빌드를 삭제하는 중 문제가 발생했습니다.",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Effect to load builds when the component mounts
  useEffect(() => {
    loadBuilds();
  }, [loadBuilds]);

  // Provide a manual retry function
  const retryLoadBuilds = () => {
    setRetryCount(prev => prev + 1);
  };

  return {
    builds,
    loading,
    error,
    loadBuilds,
    retryLoadBuilds,
    saveBuild,
    deleteBuild,
    getBuild,
    selectedBuild,
    setSelectedBuild
  };
}
