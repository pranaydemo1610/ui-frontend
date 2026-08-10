import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://13.233.185.16:8080/ulip';

export const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach request id + timestamp
apiClient.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

// Response interceptor - emit latency event
apiClient.interceptors.response.use(
  (response) => {
    const startTime = response.config.metadata?.startTime ?? Date.now();
    const latency = Date.now() - startTime;
    window.dispatchEvent(
      new CustomEvent('api-latency', { detail: { latency, url: response.config.url, success: true } }),
    );
    return response;
  },
  (error) => {
    const startTime = error.config?.metadata?.startTime ?? Date.now();
    const latency = Date.now() - startTime;
    window.dispatchEvent(
      new CustomEvent('api-latency', { detail: { latency, url: error.config?.url, success: false } }),
    );
    return Promise.reject(error);
  },
);

// Augment axios config with metadata
declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: { startTime: number };
  }
}
