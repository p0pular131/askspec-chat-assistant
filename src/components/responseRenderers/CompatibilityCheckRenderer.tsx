
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, AlertTriangle, X } from 'lucide-react';
import { CompatibilityData } from '../../modules/responseModules/types';

interface CompatibilityCheckRendererProps {
  content: string;
  compatibilityData?: CompatibilityData;
}

// Helper function to extract compatibility links from the new data format
const extractCompatibilityLinks = (data: CompatibilityData) => {
  const components = data.components;
  const links: Array<{
    source: string;
    target: string;
    status: string;
    reason?: string;
  }> = [];
  
  // Process all keys to find compatibility relationships
  Object.keys(data).forEach(key => {
    // Skip the 'components' key and any keys ending with '_Reason'
    if (key === 'components' || key.endsWith('_Reason')) {
      return;
    }
    
    // Check if this is a component relationship key (contains underscore)
    const parts = key.split('_');
    if (parts.length === 2) {
      const source = parts[0];
      const target = parts[1];
      
      // Skip if the components don't exist in our components list
      if (!components.includes(source) || !components.includes(target)) {
        return;
      }
      
      const status = data[key];
      // Only add valid relationships
      if (status === true || status === false || status === 'warning') {
        const statusString = status === true ? 'true' : 
                            status === false ? 'false' : 'warning';
        
        // Check if there's a corresponding reason
        const reasonKey = `${key}_Reason`;
        const reason = data[reasonKey];
        
        links.push({
          source,
          target,
          status: statusString,
          reason: reason || undefined
        });
      }
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

  // Extract links from compatibility data
  const links = extractCompatibilityLinks(compatibilityData);

  return (
    <div className="compatibility-check-response rounded-lg p-4">
      <h3 className="font-semibold mb-3">호환성 검사 결과</h3>
      
      <div className="my-4 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">부품 1</TableHead>
              <TableHead className="w-[100px]">호환성</TableHead>
              <TableHead className="w-[120px]">부품 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {links.map((link, i) => (
              <TableRow key={`comp-${i}`}>
                <TableCell className="font-medium">{link.source}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    link.status === 'true' 
                      ? 'bg-green-100 text-green-800' 
                      : link.status === 'warning'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {link.status === 'true' && <Check className="mr-1 h-3 w-3" />}
                    {link.status === 'warning' && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {link.status === 'false' && <X className="mr-1 h-3 w-3" />}
                    {link.status === 'true' ? '호환 가능' : 
                     link.status === 'warning' ? '일부 호환' : '호환 불가'}
                  </span>
                </TableCell>
                <TableCell className="font-medium">{link.target}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Display reasons for incompatible components only */}
      <div className="mt-4 text-sm">
        <h4 className="font-semibold mb-2">호환성 문제 세부 정보:</h4>
        <ul className="list-disc pl-5 space-y-1">
          {links
            .filter((link) => link.status !== 'true' && link.reason)
            .map((link, i) => (
              <li key={`reason-${i}`} className={link.status === 'warning' ? 'text-yellow-700' : 'text-red-700'}>
                <span className="font-medium">{link.source} ↔ {link.target}</span>: {link.reason}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CompatibilityCheckRenderer;
