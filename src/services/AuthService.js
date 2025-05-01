import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL, ENDPOINTS } from '../config/api';
import { dummyAuthResponse } from '../data/dummyUser';
import { isDevelopment } from '../config/env';

// Storage keys
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';

// API axios instance with auth headers
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to add token to all requests
authAPI.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add interceptor to refresh token when 401 is returned
authAPI.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is unauthorized and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          // No refresh token, we need to logout the user
          await logout();
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(`${API_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
          refreshToken,
        }, {
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem(TOKEN_KEY)}`,
          },
        });
        
        // Save the new tokens
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await AsyncStorage.setItem(TOKEN_KEY, accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Error refreshing token, logout the user
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Login function
export const login = async (email, password) => {
  try {
    // In development mode, use dummy data for testing
    if (isDevelopment()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if the email and password match our dummy user
      if (email === 'test@example.com' && password === 'password') {
        const { data } = dummyAuthResponse;
        
        // Store authentication data
        await AsyncStorage.setItem(TOKEN_KEY, data.tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        return { user: data.user, success: true };
      } else {
        // Simulate authentication failure
        throw new Error('Invalid email or password');
      }
    }
    
    // In production, call the real API
    const response = await axios.post(`${API_URL}${ENDPOINTS.AUTH.LOGIN}`, {
      email,
      password,
    });
    
    // Store authentication data
    const { user, tokens } = response.data.data;
    await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return { user, success: true };
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
  }
};

// Register function
export const register = async (userData) => {
  try {
    // In development mode, use dummy data for testing
    if (isDevelopment()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return success response
      return { 
        success: true, 
        message: 'Registration successful',
        data: {
          ...dummyAuthResponse.data.user,
          ...userData,
          _id: 'dummy_id_' + Date.now(),
        }
      };
    }
    
    // In production, call the real API
    const response = await axios.post(`${API_URL}${ENDPOINTS.AUTH.REGISTER}`, userData);
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
  }
};

// Logout function
export const logout = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token && !isDevelopment()) {
      // Call logout endpoint to invalidate token in production
      await authAPI.delete(ENDPOINTS.AUTH.LOGOUT);
    }
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear auth storage regardless of API success
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  return !!token;
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Get user profile from API
export const getUserProfile = async () => {
  try {
    // In development mode, return stored user data
    if (isDevelopment()) {
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (!userData) return null;
      return JSON.parse(userData);
    }
    
    // In production, call the real API
    const response = await authAPI.get(ENDPOINTS.PROFILE.GET);
    // Update stored user data
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data.data));
    return response.data.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    // In development mode, update stored user data
    if (isDevelopment()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const userData = await AsyncStorage.getItem(USER_KEY);
      if (!userData) throw new Error('User not found');
      
      const user = JSON.parse(userData);
      const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
    
    // In production, call the real API
    const response = await authAPI.put(ENDPOINTS.PROFILE.UPDATE, profileData);
    // Update stored user data
    const updatedUser = response.data.data;
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  isAuthenticated,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
}; 