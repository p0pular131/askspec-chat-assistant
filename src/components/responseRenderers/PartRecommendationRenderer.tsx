
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { ArrowRight, Zap, BookOpen, Cpu, InfoIcon } from 'lucide-react';
import { samplePartRecommendations } from '../../data/sampleData';

interface PartRecommendationRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'low' | 'middle' | 'high' | null;
}

const PartRecommendationRenderer: React.FC<PartRecommendationRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'low'
}) => {
  // Try to parse content as JSON, fallback to sample data if parsing fails
  let dataToUse;
  try {
    dataToUse = JSON.parse(content);
    // Validate that parsed data has the expected structure
    if (!dataToUse.recommendations || !Array.isArray(dataToUse.recommendations)) {
      throw new Error('Invalid data structure');
    }
  } catch (error) {
    console.warn('Failed to parse part recommendation data, using sample data');
    dataToUse = samplePartRecommendations;
  }

  const recommendations = dataToUse.recommendations || [];

  return (
    <div className="part-recommendation-response space-y-6">
      <div className="mb-2 flex justify-start">
        <Badge 
          variant="outline" 
          className={`${getBadgeClass(expertiseLevel)} flex items-center px-2 py-0.5 text-xs`}
        >
          {getExpertiseLevelIcon(expertiseLevel)}
          <span className="ml-1">{getExpertiseLevelLabel(expertiseLevel)}</span>
        </Badge>
      </div>

      <h2 className="text-2xl font-bold mb-4">부품 추천</h2>
      
      {/* Recommendations */}
      <div className="space-y-6">
        {recommendations.map((rec: any, index: number) => (
          <Card key={index} className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-500" />
                {rec?.category || '카테고리 없음'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {rec?.options?.map((option: any, optionIndex: number) => (
                  <div key={optionIndex} className="space-y-2">
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-800">{option?.name || '제품명 없음'}</p>
                      <p className="text-sm text-blue-600">{option?.specs || '사양 정보 없음'}</p>
                      <p className="text-sm font-semibold text-blue-800 mt-1">
                        ₩{(option?.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || []}
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">추천 이유</h4>
                <p className="text-gray-600">{rec?.reason || '추천 이유 없음'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Helper functions for styling based on expertise level
const getBadgeClass = (level: string | null): string => {
  switch (level) {
    case 'low':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'high':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'middle':
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getExpertiseLevelLabel = (level: string | null): string => {
  switch (level) {
    case 'low':
      return '입문자';
    case 'high':
      return '전문가';
    case 'middle':
      return '중급자';
    default:
      return '선택되지 않음';
  }
};

const getExpertiseLevelIcon = (level: string | null) => {
  switch (level) {
    case 'low':
      return <BookOpen className="h-3 w-3" />;
    case 'high':
      return <Cpu className="h-3 w-3" />;
    case 'middle':
      return <InfoIcon className="h-3 w-3" />;
    default:
      return <InfoIcon className="h-3 w-3" />;
  }
};

export default PartRecommendationRenderer;
