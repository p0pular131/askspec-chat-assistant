import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Check, X } from 'lucide-react';
import { CompatibilityData } from '../../modules/responseModules/types';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CompatibilityCheckRendererProps {
  content: string;
  compatibilityData?: CompatibilityData;
}

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

const CompatibilityCheckRenderer: React.FC<CompatibilityCheckRendererProps> = ({ content, compatibilityData }) => {
  if (!compatibilityData) {
    return (
      <div className="compatibility-check-response">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

  // Extract links for the traditional list view
  const links = extractCompatibilityLinks(compatibilityData);
  
  // Extract incompatible links for the issues section
  const incompatibleLinks = links.filter(link => !link.status);
  
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
                  <td className="px-4 py-2 border font-medium">{link.source}</td>
                  <td className={`px-4 py-2 border text-center ${statusClass}`}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex justify-center w-full">
                          {statusIcon}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs text-sm">{link.reason || (link.status ? "호환됩니다" : "호환되지 않습니다")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </td>
                  <td className="px-4 py-2 border font-medium">{link.target}</td>
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
                <span className="font-medium">{link.source}와 {link.target}</span>: {link.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompatibilityCheckRenderer;
