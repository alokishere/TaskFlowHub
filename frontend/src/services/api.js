import axios from 'axios';
import { getToken, clearAuth } from '../utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.status === 401) {
      clearAuth();
    }
    return Promise.reject(error?.response?.data || { error: 'Request failed' });
  }
);

export const authAPI = {
  login: (payload) => api.post('/api/auth/login', payload),
  bootstrapAdmin: (payload) => api.post('/api/auth/bootstrap-admin', payload),
  me: () => api.get('/api/auth/me')
};

export const userAPI = {
  listEmployees: () => api.get('/api/users/employees'),
  createEmployee: (payload) => api.post('/api/users/employees', payload)
};

export const projectAPI = {
  listProjects: () => api.get('/api/projects'),
  createProject: (payload) => api.post('/api/projects', payload)
};

export default api;
