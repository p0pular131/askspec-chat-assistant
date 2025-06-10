
import { Build, Component } from '../hooks/useBuilds';
import { EstimateItem } from '../hooks/useEstimates';

export function convertEstimateToBuil(estimate: EstimateItem): Build {
  console.log('[🔄 견적 변환] 원본 견적 데이터:', estimate);
  
  // Convert parts from estimate to components array
  const components: Component[] = [];
  
  if (estimate.parts) {
    // Handle both object and array formats for parts
    const partsData = Array.isArray(estimate.parts) ? estimate.parts : Object.entries(estimate.parts);
    
    if (Array.isArray(estimate.parts)) {
      // If parts is already an array
      estimate.parts.forEach((part, index) => {
        const priceMatch = part.price?.match(/[\d,]+/);
        const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
        
        const component: Component = {
          name: part.name || `Component ${index + 1}`,
          type: part.type || 'Unknown',
          image: part.image_url || part.image || '',
          specs: part.specs || '',
          reason: part.reason || '',
          purchase_link: part.link || '',
          price: price,
          alternatives: []
        };
        
        components.push(component);
      });
    } else {
      // If parts is an object with category keys
      Object.entries(estimate.parts).forEach(([category, part]) => {
        const priceMatch = part.price?.match(/[\d,]+/);
        const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
        
        const component: Component = {
          name: part.name,
          type: category,
          image: part.image_url || part.image || '',
          specs: part.specs || '',
          reason: part.reason || '',
          purchase_link: part.link || '',
          price: price,
          alternatives: []
        };
        
        components.push(component);
      });
    }
  }
  
  // Extract total price as number
  const totalPriceMatch = estimate.total_price?.match(/[\d,]+/);
  const totalPrice = totalPriceMatch ? parseInt(totalPriceMatch[0].replace(/,/g, '')) : 0;
  
  // Create Build object compatible with BuildDetails component
  const build: Build = {
    id: parseInt(estimate.id) || Date.now(),
    name: estimate.title || '견적 상세',
    session_id: 0,
    components: components,
    total_price: totalPrice,
    recommendation: estimate.total_reason || estimate.suggestion || '견적 추천 설명이 없습니다.',
    created_at: estimate.created_at || new Date().toISOString(),
    rating: {
      // 실제 평가 데이터가 있다면 사용, 없으면 기본값
      performance: estimate.rating?.performance || 8,
      price_performance: estimate.rating?.price_performance || 7,
      expandability: estimate.rating?.expandability || 6,
      noise: estimate.rating?.noise || 5
    }
  };
  
  console.log('[✅ 견적 변환] 변환된 Build 데이터:', build);
  return build;
}
