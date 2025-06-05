
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// Types for API responses
export interface PartDetail {
  name: string;
  reason: string;
  price: string;
  specs: string;
  link: string;
  image_url: string;
}

export interface EstimateResponse {
  title: string;
  parts: Record<string, PartDetail>;
  total_price: string;
  total_reason: string;
  suggestion: string;
}

export interface EstimatesListResponse {
  responses: EstimateResponse[];
}

export interface SaveEstimateRequest {
  estimate_id: string;
}

export interface SaveEstimateResponse {
  success: boolean;
  message?: string;
}

export interface DeleteEstimateResponse {
  success: boolean;
  message?: string;
}

export interface GeneratePdfResponse {
  success: boolean;
  pdf_url?: string;
  message?: string;
}

// API Service Class
class EstimatesApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('[API Response Error]', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // 1. Fetch estimate list
  async fetchEstimates(): Promise<EstimatesListResponse> {
    try {
      const response = await this.axiosInstance.get<EstimatesListResponse>('/estimates');
      return response.data;
    } catch (error) {
      console.error('Error fetching estimates:', error);
      throw new Error(`Failed to fetch estimates: ${error.response?.data?.message || error.message}`);
    }
  }

  // 2. Save estimate
  async saveEstimate(estimateId: string): Promise<SaveEstimateResponse> {
    try {
      const response = await this.axiosInstance.post<SaveEstimateResponse>(
        `/estimates/${estimateId}/save`,
        { estimate_id: estimateId }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving estimate:', error);
      throw new Error(`Failed to save estimate: ${error.response?.data?.message || error.message}`);
    }
  }

  // 3. Get estimate details
  async getEstimateDetails(estimateId: string): Promise<EstimatesListResponse> {
    try {
      const response = await this.axiosInstance.get<EstimatesListResponse>(
        `/estimates/${estimateId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching estimate details:', error);
      throw new Error(`Failed to fetch estimate details: ${error.response?.data?.message || error.message}`);
    }
  }

  // 4. Delete estimate
  async deleteEstimate(estimateId: string): Promise<DeleteEstimateResponse> {
    try {
      const response = await this.axiosInstance.delete<DeleteEstimateResponse>(
        `/estimates/${estimateId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting estimate:', error);
      throw new Error(`Failed to delete estimate: ${error.response?.data?.message || error.message}`);
    }
  }

  // 5. Generate PDF
  async generatePdf(estimateId: string): Promise<GeneratePdfResponse> {
    try {
      const response = await this.axiosInstance.post<GeneratePdfResponse>(
        '/generate-pdf',
        { estimate_id: estimateId }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error(`Failed to generate PDF: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Export singleton instance
export const estimatesApiService = new EstimatesApiService();
export default estimatesApiService;
