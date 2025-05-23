
import { ResponseModule } from './types';
import { sampleBuildRecommendation } from '../../data/sampleData';

export interface PartDetail {
  name: string;
  price: string;
  specs: string;
  reason: string;
  link: string;
  image: string;
}

export interface EstimateResponse {
  title: string;  // Added title property to ensure interface matches the data
  parts: PartDetail[];
  total_price: string;
  total_reason: string;
}

// Use the centralized sample data
export const sampleData: EstimateResponse = sampleBuildRecommendation;

export const buildRecommendationModule: ResponseModule = {
  name: 'buildRecommendation',
  moduleType: '견적 추천',
  process: async (content) => {
    // Always return the sample data as a JSON string
    // This ensures what's stored in the database is exactly what's displayed to the user
    return JSON.stringify(sampleData);
  }
};
