import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const trimTrailingSlash = (value = '') => String(value).replace(/\/+$/, '');

const apiUrlFromEnv = trimTrailingSlash(import.meta.env.VITE_API_URL || '');
const imageUrlFromEnv = trimTrailingSlash(import.meta.env.VITE_IMAGE_BASE_URL || '');

const BASE_URL = apiUrlFromEnv
  ? `${apiUrlFromEnv}/api`
  : (
    isLocalhost
      ? 'http://localhost:5001/api'
      : 'https://task-flow-hub-5ah4.vercel.app/api'
  );

const IMAGE_BASE_URL = imageUrlFromEnv
  ? `${imageUrlFromEnv}/`
  : (
    isLocalhost
      ? 'http://localhost:5001/'
      : 'https://task-flow-hub-5ah4.vercel.app/'
  );

const CLICK_TO_REQUEST_WINDOW_MS = 1200;

let recentClickedButton = null;
let recentButtonClickAt = 0;
const buttonRequestCount = new WeakMap();

const canUseDom = () => typeof window !== 'undefined' && typeof document !== 'undefined';

const isTrackableButton = (target) => {
  if (!target || !(target instanceof Element)) {
    return false;
  }
  return Boolean(target.closest('button'));
};

const attachButtonTracker = () => {
  if (!canUseDom()) return;
  if (window.__taskFlowButtonLoaderAttached) return;

  document.addEventListener(
    'click',
    (event) => {
      if (!isTrackableButton(event.target)) return;
      recentClickedButton = event.target.closest('button');
      recentButtonClickAt = Date.now();
    },
    true
  );

  window.__taskFlowButtonLoaderAttached = true;
};

const markButtonLoading = (button, markAsLoading, wasDisabled = false) => {
  if (!button || !button.isConnected) return;

  if (markAsLoading) {
    button.classList.add('api-btn-loading');
    button.setAttribute('aria-busy', 'true');
    if (!wasDisabled) {
      button.disabled = true;
    }
    return;
  }

  button.classList.remove('api-btn-loading');
  button.removeAttribute('aria-busy');
  if (!wasDisabled) {
    button.disabled = false;
  }
};

const startButtonRequest = () => {
  if (!canUseDom()) {
    return null;
  }

  const now = Date.now();
  if (!recentClickedButton || now - recentButtonClickAt > CLICK_TO_REQUEST_WINDOW_MS) {
    return null;
  }

  if (!recentClickedButton.isConnected) {
    return null;
  }

  const button = recentClickedButton;
  const previousCount = buttonRequestCount.get(button) || 0;
  buttonRequestCount.set(button, previousCount + 1);
  const wasDisabled = button.disabled;
  markButtonLoading(button, true, wasDisabled);

  return { button, wasDisabled };
};

const stopButtonRequest = (meta) => {
  if (!meta?.button) {
    return;
  }

  const activeCount = buttonRequestCount.get(meta.button) || 0;
  if (activeCount <= 1) {
    buttonRequestCount.delete(meta.button);
    markButtonLoading(meta.button, false, meta.wasDisabled);
    return;
  }

  buttonRequestCount.set(meta.button, activeCount - 1);
};

attachButtonTracker();

const API = axios.create({
  baseURL: BASE_URL
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const buttonMeta = startButtonRequest();
  if (buttonMeta) {
    config.metadata = { ...(config.metadata || {}), buttonMeta };
  }

  return config;
});

const clearRequestLoaderState = (config) => {
  stopButtonRequest(config?.metadata?.buttonMeta);
};

API.interceptors.response.use(
  (response) => {
    clearRequestLoaderState(response.config);
    return response;
  },
  (error) => {
    clearRequestLoaderState(error.config);
    return Promise.reject(error);
  }
);

export default API;

export const imageBaseUrl = IMAGE_BASE_URL;
