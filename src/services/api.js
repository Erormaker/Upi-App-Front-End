// src/services/api.js
import axios from 'axios';
import { getCookie, setCookie, eraseCookie } from '../utils/cookies';

// Create Centralized Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://upi-app-pps0.onrender.com/api'),
  timeout: 10000,
  withCredentials: true
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = getCookie('payflow_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Token Refresh & Errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expiration (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = getCookie('payflow_refresh_token');

      if (refreshToken) {
        try {
          // Use basic axios call directly to bypass instance interceptors and proxy to Spring Boot
          const response = await axios.post('/api/auth/refresh', {
            refreshToken
          });

          // Match TokenRefreshResponse schema: { accessToken, refreshToken, tokenType }
          const { accessToken: newToken, refreshToken: newRefreshToken } = response.data;
          
          // Store new tokens in secure same-site cookies
          setCookie('payflow_token', newToken, 1); // 1 day
          if (newRefreshToken) {
            setCookie('payflow_refresh_token', newRefreshToken, 7); // 7 days
          }

          // Retry original request with new token
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token failed -> Clear authentication cookies
          eraseCookie('payflow_token');
          eraseCookie('payflow_refresh_token');
          
          // Dispatch custom event to notify AuthContext to log out the user
          window.dispatchEvent(new Event('auth-logout'));
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available -> Clear credentials and logout
        eraseCookie('payflow_token');
        eraseCookie('payflow_refresh_token');
        window.dispatchEvent(new Event('auth-logout'));
      }
    }

    // Centralized Error Handling Logger
    console.error('API Error:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
