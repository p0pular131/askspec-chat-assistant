
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
  price?: number;
  alternatives: {
    name: string;
    specs: string;
    purchase_link: string;
  }[];
}

export interface Build {
  id: number;
  name: string;
  session_id: number;
  components: Component[];
  total_price: number;
  recommendation: string;
  created_at: string;
  rating: {
    valueForMoney?: number;
    noise?: number;
    performance?: number;
    [key: string]: number | undefined;
  };
}

// A type for the raw build data from the database
interface RawBuild {
  id: number;
  name?: string;
  session_id?: number;
  metrics_score_json: Json;
  total_price: number;
  purpose: string;
  compatibility: boolean;
  compatibility_json: Json;
  overall_reason: string;
  created_at: string;
  user_id: number | null;
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
  const [lastBuildId, setLastBuildId] = useState<number | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState(Date.now());
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);

  // Function to convert raw build data to our Build interface
  const convertRawBuild = (rawBuild: RawBuild): Build => {
    // Parse the components from the metrics_score_json
    const metricsData = rawBuild.metrics_score_json as any;
    
    // Creating component data structure from metrics_score_json
    const componentsArray: Component[] = [];
    
    // Extract components from the metrics data - this is a simplified conversion
    // In a real implementation, you would need to map the structure properly
    const componentTypes = ['CPU', 'GPU', 'RAM', 'Storage', 'Motherboard', 'Case', 'PSU', 'Cooler'];
    
    componentTypes.forEach(type => {
      if (metricsData && metricsData[type.toLowerCase()]) {
        componentsArray.push({
          name: `${type} Component`,
          type: type,
          image: '',
          specs: JSON.stringify(metricsData[type.toLowerCase()]),
          reason: 'Based on performance metrics',
          purchase_link: '',
          alternatives: []
        });
      }
    });
    
    // Create ratings data from compatibility_json
    const ratingData: Build['rating'] = {};
    if (rawBuild.compatibility_json) {
      const compatData = rawBuild.compatibility_json as any;
      if (compatData.valueForMoney) ratingData.valueForMoney = compatData.valueForMoney;
      if (compatData.noise) ratingData.noise = compatData.noise;
      if (compatData.performance) ratingData.performance = compatData.performance;
    }
    
    return {
      id: rawBuild.id,
      name: rawBuild.purpose || 'Unnamed Build',
      session_id: rawBuild.session_id || 0,
      components: componentsArray,
      total_price: rawBuild.total_price || 0,
      recommendation: rawBuild.overall_reason || 'Custom PC Build',
      created_at: rawBuild.created_at,
      rating: ratingData
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
          .from('estimates')
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
      
      const buildId = parseInt(id);
      if (isNaN(buildId)) {
        throw new Error('Invalid build ID format');
      }
      
      // Check if the build is already in our local state
      const cachedBuild = builds.find(build => build.id === buildId);
      if (cachedBuild) {
        console.log("Using cached build with rating:", cachedBuild.rating);
        setSelectedBuild(cachedBuild);
        setLoading(false);
        return cachedBuild;
      }
      
      // If not in cache, fetch from database with retry mechanism
      const fetchBuild = async () => {
        const { data, error } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', buildId)
          .single();
          
        if (error) throw error;
        return { data, error };
      };
      
      const { data: rawBuild, error: fetchError } = await fetchWithRetry(fetchBuild, 3, 1000);
      
      if (fetchError) {
        setError(`견적을 불러오는 중 오류가 발생했습니다: ${fetchError.message}`);
        throw fetchError;
      }
      
      console.log("Raw build from database:", rawBuild);
      
      // Add the missing fields to the raw build
      const completeRawBuild: RawBuild = {
        ...rawBuild,
        name: rawBuild.purpose || 'Unnamed Build',
        session_id: 0 // Default value since it's missing
      };
      
      const transformedBuild = convertRawBuild(completeRawBuild);
      console.log("Transformed build with rating:", transformedBuild.rating);
      
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
    sessionId: number,
    components: Component[],
    totalPrice: number,
    recommendation: string
  ) => {
    try {
      // Get the next available ID
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('estimates')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (maxIdError) throw maxIdError;
      
      const nextId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id + 1 : 1;
      
      // Convert components to metrics_score_json format
      const metricsScoreJson: any = {};
      components.forEach(comp => {
        const lowerType = comp.type.toLowerCase();
        metricsScoreJson[lowerType] = {
          name: comp.name,
          specs: comp.specs,
          price: comp.price || 0
        };
      });
      
      const saveBuildWithRetry = async () => {
        const { data, error } = await supabase
          .from('estimates')
          .insert({
            id: nextId,
            metrics_score_json: metricsScoreJson,
            total_price: totalPrice,
            purpose: name,
            compatibility: true,
            compatibility_json: { valueForMoney: 5, noise: 3, performance: 4 },
            overall_reason: recommendation
          })
          .select()
          .single();
          
        if (error) throw error;
        return { data, error };
      };
      
      const { data: rawBuild, error } = await fetchWithRetry(saveBuildWithRetry, 3, 1000);
      
      if (error) throw error;
      
      // Add the missing fields to the raw build
      const completeRawBuild: RawBuild = {
        ...rawBuild,
        name: name,
        session_id: sessionId
      };
      
      // Convert and add to local state
      const transformedBuild = convertRawBuild(completeRawBuild);
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
      const buildId = parseInt(id);
      if (isNaN(buildId)) {
        throw new Error('Invalid build ID format');
      }
      
      const deleteBuildWithRetry = async () => {
        const { error } = await supabase
          .from('estimates')
          .delete()
          .eq('id', buildId);
          
        if (error) throw error;
        return { error };
      };
      
      const { error } = await fetchWithRetry(deleteBuildWithRetry, 3, 1000);
      
      if (error) throw error;
      
      // Update local state
      setBuilds(builds.filter(build => build.id !== buildId));
      
      if (selectedBuild?.id === buildId) {
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
