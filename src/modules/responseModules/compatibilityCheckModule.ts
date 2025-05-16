
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
      components: ["CPU", "Motherboard", "GPU", "RAM", "Storage", "PSU", "Cooler"],
      "CPU_Memory": true,
      "CPU_Memory_Reason": "인텔 코어 i5-13600K 프로세서는 DDR5-5600 메모리를 지원합니다. 따라서 SK하이닉스 DDR5-5600 (16GB) 메모리와 호환됩니다.",
      "CPU_Motherboard": false,
      "CPU_Motherboard_Reason": "인텔 코어 i5-13600K 프로세서는 LGA 1700 소켓을 사용하며, ASRock B860M-X 메인보드는 해당 소켓을 지원하지 않습니다. 따라서 두 부품은 호환되지 않습니다.",
      "Memory_Motherboard": true,
      "Memory_Motherboard_Reason": "ASRock B860M-X 메인보드는 DDR5 메모리를 지원하며, SK하이닉스 DDR5-5600 16GB 메모리는 데스크탑용 DDR5 메모리로 호환됩니다.",
      "Motherboard_Case": true,
      "Motherboard_Case_Reason": "NZXT H9 Flow 케이스는 Micro-ATX 폼팩터를 지원하며, ASRock B860M-X 메인보드는 Micro-ATX 폼팩터로 두 부품은 호환됩니다.",
      "Case_PSU": true,
      "Case_PSU_Reason": "NZXT H9 Flow 케이스는 ATX 규격의 파워서플라이를 지원하며, 시소닉 NEW FOCUS V4 GX-750 GOLD는 ATX 규격으로 호환됩니다. 또한, 파워서플라이의 깊이(140mm)는 케이스 내부 공간에 적합합니다.",
      "Case_GPU": true,
      "Case_GPU_Reason": "NZXT H9 Flow 케이스는 최대 435mm 길이의 그래픽카드를 지원하며, ASUS DUAL 지포스 RTX 4070 O12G EVO OC D6X 12GB의 길이는 227.2mm로 호환됩니다.",
      "Cooler_CPU": true,
      "Cooler_CPU_Reason": "NOCTUA NH-U12S는 인텔 코어 i5-13600K와 물리적으로 호환되지만, 고부하 시 온도 관리에 한계가 있을 수 있습니다. 더 나은 냉각 성능을 위해 NH-U14S와 같은 상위 모델을 고려하는 것이 좋습니다.",
      "Cooler_Motherboard": true,
      "Cooler_Motherboard_Reason": "NOCTUA NH-U12S는 LGA1851 소켓을 지원하며, ASRock B860M-X 메인보드는 LGA1851 소켓을 사용하므로 호환됩니다.",
      "EdgeCase": null,
      "Replace": null
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
