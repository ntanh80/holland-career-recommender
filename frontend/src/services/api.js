import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  response => response.data,
  error => {
    const message = error.response?.data?.error?.message || 'Có lỗi xảy ra, vui lòng thử lại';
    return Promise.reject(new Error(message));
  }
);

export default api;
