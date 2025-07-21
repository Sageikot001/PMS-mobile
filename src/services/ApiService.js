import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL } from '../config/api';

// Storage keys
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

// Backend response status codes
const STATUS_CODES = {
  SUCCESS: '10000',
  FAILURE: '10001',
  RETRY: '10002',
  INVALID_ACCESS_TOKEN: '10003',
};

// Logout callback to avoid circular dependencies
let logoutCallback = null;

export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Create API instance with enhanced configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token and transform request
api.interceptors.request.use(
  async (config) => {
    try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
      
      // Log request in development
      if (__DEV__) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('Request Data:', config.data);
      }
      
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
    return config;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle data transformation and errors
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (__DEV__) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      console.log('Response Data:', response.data);
    }
    
    // Transform backend response based on status code
    const { statusCode, message, data } = response.data;
    
    switch (statusCode) {
      case STATUS_CODES.SUCCESS:
        return {
          ...response,
          data: {
            success: true,
            message,
            data,
            statusCode
          }
        };
      case STATUS_CODES.FAILURE:
        throw new ApiError(message || 'Request failed', response.status, response.data);
      case STATUS_CODES.RETRY:
        throw new ApiError(message || 'Request needs retry', response.status, response.data, true);
      default:
        return response;
    }
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Log error in development
    if (__DEV__) {
      console.log(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`);
      console.log('Error Response:', error.response?.data);
    }
    
    // Handle network errors
    if (!error.response) {
      throw new ApiError('Network error. Please check your connection.', 0, null, false, 'NETWORK_ERROR');
    }
    
    const { status, data } = error.response;
    
    // Handle token refresh for 401 errors
    if (status === 401 && data?.statusCode === STATUS_CODES.INVALID_ACCESS_TOKEN && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Attempt token refresh
        const refreshResponse = await axios.post(`${API_URL}/token/refresh`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
        
        // Store new tokens
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        if (logoutCallback) {
          await logoutCallback();
        }
        throw new ApiError('Session expired. Please login again.', 401, null, false, 'SESSION_EXPIRED');
      }
    }
    
    // Transform error response
    const errorMessage = data?.message || error.message || 'An error occurred';
    const errorCode = data?.statusCode || 'UNKNOWN_ERROR';
    
    throw new ApiError(errorMessage, status, data, false, errorCode);
  }
);

// Custom API Error class
class ApiError extends Error {
  constructor(message, statusCode, data, isRetryable = false, errorCode = 'API_ERROR') {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
    this.isRetryable = isRetryable;
    this.errorCode = errorCode;
  }
}

// Enhanced request methods with error handling
export const get = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await api.get(endpoint, { params, ...options });
    return response.data;
  } catch (error) {
    handleApiError(error, `GET ${endpoint}`);
    throw error;
  }
};

export const post = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.post(endpoint, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, `POST ${endpoint}`);
    throw error;
  }
};

export const put = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.put(endpoint, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, `PUT ${endpoint}`);
    throw error;
  }
};

export const patch = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await api.patch(endpoint, data, options);
    return response.data;
  } catch (error) {
    handleApiError(error, `PATCH ${endpoint}`);
    throw error;
  }
};

export const del = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await api.delete(endpoint, { params, ...options });
    return response.data;
  } catch (error) {
    handleApiError(error, `DELETE ${endpoint}`);
    throw error;
  }
};

// Error handling utility
const handleApiError = (error, operation) => {
  console.error(`Error in ${operation}:`, error);
  
  // Show user-friendly error messages
  if (error.errorCode === 'NETWORK_ERROR') {
    Alert.alert('Network Error', 'Please check your internet connection and try again.');
  } else if (error.errorCode === 'SESSION_EXPIRED') {
    Alert.alert('Session Expired', 'Please login again to continue.');
  } else if (error.isRetryable) {
    Alert.alert('Temporary Error', 'Please try again in a moment.');
  }
};

// Utility function to check if error is retryable
export const isRetryableError = (error) => {
  return error instanceof ApiError && error.isRetryable;
};

// Export the axios instance for direct use if needed
export { api };

export default {
  get,
  post,
  put,
  patch,
  delete: del,
  isRetryableError,
  ApiError,
}; 