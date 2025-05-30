
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Star, ExternalLink, BookOpen, Cpu, InfoIcon } from 'lucide-react';
import { samplePartRecommendationData } from '../../data/sampleData';

interface PartRecommendationRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'low' | 'middle' | 'high' | null;
}

// Type-safe property access helper
const getProperty = (obj: any, property: string, defaultValue: any = '') => {
  return obj && typeof obj === 'object' && property in obj ? obj[property] : defaultValue;
};

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
    dataToUse = samplePartRecommendationData;
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

      <h2 className="text-2xl font-bold mb-4">부품 추천 결과</h2>
      
      {/* Part recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((item: any, index: number) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  {getProperty(item, 'image_url') && (
                    <img 
                      src={getProperty(item, 'image_url')}
                      alt={getProperty(item, 'name')}
                      className="w-full h-48 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <CardTitle className="text-lg">
                    {getProperty(item, 'name', '제품명 없음')}
                  </CardTitle>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold text-blue-600">
                      ₩{getProperty(item, 'price', 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">주요 사양</h4>
                  <div className="text-sm text-gray-600">
                    {getProperty(item, 'specs') ? (
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(getProperty(item, 'specs', {})).map(([key, value]) => (
                          <li key={key}>{key}: {String(value)}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>사양 정보 없음</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-1">추천 이유</h4>
                  <p className="text-sm text-gray-600">
                    {getProperty(item, 'reason', '추천 이유 없음')}
                  </p>
                </div>
                
                {getProperty(item, 'link') && (
                  <a 
                    href={getProperty(item, 'link')}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    구매 링크
                  </a>
                )}
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
