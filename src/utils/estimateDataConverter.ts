
import { Build, Component } from '../hooks/useBuilds';
import { EstimateItem } from '../hooks/useEstimates';

export const convertEstimateToApiFormat = (estimate: any) => {
  return {
    estimate_name: estimate.estimate_name || estimate.title || "견적서",
    total_price: estimate.total_price || estimate.totalPrice || 0,
    components: estimate.components?.map((comp: any) => ({
      name: comp.name || comp.component_name || "",
      category: comp.category || comp.component_category || "",
      price: typeof comp.price === 'string' && comp.price ? 
        parseInt(comp.price.replace(/[^0-9]/g, '')) : 
        (typeof comp.price === 'number' ? comp.price : 0),
      image_url: comp.image_url || comp.imageUrl || null,
      specs: comp.specs || comp.specifications || {},
      vendor: comp.vendor || comp.brand || "",
      model: comp.model || "",
      purchase_url: comp.purchase_url || comp.purchaseUrl || ""
    })) || []
  };
};

export function convertEstimateToBuil(estimate: EstimateItem): Build {
  console.log('[🔄 견적 변환] 원본 견적 데이터:', estimate);
  
  // Convert parts from estimate to components array
  const components: Component[] = [];
  
  if (estimate.parts) {
    // Handle both object and array formats for parts
    if (Array.isArray(estimate.parts)) {
      // If parts is already an array
      estimate.parts.forEach((part, index) => {
        // Safe price extraction with proper type checking
        let price = 0;
        if (part.price !== undefined && part.price !== null) {
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
        if (part && typeof part === 'object' && 'price' in part) {
          const partPrice = part.price;
          if (partPrice !== undefined && partPrice !== null) {
            if (typeof partPrice === 'string') {
              const priceMatch = partPrice.match(/[\d,]+/);
              price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
            } else if (typeof partPrice === 'number') {
              price = partPrice;
            }
          }
        }
        
        const component: Component = {
          name: (part && typeof part === 'object' && 'name' in part) ? String(part.name) : 'Unknown Component',
          type: category,
          image: (part && typeof part === 'object' && 'image_url' in part) ? String(part.image_url) : 
                 (part && typeof part === 'object' && 'image' in part) ? String(part.image) : '',
          specs: (part && typeof part === 'object' && 'specs_text' in part) ? String(part.specs_text) :
                 (part && typeof part === 'object' && 'specs' in part) ? String(part.specs) : '',
          reason: (part && typeof part === 'object' && 'reason' in part) ? String(part.reason) : '',
          purchase_link: (part && typeof part === 'object' && 'link' in part) ? String(part.link) : '',
          price: price,
          alternatives: []
        };
        
        components.push(component);
      });
    }
  }
  
  // Extract total price as number
  let totalPrice = 0;
  if (estimate.total_price !== undefined && estimate.total_price !== null) {
    if (typeof estimate.total_price === 'number') {
      totalPrice = estimate.total_price;
    } else if (typeof estimate.total_price === 'string') {
      const priceMatch = estimate.total_price.match(/[\d,]+/);
      totalPrice = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
    }
  }
  
  // Create Build object compatible with BuildDetails component
  const build: Build = {
    id: parseInt(String(estimate.id)) || Date.now(),
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
