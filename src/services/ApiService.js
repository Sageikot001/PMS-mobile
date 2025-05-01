import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

// Storage keys
const TOKEN_KEY = '@auth_token';

// Create API instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // You can handle specific error cases here
    // For 401 errors, the token refresh is handled in AuthService
    return Promise.reject(error);
  }
);

/**
 * Make a GET request
 * @param {string} endpoint - The API endpoint
 * @param {object} params - Query parameters
 */
export const get = async (endpoint, params = {}) => {
  try {
    const response = await api.get(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error in GET ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a POST request
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The data to post
 */
export const post = async (endpoint, data = {}) => {
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error in POST ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a PUT request
 * @param {string} endpoint - The API endpoint
 * @param {object} data - The data to put
 */
export const put = async (endpoint, data = {}) => {
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error in PUT ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Make a DELETE request
 * @param {string} endpoint - The API endpoint
 * @param {object} params - Query parameters
 */
export const del = async (endpoint, params = {}) => {
  try {
    const response = await api.delete(endpoint, { params });
    return response.data;
  } catch (error) {
    console.error(`Error in DELETE ${endpoint}:`, error);
    throw error;
  }
};

export default {
  get,
  post,
  put,
  delete: del,
}; 