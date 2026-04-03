import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://srv1470984.hstgr.cloud';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT from SecureStore to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('nb_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('nb_access_token');
      // Auth context will handle navigation via state change
    }
    return Promise.reject(error);
  }
);

export default api;
