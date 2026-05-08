// frontend/src/api/axios.js
// One central place for all API calls — no need to type the full URL every time

import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // reads from frontend/.env
});

// ── Request interceptor ──────────────────────────────────────────────────
// Before EVERY request, automatically attach the JWT token if we have one
API.interceptors.request.use((config) => {
  const userInfo = localStorage.getItem('userInfo');
  if (userInfo) {
    const { token } = JSON.parse(userInfo);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor ─────────────────────────────────────────────────
// If server says 401 (Unauthorized), clear storage and redirect to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;