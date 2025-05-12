import React, { useState, useCallback, memo } from 'react';
import { Build } from '../hooks/useBuilds';
import { toast } from '../components/ui/use-toast';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface BuildsListProps {
  builds: Build[];
  loading: boolean;
  error: string | null;
  onViewBuild: (buildId: string) => void;
  onDelete: (buildId: string) => void;
  onRefresh?: () => void;
}

const BuildsList: React.FC<BuildsListProps> = ({
  builds,
  loading,
  error,
  onViewBuild,
  onDelete,
  onRefresh
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buildToDelete, setBuildToDelete] = useState<string | null>(null);

  const handleDelete = useCallback((e: React.MouseEvent, buildId: number | string) => {
    e.stopPropagation();
    setBuildToDelete(String(buildId));
    setDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (buildToDelete) {
      onDelete(buildToDelete);
      setDialogOpen(false);
      setBuildToDelete(null);
    }
  }, [buildToDelete, onDelete]);

  const cancelDelete = useCallback(() => {
    setBuildToDelete(null);
    setDialogOpen(false);
  }, []);

  const renderContent = useCallback(() => {
    if (error) {
      return (
        <div className="p-4 rounded-md bg-red-50">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">데이터 로딩 실패</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>견적 목록을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
                <p className="mt-1 text-xs text-red-600">{error}</p>
                {onRefresh && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2" 
                    onClick={onRefresh}
                  >
                    다시 시도
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (loading) {
      return <div className="p-2 text-sm text-center">로딩 중...</div>;
    }
    
    if (builds.length === 0) {
      return (
        <div className="p-2 text-sm text-center text-gray-500">
          <p>저장된 견적이 없습니다.</p>
          <p className="text-xs mt-1 text-gray-400">
            대화창에서 견적 요청을 하면 이곳에 표시됩니다.
          </p>
        </div>
      );
    }
    
    return builds.map((build) => (
      <div key={build.id} className="flex items-center gap-2">
        <button
          className="p-2 w-full text-sm text-left rounded text-neutral-700 hover:bg-neutral-100"
          onClick={() => onViewBuild(String(build.id))}
        >
          <div className="flex justify-between">
            <span>{build.name}</span>
            <span className="text-xs text-gray-500">
              {new Date(build.created_at).toLocaleDateString()}
            </span>
          </div>
          {build.total_price > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              예상 가격: ₩{build.total_price.toLocaleString()}원
            </div>
          )}
        </button>
        <button
          onClick={(e) => handleDelete(e, String(build.id))}
          className="p-1 text-red-500 rounded hover:bg-red-50"
          aria-label="Delete build"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    ));
  }, [builds, error, loading, onRefresh, handleDelete, onViewBuild]);

  return (
    <div className="flex flex-col gap-2">
      <div className="pl-2 mb-2">
        <span className="text-xs text-stone-500">견적 목록</span>
      </div>
      
      {renderContent()}

      {/* Confirmation Dialog */}
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말로 이 견적을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없으며 견적과 관련된 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default React.memo(BuildsList);
