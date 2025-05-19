
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  // Extract categories for rendering (exclude average_score)
  const categories = Object.keys(evaluationData).filter(key => key !== 'average_score');

  return (
    <div className="build-evaluation-response space-y-6">
      <h2 className="text-2xl font-bold mb-4">견적 평가 결과</h2>
      
      {/* Main evaluation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => {
          const item = evaluationData[category as keyof typeof evaluationData] as {
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
                <p className="mt-3 text-sm text-gray-600">{item.comment}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Summary card with average score */}
      <Card className="bg-gray-50 border-t-4 border-blue-500">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>종합 평가</span>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">{evaluationData.average_score}</span>
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress 
            value={evaluationData.average_score} 
            className={`h-3 ${getScoreColor(evaluationData.average_score)}`} 
          />
          <div className="mt-4 text-center">
            <p className="font-medium">
              이 PC 견적은 종합 {evaluationData.average_score}점으로 평가됩니다.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              세부 카테고리 점수를 확인하여 견적의 강점과 약점을 파악하세요.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* If there's any additional markdown content, render it */}
      {content && content.trim() !== "" && (
        <div className="mt-6">
          <Separator className="my-4" />
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default BuildEvaluationRenderer;
