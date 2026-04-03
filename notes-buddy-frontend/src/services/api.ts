import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'https://srv1470984.hstgr.cloud';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT from cookies to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('nb_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('nb_access_token');
      Cookies.remove('nb_is_admin');
      sessionStorage.removeItem('nb_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
