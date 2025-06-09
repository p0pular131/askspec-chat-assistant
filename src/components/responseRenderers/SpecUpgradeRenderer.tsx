
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import ReactMarkdown from 'react-markdown';

interface SpecUpgradeRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: "low" | "middle" | "high";
  estimateId?: string | null; // 견적 ID 추가
}

const SpecUpgradeRenderer: React.FC<SpecUpgradeRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = "low",
  estimateId = null // 견적 ID 받기
}) => {
  // Try to parse JSON content
  let upgradeData;
  try {
    upgradeData = JSON.parse(content);
  } catch (error) {
    // If not JSON, treat as plain text
    return (
      <Card>
        <CardHeader>
          <CardTitle>스펙 업그레이드 추천</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactMarkdown>{content}</ReactMarkdown>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>스펙 업그레이드 추천</CardTitle>
      </CardHeader>
      <CardContent>
        <ReactMarkdown>{upgradeData.content || content}</ReactMarkdown>
        {estimateId && (
          <div className="mt-4 text-sm text-muted-foreground">
            견적 ID: {estimateId}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SpecUpgradeRenderer;
