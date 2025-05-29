
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, ArrowRight, Loader2 } from 'lucide-react';
import { callBuildEvaluationAPI } from '../../services/apiService';
import { BuildEvaluationResponse } from '../../types/apiTypes';
import { sampleBuildEvaluationData } from '../../data/sampleData';

interface BuildEvaluationRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
  evaluationData?: typeof sampleBuildEvaluationData;
}

// Helper function to parse markdown-style bold text
const parseBoldText = (text: string): React.ReactNode => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2);
      return <strong key={index}>{boldText}</strong>;
    }
    return part;
  });
};

// Helper function to convert category keys to Korean display names
const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    "performance": "절대 성능",
    "price_performance": "가격 대비 성능",
    "expandability": "확장성",
    "noise": "소음",
    "average_score": "종합 평가"
  };
  return categoryNames[category] || category;
};

// Helper function to get color based on score
const getScoreColor = (score: number): string => {
  if (score >= 90) return 'bg-green-500';
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 70) return 'bg-blue-500';
  if (score >= 60) return 'bg-yellow-500';
  if (score >= 50) return 'bg-orange-500';
  return 'bg-red-500';
};

const BuildEvaluationRenderer: React.FC<BuildEvaluationRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'beginner',
  evaluationData 
}) => {
  const [apiData, setApiData] = useState<BuildEvaluationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBuildEvaluation = async () => {
      if (!sessionId || !content.trim()) {
        return;
      }

      setLoading(true);
      try {
        const apiResponse = await callBuildEvaluationAPI({
          sessionId,
          userPrompt: content,
          userLevel: expertiseLevel
        });

        // JSON 파싱 시도
        try {
          const parsed = typeof apiResponse === 'string'
            ? JSON.parse(apiResponse)
            : apiResponse;

          console.log('[✅ 견적 평가 파싱된 응답]');
          console.dir(parsed, { depth: null });
          
          if (parsed.performance && parsed.average_score) {
            setApiData(parsed);
          }
        } catch (parseError) {
          console.warn('[⚠️ 견적 평가 응답이 JSON 형식이 아님]');
        }
      } catch (error) {
        console.error('[❌ 견적 평가 API 호출 실패]:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBuildEvaluation();
  }, [content, sessionId, expertiseLevel]);

  if (loading) {
    return (
      <div className="build-evaluation-response space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>견적 평가 데이터를 가져오는 중...</span>
        </div>
      </div>
    );
  }

  // Use API data if available, otherwise fall back to provided evaluationData or sample data
  const dataToUse = apiData || evaluationData || sampleBuildEvaluationData;

  // Get average score safely handling different data structures
  const getScoreValue = (scoreData: number | { score: number } | undefined) => {
    if (typeof scoreData === 'object' && scoreData && 'score' in scoreData) {
      return scoreData.score;
    } else if (typeof scoreData === 'number') {
      return scoreData;
    }
    return 0;
  };
  
  const averageScore = getScoreValue(dataToUse.average_score);
  
  // Extract categories for rendering (exclude average_score) in specific order
  const categoryOrder = ["performance", "price_performance", "expandability", "noise"];
  const categories = categoryOrder.filter(cat => Object.keys(dataToUse).includes(cat));

  // Check for suggestion
  const suggestion = (dataToUse as any).suggestion;

  return (
    <div className="build-evaluation-response space-y-6">
      <h2 className="text-2xl font-bold mb-4">
        견적 평가 결과 {averageScore > 0 && <span className="text-blue-600">(평균 점수: {averageScore}점)</span>}
      </h2>
      
      {/* Main evaluation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const item = dataToUse[category as keyof typeof dataToUse] as {
            score: number;
            comment: string;
          };
          
          return (
            <Card key={category} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{getCategoryName(category)}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-lg">{item.score}</span>
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Progress value={item.score} className={`h-2 ${getScoreColor(item.score)}`} />
                <p className="mt-3 text-sm text-gray-600">
                  {parseBoldText(item.comment)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Only render markdown content if present and not empty */}
      {content && content.trim() !== "" && (
        <div className="mt-6">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}

      {/* Suggestion Card */}
      {suggestion && (
        <Card className="mt-6 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-blue-800 dark:text-blue-200 flex items-center gap-2">
              <ArrowRight size={20} />
              다음 단계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              {parseBoldText(suggestion)}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuildEvaluationRenderer;
