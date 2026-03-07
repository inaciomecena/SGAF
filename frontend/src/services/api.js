import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const refreshToken = localStorage.getItem('refreshToken');
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/refresh');

    if (status === 401 && refreshToken && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        if (!refreshRequest) {
          refreshRequest = axios.post(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        }
        const { data } = await refreshRequest;
        localStorage.setItem('token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        refreshRequest = null;
      }
    }

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (!isAuthRoute) {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
