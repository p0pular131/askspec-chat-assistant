
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { ArrowRight, Zap, BookOpen, Cpu, InfoIcon } from 'lucide-react';
import { sampleSpecUpgradeData } from '../../data/sampleData';

interface SpecUpgradeRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'low' | 'middle' | 'high' | null;
}

const SpecUpgradeRenderer: React.FC<SpecUpgradeRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'low'
}) => {
  // Try to parse content as JSON, fallback to sample data if parsing fails
  let dataToUse;
  try {
    dataToUse = JSON.parse(content);
    // Validate that parsed data has the expected structure
    if (!dataToUse.upgrades || !Array.isArray(dataToUse.upgrades)) {
      throw new Error('Invalid data structure');
    }
  } catch (error) {
    console.warn('Failed to parse spec upgrade data, using sample data');
    dataToUse = sampleSpecUpgradeData;
  }

  const upgrades = dataToUse.upgrades || [];

  return (
    <div className="spec-upgrade-response space-y-6">
      <div className="mb-2 flex justify-start">
        <Badge 
          variant="outline" 
          className={`${getBadgeClass(expertiseLevel)} flex items-center px-2 py-0.5 text-xs`}
        >
          {getExpertiseLevelIcon(expertiseLevel)}
          <span className="ml-1">{getExpertiseLevelLabel(expertiseLevel)}</span>
        </Badge>
      </div>

      <h2 className="text-2xl font-bold mb-4">스펙 업그레이드 제안</h2>
      
      {/* Upgrade recommendations */}
      <div className="space-y-6">
        {upgrades.map((upgrade: any, index: number) => (
          <Card key={index} className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-500" />
                {upgrade?.category || '카테고리 없음'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">현재 사양</h4>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium">{upgrade?.current?.name || '현재 제품 없음'}</p>
                    <p className="text-sm text-gray-600">{upgrade?.current?.specs || '사양 정보 없음'}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-700">업그레이드 제안</h4>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="font-medium text-green-800">{upgrade?.recommended?.name || '추천 제품 없음'}</p>
                    <p className="text-sm text-green-600">{upgrade?.recommended?.specs || '사양 정보 없음'}</p>
                    <p className="text-sm font-semibold text-green-800 mt-1">
                      +₩{(upgrade?.recommended?.price_difference || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">업그레이드 효과</h4>
                <p className="text-gray-600">{upgrade?.benefits || '효과 정보 없음'}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">우선순위</h4>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    upgrade?.priority === 'high' ? 'bg-red-100 text-red-800' :
                    upgrade?.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {upgrade?.priority === 'high' ? '높음' :
                     upgrade?.priority === 'medium' ? '중간' : '낮음'}
                  </span>
                </div>
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

export default SpecUpgradeRenderer;
