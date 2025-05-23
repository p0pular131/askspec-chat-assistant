
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star } from 'lucide-react';
import { sampleBuildEvaluationData } from '../../data/sampleData';

interface BuildEvaluationRendererProps {
  content: string;
  evaluationData?: typeof sampleBuildEvaluationData;
}

// Helper function to convert category keys to Korean display names
const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    "price_performance": "가격 대비 성능",
    "performance": "절대 성능",
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

const BuildEvaluationRenderer: React.FC<BuildEvaluationRendererProps> = ({ content, evaluationData = sampleBuildEvaluationData }) => {
  // Get average score for title display
  const averageScore = evaluationData.average_score?.score || 0;
  
  // Extract categories for rendering (exclude average_score)
  // Reorder to put "performance" before "price_performance"
  const categoryOrder = ["performance", "price_performance", "expandability", "noise"];
  const categories = categoryOrder.filter(cat => Object.keys(evaluationData).includes(cat));

  return (
    <div className="build-evaluation-response space-y-6">
      <h2 className="text-2xl font-bold mb-4">
        견적 평가 결과 {averageScore > 0 && <span className="text-blue-600">(평균 점수: {averageScore}점)</span>}
      </h2>
      
      {/* Main evaluation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const categoryData = evaluationData[category as keyof typeof evaluationData];
          // Ensure the category data has a score property
          const item = categoryData && typeof categoryData === 'object' && 'score' in categoryData
            ? categoryData as { score: number; comment: string }
            : { score: 0, comment: '정보 없음' };
          
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
                <p className="mt-3 text-sm text-gray-600">{item.comment}</p>
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
    </div>
  );
};

export default BuildEvaluationRenderer;
