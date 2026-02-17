import axios from 'axios';
import { getMockResponse } from './mockData';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - use mock data when API is unavailable (demo mode)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend is unreachable, serve mock data
    const url = error.config?.url || '';
    const method = (error.config?.method || 'get').toUpperCase();
    const body = error.config?.data;
    const mockData = getMockResponse(url, method, body);

    if (mockData) {
      return Promise.resolve({ data: mockData, status: 200, statusText: 'OK (Demo)', headers: {}, config: error.config });
    }

    // If no mock data and it's a 401, don't redirect in demo mode
    if (error.response?.status === 401) {
      const mockFallback = getMockResponse(url, method, body);
      if (mockFallback) {
        return Promise.resolve({ data: mockFallback, status: 200, statusText: 'OK (Demo)', headers: {}, config: error.config });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
