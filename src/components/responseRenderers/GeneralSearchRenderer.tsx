
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface GeneralSearchRendererProps {
  content: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
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

const GeneralSearchRenderer: React.FC<GeneralSearchRendererProps> = ({ 
  content, 
  expertiseLevel = 'beginner' 
}) => {
  const levelColors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    expert: 'bg-red-100 text-red-700'
  };

  const levelLabels = {
    beginner: '초보자',
    intermediate: '중급자',
    expert: '전문가'
  };

  return (
    <div className="general-search-response space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Badge className={levelColors[expertiseLevel]}>
          {levelLabels[expertiseLevel]} 수준
        </Badge>
      </div>
      
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <div className="mb-4 last:mb-0">
              {parseBoldText(content)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSearchRenderer;
