import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { keycloakService } from '@/services/keycloak.service';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  timeout: 30000,
});

// Request interceptor - Add Authorization header with Keycloak token
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = keycloakService.getToken();

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const refreshed = await keycloakService.refreshToken();

        if (refreshed) {
          // Get the new token and retry the request
          const token = keycloakService.getToken();
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosInstance(originalRequest);
        } else {
          // Token refresh failed, redirect to login
          keycloakService.logout();
          return Promise.reject(error);
        }
      } catch (refreshError) {
        // Token refresh failed, redirect to login
        keycloakService.logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
