import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors by redirecting to login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  } else if (error.response?.data?.details) {
    return Array.isArray(error.response.data.details) 
      ? error.response.data.details.join(', ')
      : error.response.data.details;
  } else if (error.message) {
    return error.message;
  } else {
    return 'An unexpected error occurred';
  }
};

// Helper function to make authenticated requests
export const makeRequest = async <T>(
  config: AxiosRequestConfig
): Promise<T> => {
  try {
    const response = await api(config);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export default api; 