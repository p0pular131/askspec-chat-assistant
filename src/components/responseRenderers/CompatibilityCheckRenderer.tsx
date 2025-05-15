
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, AlertTriangle, X } from 'lucide-react';

interface CompatibilityData {
  components: string[];
  links: Array<{
    source: string;
    target: string;
    status: string;
    reason?: string;
  }>;
}

interface CompatibilityCheckRendererProps {
  content: string;
  compatibilityData?: CompatibilityData;
}

const CompatibilityCheckRenderer: React.FC<CompatibilityCheckRendererProps> = ({ content, compatibilityData }) => {
  if (!compatibilityData) {
    return (
      <div className="compatibility-check-response">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  }

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
            {compatibilityData.links.map((link, i) => (
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
          {compatibilityData.links
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
