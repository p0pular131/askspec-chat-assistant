
import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/ui/use-toast';
import { useEstimates } from './useEstimates';

export function useBuildActions() {
  const [isGeneratingBuilds, setIsGeneratingBuilds] = useState(false);
  const [lastBuildCount, setLastBuildCount] = useState(0);
  const [autoSwitchDisabled, setAutoSwitchDisabled] = useState(false);
  
  const navigate = useNavigate();
  
  const { 
    estimates,
    fetchEstimates,
    deleteEstimate: deleteEstimateAPI,
  } = useEstimates();

  const handleDeleteBuild = useCallback(async (buildId: string) => {
    try {
      const result = await deleteEstimateAPI(buildId);
      return result;
    } catch (error) {
      toast({
        title: "오류",
        description: "견적 삭제에 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }
  }, [deleteEstimateAPI]);

  const handleViewBuild = useCallback((buildId: string) => {
    navigate(`/build/${buildId}`);
  }, [navigate]);

  const checkForNewBuilds = useCallback((currentBuilds: any[]) => {
    // If this is the first load, just save the count
    if (lastBuildCount === 0 && currentBuilds.length > 0) {
      setLastBuildCount(currentBuilds.length);
      return false;
    }
    
    // Detect new builds by comparing the current count with the previous count
    const hasNewBuilds = currentBuilds.length > lastBuildCount;
    
    // Update the last build count
    setLastBuildCount(currentBuilds.length);
    
    return hasNewBuilds;
  }, [lastBuildCount]);

  const disableAutoSwitch = useCallback(() => {
    setAutoSwitchDisabled(true);
    setTimeout(() => setAutoSwitchDisabled(false), 10000); // Re-enable after 10 seconds
  }, []);

  return {
    builds: estimates,
    isGeneratingBuilds,
    setIsGeneratingBuilds,
    autoSwitchDisabled,
    handleDeleteBuild,
    handleViewBuild,
    loadBuilds: fetchEstimates,
    checkForNewBuilds,
    disableAutoSwitch
  };
}
