
import { ResponseModule } from './types';
import { samplePartRecommendations } from '../../data/sampleData';

// Generate HTML table for part recommendations
const generatePartsTable = (parts: typeof samplePartRecommendations) => {
  return `
  <div class="part-recommendations">
    <h3>추천 부품 목록</h3>
    <table class="w-full border-collapse">
      <thead>
        <tr>
          <th class="px-2 py-1 border">이미지</th>
          <th class="px-2 py-1 border">부품명</th>
          <th class="px-2 py-1 border">스펙</th>
          <th class="px-2 py-1 border">가격</th>
          <th class="px-2 py-1 border">추천 이유</th>
        </tr>
      </thead>
      <tbody>
        ${parts.map(part => `
          <tr>
            <td class="px-2 py-1 border text-center"><img src="${part.image}" alt="${part.name}" class="inline-block w-12 h-12" /></td>
            <td class="px-2 py-1 border"><a href="${part.link}" target="_blank" class="text-blue-600 hover:underline">${part.name}</a></td>
            <td class="px-2 py-1 border">${part.specs}</td>
            <td class="px-2 py-1 border">${part.price}</td>
            <td class="px-2 py-1 border">${part.reason}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>`;
};

export const partRecommendationModule: ResponseModule = {
  name: 'partRecommendation',
  moduleType: '부품 추천',
  process: async () => {
    // Return fixed response with parts table
    return `
    # 부품 추천

    요청하신 부품 추천 정보입니다. 아래 표에서 각 부품의 상세 정보를 확인하세요.
    
    ${generatePartsTable(samplePartRecommendations)}
    
    추가 문의사항이나 다른 부품에 대한 정보가 필요하시면 질문해주세요.
    `;
  }
};
