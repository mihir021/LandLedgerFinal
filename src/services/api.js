/**
 * Centralized Axios Instance
 * Configured with baseURL, JWT authorization header injection,
 * and response error interceptors.
 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ──
// Attach JWT token to every outgoing request if available.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ll_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──
// Normalize errors and handle 401 (expired/invalid token).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Network error or no response
    if (!error.response) {
      return Promise.reject(new Error('Network error — please check your connection'));
    }

    const { status, data } = error.response;

    // 401 — Unauthorized → clear auth & redirect
    if (status === 401) {
      localStorage.removeItem('ll_token');
      localStorage.removeItem('ll_user');
      // Only redirect if not already on login/register
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.href = '/login';
      }
    }

    // Extract the most useful error message
    const message =
      data?.message ||
      data?.error ||
      `Request failed with status ${status}`;

    return Promise.reject(new Error(message));
  }
);

export default api;
