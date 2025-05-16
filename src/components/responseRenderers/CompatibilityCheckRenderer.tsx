
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, AlertTriangle, X } from 'lucide-react';
import { CompatibilityData } from '../../modules/responseModules/types';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '../ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

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
    status: string;
    reason?: string;
  }> = [];
  
  // Process all keys to find compatibility relationships
  Object.keys(data).forEach(key => {
    // Skip the 'components' key and any keys ending with '_Reason'
    if (key === 'components' || key.endsWith('_Reason') || data[key] === null) {
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

// Function to check if a component pair has a compatibility relationship
const findCompatibilityStatus = (source: string, target: string, data: CompatibilityData) => {
  // Check both possible key orderings
  const key1 = `${source}_${target}`;
  const key2 = `${target}_${source}`;
  
  // Return the first key that exists, prioritizing key1
  if (data[key1] !== undefined) {
    return {
      status: data[key1],
      reason: data[`${key1}_Reason`]
    };
  } else if (data[key2] !== undefined) {
    return {
      status: data[key2],
      reason: data[`${key2}_Reason`]
    };
  }
  
  // Return null if no compatibility information exists
  return null;
};

const CompatibilityMatrix: React.FC<{ data: CompatibilityData }> = ({ data }) => {
  const components = data.components || [];
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">부품</TableHead>
            {components.map((component, i) => (
              <TableHead key={`header-${i}`} className="w-[80px]">
                {component}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((rowComponent, rowIndex) => (
            <TableRow key={`row-${rowIndex}`}>
              <TableCell className="font-medium">{rowComponent}</TableCell>
              {components.map((colComponent, colIndex) => {
                // Skip rendering for the same component (diagonal)
                if (rowComponent === colComponent) {
                  return <TableCell key={`cell-${rowIndex}-${colIndex}`} className="text-center bg-gray-50">-</TableCell>;
                }
                
                const compatibility = findCompatibilityStatus(rowComponent, colComponent, data);
                
                // Skip if no compatibility data exists
                if (!compatibility) {
                  return <TableCell key={`cell-${rowIndex}-${colIndex}`} className="text-center text-gray-400">?</TableCell>;
                }
                
                const { status, reason } = compatibility;
                
                const statusIcon = 
                  status === true ? <Check className="h-4 w-4 text-green-600" /> :
                  status === 'warning' ? <AlertTriangle className="h-4 w-4 text-yellow-600" /> :
                  <X className="h-4 w-4 text-red-600" />;
                
                // If there's a reason, make it hoverable/clickable
                if (reason) {
                  return (
                    <TableCell key={`cell-${rowIndex}-${colIndex}`} className="text-center p-0">
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <button className="w-full h-full flex items-center justify-center p-2 hover:bg-gray-100 transition-colors">
                            {statusIcon}
                          </button>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80">
                          <div className="text-sm">
                            <span className="font-medium">{rowComponent} ↔ {colComponent}:</span> {reason}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  );
                }
                
                // Without reason, just show the icon
                return (
                  <TableCell key={`cell-${rowIndex}-${colIndex}`} className="text-center">
                    {statusIcon}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
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
  
  // Find any incompatible or warning combinations
  const problemLinks = links.filter(link => link.status !== 'true' && link.reason);

  return (
    <div className="compatibility-check-response rounded-lg p-4">
      <h3 className="font-semibold mb-3">호환성 검사 결과</h3>
      
      {/* Compatibility Matrix - new view */}
      <div className="mb-6">
        <CompatibilityMatrix data={compatibilityData} />
      </div>
      
      {/* Display reasons for incompatible components only */}
      {problemLinks.length > 0 && (
        <div className="mt-4 text-sm">
          <h4 className="font-semibold mb-2">호환성 문제 세부 정보:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {problemLinks.map((link, i) => (
              <li key={`reason-${i}`} className={link.status === 'warning' ? 'text-yellow-700' : 'text-red-700'}>
                <span className="font-medium">{link.source} ↔ {link.target}</span>: {link.reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CompatibilityCheckRenderer;
