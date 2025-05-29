
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, X, AlertTriangle, ArrowRight, Loader2 } from 'lucide-react';
import { CompatibilityData } from '../../modules/responseModules/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { callCompatibilityCheckAPI } from '../../services/apiService';
import { CompatibilityCheckResponse } from '../../types/apiTypes';
import { sampleCompatibilityData } from '../../data/sampleData';

interface CompatibilityCheckRendererProps {
  content: string;
  sessionId?: string;
  expertiseLevel?: 'beginner' | 'intermediate' | 'expert';
  compatibilityData?: CompatibilityData;
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

// Helper function to extract compatibility links from the data format
const extractCompatibilityLinks = (data: CompatibilityData) => {
  const components = data.components || [];
  const links: Array<{
    source: string;
    target: string;
    status: boolean;
    reason?: string;
  }> = [];
  
  // Process all keys to find compatibility relationships
  Object.keys(data).forEach(key => {
    // Skip the 'components' key and any keys ending with '_Reason' or null values
    if (key === 'components' || key.endsWith('_Reason') || data[key] === null) {
      return;
    }
    
    // Check if this is a component relationship key (contains underscore)
    const parts = key.split('_');
    if (parts.length === 2) {
      const source = parts[0];
      const target = parts[1];
      
      // Skip if not a boolean value (filter out null, undefined, or non-boolean values)
      const status = data[key];
      if (typeof status !== 'boolean') {
        return;
      }
      
      // Check if there's a corresponding reason
      const reasonKey = `${key}_Reason`;
      const reason = data[reasonKey];
      
      // Make sure reason is a string or undefined
      const reasonString = typeof reason === 'string' ? reason : undefined;
      
      links.push({
        source,
        target,
        status,
        reason: reasonString
      });
    }
  });
  
  return links;
};

const CompatibilityCheckRenderer: React.FC<CompatibilityCheckRendererProps> = ({ 
  content, 
  sessionId,
  expertiseLevel = 'beginner',
  compatibilityData 
}) => {
  const [apiData, setApiData] = useState<CompatibilityCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompatibilityCheck = async () => {
      if (!sessionId || !content.trim()) {
        return;
      }

      setLoading(true);
      try {
        const apiResponse = await callCompatibilityCheckAPI({
          sessionId,
          userPrompt: content,
          userLevel: expertiseLevel
        });

        // JSON 파싱 시도
        try {
          const parsed = typeof apiResponse === 'string'
            ? JSON.parse(apiResponse)
            : apiResponse;

          console.log('[✅ 호환성 검사 파싱된 응답]');
          console.dir(parsed, { depth: null });
          
          if (parsed.components) {
            setApiData(parsed);
          }
        } catch (parseError) {
          console.warn('[⚠️ 호환성 검사 응답이 JSON 형식이 아님]');
        }
      } catch (error) {
        console.error('[❌ 호환성 검사 API 호출 실패]:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompatibilityCheck();
  }, [content, sessionId, expertiseLevel]);

  if (loading) {
    return (
      <div className="compatibility-check-response space-y-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>호환성 검사 데이터를 가져오는 중...</span>
        </div>
      </div>
    );
  }

  // Use API data if available, otherwise fall back to provided compatibilityData or sample data
  const dataToUse = apiData || compatibilityData || sampleCompatibilityData;

  // Extract links for the traditional list view
  const links = extractCompatibilityLinks(dataToUse);
  
  // Extract incompatible links for the issues section
  const incompatibleLinks = links.filter(link => !link.status);
  
  // Check for edge case
  const hasEdgeCase = (dataToUse as any).edge_case === true;
  const edgeReason = (dataToUse as any).edge_reason;
  
  // Check for suggestion
  const suggestion = (dataToUse as any).suggestion;
  
  return (
    <div className="compatibility-check-response rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">호환성 검사 결과</h3>
      
      {/* Flat vertical compatibility table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left border">부품 1</th>
              <th className="px-4 py-2 text-center border">호환성</th>
              <th className="px-4 py-2 text-left border">부품 2</th>
            </tr>
          </thead>
          <tbody>
            {links.map((link, i) => {
              const statusClass = link.status ? "bg-green-100" : "bg-red-100";
              const statusIcon = link.status ? 
                <Check className="h-5 w-5 text-green-600" /> : 
                <X className="h-5 w-5 text-red-600" />;
              
              return (
                <tr key={`compatibility-row-${i}`} className="hover:bg-gray-50 group">
                  <td className="px-4 py-2 border font-medium">
                    {parseBoldText(link.source)}
                  </td>
                  <td className={`px-4 py-2 border text-center ${statusClass}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex justify-center w-full">
                          {statusIcon}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">
                            {link.reason ? parseBoldText(link.reason) : (link.status ? "호환됩니다" : "호환되지 않습니다")}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-4 py-2 border font-medium">
                    {parseBoldText(link.target)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Show message if no compatibility data is found */}
      {links.length === 0 && (
        <div className="text-center p-4 text-gray-500">
          호환성 데이터가 없습니다.
        </div>
      )}

      {/* Display incompatible reasons as a list below the table */}
      {incompatibleLinks.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold mb-2">호환성 문제:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {incompatibleLinks.map((link, i) => (
              <li key={`incompatible-${i}`} className="text-red-700">
                <span className="font-medium">
                  {parseBoldText(link.source)}와 {parseBoldText(link.target)}
                </span>: {link.reason ? parseBoldText(link.reason) : '호환되지 않습니다'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Edge Case Warning Card */}
      {hasEdgeCase && edgeReason && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">주의사항</AlertTitle>
          <AlertDescription className="text-yellow-700">
            {parseBoldText(edgeReason)}
          </AlertDescription>
        </Alert>
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

export default CompatibilityCheckRenderer;
