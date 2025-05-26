
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LaTexRenderer from '../LaTexRenderer';

interface GeneralSearchRendererProps {
  content: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
}

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
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p className="mb-4 last:mb-0">
                    <LaTexRenderer>{String(children)}</LaTexRenderer>
                  </p>
                ),
                li: ({ children }) => (
                  <li>
                    <LaTexRenderer>{String(children)}</LaTexRenderer>
                  </li>
                ),
                span: ({ children }) => (
                  <span>
                    <LaTexRenderer>{String(children)}</LaTexRenderer>
                  </span>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralSearchRenderer;
