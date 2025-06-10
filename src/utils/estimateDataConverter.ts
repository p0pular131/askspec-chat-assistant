
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
        // Safe price extraction with proper type checking
        let price = 0;
        if (part.price) {
          if (typeof part.price === 'string') {
            const priceMatch = part.price.match(/[\d,]+/);
            price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
          } else if (typeof part.price === 'number') {
            price = part.price;
          }
        }
        
        const component: Component = {
          name: part.name || `Component ${index + 1}`,
          type: part.type || 'Unknown',
          image: part.image_url || part.image || '', // Use image_url first, then fallback to image if it exists
          specs: part.specs_text || part.specs || '',
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
        // Safe price extraction with proper type checking
        let price = 0;
        if (part.price) {
          if (typeof part.price === 'string') {
            const priceMatch = part.price.match(/[\d,]+/);
            price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
          } else if (typeof part.price === 'number') {
            price = part.price;
          }
        }
        
        const component: Component = {
          name: part.name,
          type: category,
          image: part.image_url || part.image || '', // Use image_url first, then fallback to image if it exists
          specs: part.specs_text || part.specs || '',
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
  const totalPrice = typeof estimate.total_price === 'number' ? estimate.total_price : 
    (typeof estimate.total_price === 'string' ? 
      parseInt(estimate.total_price.replace(/[^\d]/g, '')) || 0 : 0);
  
  // Create Build object compatible with BuildDetails component
  const build: Build = {
    id: parseInt(estimate.id) || Date.now(),
    name: estimate.title || '견적 상세',
    session_id: 0,
    components: components,
    total_price: totalPrice,
    recommendation: estimate.total_reason || estimate.suggestion || '견적 추천 설명이 없습니다.',
    created_at: estimate.created_at || new Date().toISOString(),
    rating: estimate.rating || {
      performance: estimate.performance || 0,
      price_performance: estimate.price_performance || 0,
      expandability: estimate.expandability || 0,
      noise: estimate.noise || 0
    }
  };
  
  console.log('[✅ 견적 변환] 변환된 Build 데이터:', build);
  return build;
}
