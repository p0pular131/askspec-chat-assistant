
import { supabase } from '../../integrations/supabase/client';
import { ResponseModule, CompatibilityData } from './types';

// Function to get compatibility data from the database
const getCompatibilityData = async (): Promise<CompatibilityData | null> => {
  try {
    // Fetch compatibility data from database
    const { data, error } = await supabase
      .from('demo_compatibility')
      .select('compat')
      .limit(1);
    
    if (error) {
      console.error('Error fetching compatibility data:', error);
      return null;
    }
    
    if (data && data.length > 0 && data[0].compat) {
      // Cast to unknown first, then to CompatibilityData
      const compatData = data[0].compat as unknown as CompatibilityData;
      
      // Validate the data structure
      if (Array.isArray(compatData.components)) {
        return compatData;
      }
    }
    
    // Fallback compatibility data if none in the database or invalid format
    return {
      components: ["CPU", "Motherboard", "GPU", "RAM", "Storage", "PSU"],
      "CPU_Motherboard": false,
      "CPU_Motherboard_Reason": "Socket incompatibility",
      "Motherboard_RAM": true,
      "GPU_PSU": "warning",
      "GPU_PSU_Reason": "Power supply might be insufficient",
      "CPU_RAM": true,
      "Motherboard_Storage": true
    };
  } catch (error) {
    console.error('Error in getCompatibilityData:', error);
    return null;
  }
};

// Extract compatibility links from the new key-value format
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

// Generate HTML for compatibility table
const generateCompatibilityTable = (data: CompatibilityData) => {
  // Extract components and compatibility links
  const components = data.components;
  const links = extractCompatibilityLinks(data);
  
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
  
  // Add each compatibility link to the table
  links.forEach(link => {
    const statusClass = 
      link.status === "true" ? "bg-green-100 text-green-800" : 
      link.status === "warning" ? "bg-yellow-100 text-yellow-800" : 
      "bg-red-100 text-red-800";

    const statusText = 
      link.status === "true" ? "✓ 호환 가능" : 
      link.status === "warning" ? "⚠️ 일부 호환" : 
      "✗ 호환 불가";

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
  const incompatibilities = links.filter(link => link.status !== "true" && link.reason);
  if (incompatibilities.length > 0) {
    tableHtml += `
    <div class="mt-4">
      <h4 class="font-semibold mb-2">호환성 문제 세부 정보:</h4>
      <ul class="list-disc pl-5 space-y-1">
    `;
    
    incompatibilities.forEach(link => {
      const textColorClass = link.status === "warning" ? "text-yellow-700" : "text-red-700";
      tableHtml += `
        <li class="${textColorClass}">
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
