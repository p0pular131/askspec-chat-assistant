
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBuilds } from '@/hooks/useBuilds';
import { BuildDetails as BuildDetailsComponent } from '@/components/BuildDetails';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const BuildDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getBuild, selectedBuild, deleteBuild } = useBuilds();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBuild = async () => {
      if (id) {
        try {
          setLoading(true);
          await getBuild(id);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load build details",
            variant: "destructive",
          });
          navigate('/');
        } finally {
          setLoading(false);
        }
      }
    };

    loadBuild();
  }, [id, getBuild, navigate]);

  const handleDelete = async () => {
    if (!id) return;
    
    try {
      await deleteBuild(id);
      toast({
        title: "Success",
        description: "Build deleted successfully",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete build",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading build details...</p>
      </div>
    );
  }

  if (!selectedBuild) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p>Build not found</p>
        <Button onClick={() => navigate('/')} className="mt-4">
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate('/')} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        
        <div>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Build
          </Button>
        </div>
      </div>
      
      <BuildDetailsComponent build={selectedBuild} />
    </div>
  );
};

export default BuildDetailsPage;
