
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { BookOpen, Cpu, InfoIcon, Loader2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { callGeneralSearchAPI } from '../../services/apiService';
import { GeneralSearchResponse } from '../../types/apiTypes';

interface GeneralSearchRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert' | null;
}

const GeneralSearchRenderer: React.FC<GeneralSearchRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'beginner' 
}) => {
  const [response, setResponse] = useState<string>(content);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResponse = async () => {
      // sessionId가 없거나 content가 이미 API 응답인 경우 API 호출 건너뛰기
      if (!sessionId || !content.trim()) {
        return;
      }

      setLoading(true);
      try {
        const apiResponse = await callGeneralSearchAPI({
          sessionId,
          userPrompt: content,
          userLevel: expertiseLevel as 'beginner' | 'intermediate' | 'expert'
        });

        // JSON 파싱 시도
        try {
          const parsed = typeof apiResponse === 'string'
            ? JSON.parse(apiResponse)
            : apiResponse;

          console.log('[✅ 범용 검색 파싱된 응답]');
          console.dir(parsed, { depth: null });
          
          // 파싱된 응답에서 content 추출
          const responseContent = parsed.content || parsed.response || apiResponse;
          setResponse(responseContent);
        } catch (parseError) {
          console.warn('[⚠️ 범용 검색 응답이 JSON 형식이 아님]');
          setResponse(apiResponse);
        }
      } catch (error) {
        console.error('[❌ 범용 검색 API 호출 실패]:', error);
        setResponse('서버 응답 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [content, sessionId, expertiseLevel]);

  if (loading) {
    return (
      <div className="general-search-response relative">
        <div className="mb-2 flex justify-start">
          <Badge variant="outline" className="flex items-center px-2 py-0.5 text-xs">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="ml-1">응답 생성 중...</span>
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="general-search-response relative">
      <div className="mb-2 flex justify-start">
        <Badge 
          variant="outline" 
          className={`${getBadgeClass(expertiseLevel)} flex items-center px-2 py-0.5 text-xs`}
        >
          {getExpertiseLevelIcon(expertiseLevel)}
          <span className="ml-1">{getExpertiseLevelLabel(expertiseLevel)}</span>
        </Badge>
      </div>

      <div className="prose prose-zinc prose-sm max-w-none">
        <ReactMarkdown>{response}</ReactMarkdown>
      </div>
    </div>
  );
};

// Helper functions for styling based on expertise level
const getBadgeClass = (level: string | null): string => {
  switch (level) {
    case 'beginner':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'expert':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'intermediate':
      return 'bg-green-100 text-green-700 border-green-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getExpertiseLevelLabel = (level: string | null): string => {
  switch (level) {
    case 'beginner':
      return '입문자';
    case 'expert':
      return '전문가';
    case 'intermediate':
      return '중급자';
    default:
      return '선택되지 않음';
  }
};

const getExpertiseLevelIcon = (level: string | null) => {
  switch (level) {
    case 'beginner':
      return <BookOpen className="h-3 w-3" />;
    case 'expert':
      return <Cpu className="h-3 w-3" />;
    case 'intermediate':
      return <InfoIcon className="h-3 w-3" />;
    default:
      return <InfoIcon className="h-3 w-3" />;
  }
};

export default GeneralSearchRenderer;
