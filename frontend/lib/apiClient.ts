// utils/apiClient.ts
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from './auth';

const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: Base_URL,
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could redirect to login
      console.error('Authentication failed - redirecting to login');
      // You can add redirect logic here
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper functions for different HTTP methods
export const apiGet = async (url: string, config?: AxiosRequestConfig) => {
  return apiClient.get(url, config);
};

export const apiPost = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  return apiClient.post(url, data, config);
};

export const apiPut = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  return apiClient.put(url, data, config);
};

export const apiDelete = async (url: string, config?: AxiosRequestConfig) => {
  return apiClient.delete(url, config);
};

export const apiPatch = async (url: string, data?: any, config?: AxiosRequestConfig) => {
  return apiClient.patch(url, data, config);
};

export default apiClient;