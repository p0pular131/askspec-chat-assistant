
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface SavedBuildTableProps {
  parts: any[];
  buildType?: 'standard' | 'spec_upgrade';
}

const SavedBuildTable: React.FC<SavedBuildTableProps> = ({ parts, buildType = 'standard' }) => {
  // Transform parts data based on build type
  const transformedParts = React.useMemo(() => {
    if (!parts || parts.length === 0) return [];

    // For spec upgrade builds, parts come as an array with type property
    if (buildType === 'spec_upgrade' || (parts[0] && parts[0].type)) {
      return parts.map(part => ({
        type: part.type || 'Unknown',
        name: part.name || '',
        image: part.image || '',
        specs: part.specs || '',
        reason: part.reason || '',
        price: part.price || 0
      }));
    }

    // For standard builds, parts come as an object with keys as types
    if (typeof parts === 'object' && !Array.isArray(parts)) {
      return Object.entries(parts).map(([type, part]: [string, any]) => ({
        type: type,
        name: part.name || '',
        image: part.image_url || part.image || '',
        specs: part.specs || '',
        reason: part.reason || '',
        price: typeof part.price === 'string' ? 
          parseInt(part.price.replace(/[₩,]/g, '')) : 
          (part.price || 0)
      }));
    }

    return [];
  }, [parts, buildType]);

  if (transformedParts.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        부품 정보가 없습니다.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">이미지</TableHead>
          <TableHead className="w-24">타입</TableHead>
          <TableHead>부품명</TableHead>
          <TableHead className="w-32">가격</TableHead>
          <TableHead>사양</TableHead>
          <TableHead>선택 이유</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transformedParts.map((part, index) => (
          <TableRow key={index}>
            <TableCell>
              {part.image ? (
                <img 
                  src={part.image} 
                  alt={part.name}
                  className="w-12 h-12 object-cover rounded border"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{part.type}</TableCell>
            <TableCell>{part.name}</TableCell>
            <TableCell>
              {part.price > 0 ? `₩${part.price.toLocaleString()}` : '-'}
            </TableCell>
            <TableCell className="max-w-xs truncate" title={part.specs}>
              {part.specs}
            </TableCell>
            <TableCell className="max-w-xs truncate" title={part.reason}>
              {part.reason}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default SavedBuildTable;
