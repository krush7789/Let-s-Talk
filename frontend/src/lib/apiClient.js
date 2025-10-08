import axios from 'axios';

const resolveOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

const rawBase = import.meta.env.VITE_API_BASE_URL?.trim();
const normalizedBase = rawBase && rawBase.length > 0 ? rawBase.replace(/\/$/, '') : '';
const fallbackBase = `${resolveOrigin().replace(/\/$/, '')}/api/v1`;

export const API_BASE_URL = normalizedBase || fallbackBase;
export const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL?.trim() || '').replace(/\/$/, '') || API_BASE_URL.replace(/\/api\/v1$/, '');

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.data?.message) {
      return Promise.reject({ ...error, message: error.response.data.message });
    }
    return Promise.reject(error);
  }
);

export default apiClient;
