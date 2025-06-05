
import { Build, Component } from '../hooks/useBuilds';
import { EstimateItem } from '../hooks/useEstimates';

export function convertEstimateToBuil(estimate: EstimateItem): Build {
  // Convert parts from estimate to components array
  const components: Component[] = [];
  
  if (estimate.parts) {
    Object.entries(estimate.parts).forEach(([category, part]) => {
      // Extract price as number from string (remove currency symbols and commas)
      const priceMatch = part.price.match(/[\d,]+/);
      const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;
      
      const component: Component = {
        name: part.name,
        type: category,
        image: part.image_url || '',
        specs: part.specs,
        reason: part.reason,
        purchase_link: part.link || '',
        price: price,
        alternatives: []
      };
      
      components.push(component);
    });
  }
  
  // Extract total price as number
  const totalPriceMatch = estimate.total_price.match(/[\d,]+/);
  const totalPrice = totalPriceMatch ? parseInt(totalPriceMatch[0].replace(/,/g, '')) : 0;
  
  // Create Build object compatible with BuildDetails component
  const build: Build = {
    id: parseInt(estimate.id) || Date.now(),
    name: estimate.title,
    session_id: 0,
    components: components,
    total_price: totalPrice,
    recommendation: estimate.total_reason || 'API estimate recommendation',
    created_at: estimate.created_at,
    rating: {
      // Default ratings since API doesn't provide these
      performance: 8,
      price_performance: 7,
      expandability: 6,
      noise: 5
    }
  };
  
  return build;
}
