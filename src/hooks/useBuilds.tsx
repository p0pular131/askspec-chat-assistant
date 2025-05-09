
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

// Retry function with exponential backoff
const fetchWithRetry = async <T,>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 1.5
): Promise<T> => {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    console.log(`Retrying after ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return fetchWithRetry(fn, retries - 1, Math.floor(delay * backoffFactor), backoffFactor);
  }
};

export function useBuilds() {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBuild, setSelectedBuild] = useState<Build | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [lastBuildId, setLastBuildId] = useState<string | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

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

  const loadBuilds = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Fetching builds from database...');
      
      // Use the fetchWithRetry function with our Supabase query
      const fetchBuilds = async () => {
        const { data, error } = await supabase
          .from('pc_builds')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return { data, error };
      };
      
      const { data: rawData, error: fetchError } = await fetchWithRetry(fetchBuilds, 3, 1000);
      
      if (fetchError) {
        console.error('Error loading builds:', fetchError);
        setError(`오류가 발생했습니다: ${fetchError.message}`);
        setConsecutiveErrors(prev => prev + 1);
        throw fetchError;
      }
      
      // Reset consecutive errors counter on success
      setConsecutiveErrors(0);
      
      console.log('Raw builds data:', rawData);
      console.log('Loaded builds count:', rawData?.length || 0);
      
      // Transform the raw data to match our Build interface
      const transformedBuilds = (rawData || []).map(convertRawBuild);
      console.log('Transformed builds:', transformedBuilds);
      
      // Check if we have a new build (compare with lastBuildId)
      if (transformedBuilds.length > 0) {
        // If this is our first load, just set the last build ID
        if (lastBuildId === null) {
          setLastBuildId(transformedBuilds[0].id);
        }
        // If we have a new build at the top
        else if (transformedBuilds[0].id !== lastBuildId) {
          // Show a toast notification
          toast({
            title: "새 견적 생성됨",
            description: `"${transformedBuilds[0].name}" 견적이 생성되었습니다.`,
          });
          
          // Update the lastBuildId to the newest build's id
          setLastBuildId(transformedBuilds[0].id);
        }
      }
      
      // Update the last check time
      setLastCheckTime(Date.now());
      setBuilds(transformedBuilds);
      return transformedBuilds;
    } catch (err) {
      console.error('Error loading builds:', err);
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(errorMessage);
      
      // Show an error toast only on the first attempt and if not silent
      if (retryCount === 0 && !silent && consecutiveErrors < 3) {
        toast({
          title: "견적 로딩 실패",
          description: "견적 목록을 불러오는 중 문제가 발생했습니다. 자동으로 다시 시도합니다.",
          variant: "destructive",
        });
      }
      
      return [];
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, [retryCount, lastBuildId, consecutiveErrors]);

  // Silent background check for new builds with smart backoff
  const checkForNewBuilds = useCallback(async () => {
    try {
      await loadBuilds(true); // true = silent mode
    } catch (error) {
      console.error("Background build check failed:", error);
      // Don't need to do anything else as loadBuilds already handles error state
    }
  }, [loadBuilds]);

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
      
      // If not in cache, fetch from database with retry mechanism
      const fetchBuild = async () => {
        const { data, error } = await supabase
          .from('pc_builds')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return { data, error };
      };
      
      const { data: rawBuild, error: fetchError } = await fetchWithRetry(fetchBuild, 3, 1000);
      
      if (fetchError) {
        setError(`견적을 불러오는 중 오류가 발생했습니다: ${fetchError.message}`);
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
        title: "견적 로딩 실패",
        description: "견적 정보를 불러오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
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
      
      const saveBuildWithRetry = async () => {
        const { data, error } = await supabase
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
        return { data, error };
      };
      
      const { data: rawBuild, error } = await fetchWithRetry(saveBuildWithRetry, 3, 1000);
      
      if (error) throw error;
      
      // Convert and add to local state
      const transformedBuild = convertRawBuild(rawBuild);
      setBuilds([transformedBuild, ...builds]);
      return transformedBuild;
    } catch (err) {
      console.error('Error saving build:', err);
      toast({
        title: "견적 저장 실패",
        description: "견적을 저장하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteBuild = async (id: string) => {
    try {
      const deleteBuildWithRetry = async () => {
        const { error } = await supabase
          .from('pc_builds')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        return { error };
      };
      
      const { error } = await fetchWithRetry(deleteBuildWithRetry, 3, 1000);
      
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
        title: "견적 삭제 실패",
        description: "견적을 삭제하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
        variant: "destructive",
      });
      throw err;
    }
  };

  // Effect to load builds when the component mounts and 
  // set up polling to check for new builds frequently
  useEffect(() => {
    // Initial load
    loadBuilds();
    
    // Set up polling to check for new builds with adaptive interval based on consecutive errors
    const pollingInterval = consecutiveErrors > 3 ? 10000 : 5000; // Back off if we're getting consistent errors
    
    const intervalId = setInterval(() => {
      checkForNewBuilds();
    }, pollingInterval);
    
    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [loadBuilds, checkForNewBuilds, consecutiveErrors]);

  // Provide a manual retry function
  const retryLoadBuilds = () => {
    setRetryCount(prev => prev + 1);
    setConsecutiveErrors(0); // Reset consecutive errors on manual retry
    loadBuilds();
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
