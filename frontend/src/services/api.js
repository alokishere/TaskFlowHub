import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const BASE_URL = isLocalhost 
  ? "http://localhost:5001/api" 
  : "https://task-flow-hub-5ah4.vercel.app/api";

const IMAGE_BASE_URL = isLocalhost 
  ? "http://localhost:5001/" 
  : "https://task-flow-hub-5ah4.vercel.app/";

const API = axios.create({
  baseURL: BASE_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;

export const imageBaseUrl = IMAGE_BASE_URL;