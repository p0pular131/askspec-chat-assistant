
import { supabase, fetchCompatibilityData } from '../../integrations/supabase/client';
import { ResponseModule, CompatibilityData } from './types';

// Function to get compatibility data from the database
const getCompatibilityData = async (): Promise<CompatibilityData | null> => {
  try {
    // Use the fetchCompatibilityData function from the client
    const compatData = await fetchCompatibilityData();
    return compatData;
  } catch (error) {
    console.error('Error in getCompatibilityData:', error);
    return null;
  }
};

// Generate HTML for compatibility table (legacy, for backward compatibility)
const generateCompatibilityTable = (data: CompatibilityData) => {
  // Extract components
  const components = data.components || [];
  
  let tableHtml = `
  <div class="compatibility-check">
    <h3>부품 호환성 검사 결과</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="px-2 py-1 border">부품 1</th>
          <th class="px-2 py-1 border">호환성</th>
          <th class="px-2 py-1 border">부품 2</th>
        </tr>
      </thead>
      <tbody>
  `;
  
  // Process all keys to find compatibility relationships
  const links: Array<{source: string, target: string, status: boolean, reason?: string}> = [];
  
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
      
      // Skip if not a boolean value
      const status = data[key];
      if (typeof status !== 'boolean') {
        return;
      }
      
      // Check if there's a corresponding reason
      const reasonKey = `${key}_Reason`;
      const reason = data[reasonKey];
      
      links.push({
        source,
        target,
        status,
        reason: reason || undefined
      });
    }
  });
  
  // Add each compatibility link to the table
  links.forEach(link => {
    const statusClass = link.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
    const statusText = link.status ? "✓ 호환 가능" : "✗ 호환 불가";

    tableHtml += `
      <tr>
        <td class="px-2 py-1 border font-medium">${link.source}</td>
        <td class="px-2 py-1 border">
          <span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td class="px-2 py-1 border font-medium">${link.target}</td>
      </tr>
    `;
  });
  
  tableHtml += `
      </tbody>
    </table>
  `;

  // Add incompatibility reasons if any exist
  const incompatibilities = links.filter(link => !link.status && link.reason);
  if (incompatibilities.length > 0) {
    tableHtml += `
    <div class="mt-4">
      <h4 class="font-semibold mb-2">호환성 문제 세부 정보:</h4>
      <ul class="list-disc pl-5 space-y-1">
    `;
    
    incompatibilities.forEach(link => {
      tableHtml += `
        <li class="text-red-700">
          <span class="font-medium">${link.source} ↔ ${link.target}</span>: ${link.reason}
        </li>
      `;
    });
    
    tableHtml += `
      </ul>
    </div>
    `;
  }
  
  tableHtml += `</div>`;
  return tableHtml;
};

export const compatibilityCheckModule: ResponseModule = {
  name: 'compatibilityCheck',
  moduleType: '호환성 검사',
  process: async () => {
    try {
      const compatData = await getCompatibilityData();
      
      if (!compatData) {
        return "호환성 데이터를 가져오는 중 오류가 발생했습니다. 나중에 다시 시도해주세요.";
      }
      
      // Return only the compatibility table with reasons, no additional text
      return `
      # 호환성 검사 결과
      
      ${generateCompatibilityTable(compatData)}
      `;
    } catch (error) {
      console.error('Error in compatibility check module:', error);
      return `호환성 검사 중 오류가 발생했습니다: ${error instanceof Error ? error.message : '알 수 없는 오류'}`;
    }
  }
};
