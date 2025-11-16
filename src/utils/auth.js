import { authAPI } from '../services/api';

export const getToken = () => {
  return localStorage.getItem('token');
};

export const setToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  const token = getToken();
  const user = getUser();
  return !!(token && user);
};

export const logout = () => {
  removeToken();
  removeUser();
  window.location.href = '/login';
};

export const validateToken = async () => {
  try {
    const token = getToken();
    if (!token) return false;

    const response = await authAPI.verifyToken(token);
    if (response.success && response.data.valid) {
      setUser(response.data.user);
      return true;
    }
    return false;
  } catch (error) {
    logout();
    return false;
  }
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

export const isEmployee = () => {
  const user = getUser();
  return user?.role === 'employee';
};