
import { EstimateItem } from '../hooks/useEstimates';
import { Build, Component } from '../hooks/useBuilds';

// Convert estimate API data to Build format for BuildDetails component
export const convertEstimateToBuild = (estimate: EstimateItem): Build => {
  const components: Component[] = [];
  
  // Convert parts object to components array
  if (estimate.parts) {
    Object.entries(estimate.parts).forEach(([type, part]) => {
      components.push({
        id: `${estimate.id}_${type}`,
        name: part.name,
        type: type,
        specs: part.specs,
        price: parseFloat(part.price.replace(/[^\d.-]/g, '')) || 0,
        reason: part.reason,
        image: part.image_url,
        purchase_link: part.link,
        alternatives: []
      });
    });
  }

  // Calculate total price from parts
  const totalPrice = components.reduce((sum, component) => sum + (component.price || 0), 0);

  return {
    id: estimate.id,
    name: estimate.title,
    total_price: totalPrice,
    recommendation: estimate.suggestion || '추천 설명이 없습니다.',
    components: components,
    created_at: estimate.created_at,
    rating: {
      performance: 8, // Default values since API doesn't provide ratings
      price_performance: 7,
      expandability: 6,
      noise: 5
    }
  };
};
