import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { API_URL, ENDPOINTS } from '../config/api';
import { dummyAuthResponse } from '../data/dummyUser';
import { isDevelopment } from '../config/env';
import { setLogoutCallback } from './ApiService';

// Storage keys
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';
const USER_KEY = '@user_data';
const CREATED_USERS_KEY = '@created_users'; // New key for storing created users in development

// API axios instance with auth headers
const authAPI = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set logout callback for ApiService
setLogoutCallback(() => logout());

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

// Helper function to transform user data for consistent profile format
const transformUserData = (userData) => {
  const transformed = { ...userData };
  
  // Combine firstName and lastName into name
  if (userData.firstName && userData.lastName) {
    transformed.name = `${userData.firstName} ${userData.lastName}`;
  } else if (userData.firstName) {
    transformed.name = userData.firstName;
  } else if (userData.lastName) {
    transformed.name = userData.lastName;
  }
  
  // Map phoneNumber to phone
  if (userData.phoneNumber) {
    transformed.phone = userData.phoneNumber;
  }
  
  // Keep individual fields for compatibility
  transformed.firstName = userData.firstName;
  transformed.lastName = userData.lastName;
  transformed.phoneNumber = userData.phoneNumber;
  
  return transformed;
};

// Helper function to store created users in development
const storeCreatedUser = async (userData) => {
  if (!isDevelopment()) return;
  
  try {
    const existingUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
    const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];
    
    // Check if user already exists
    const userExists = existingUsers.find(user => user.email === userData.email);
    if (!userExists) {
      const transformedData = transformUserData(userData);
      existingUsers.push({
        ...transformedData,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
      await AsyncStorage.setItem(CREATED_USERS_KEY, JSON.stringify(existingUsers));
      console.log('✅ User stored locally for development:', userData.email);
    }
  } catch (error) {
    console.error('Error storing created user:', error);
  }
};

// Helper function to find created user by email and password
const findCreatedUser = async (email, password) => {
  if (!isDevelopment()) return null;
  
  try {
    const existingUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
    const existingUsers = existingUsersJson ? JSON.parse(existingUsersJson) : [];
    
    return existingUsers.find(user => 
      user.email === email && user.password === password
    );
  } catch (error) {
    console.error('Error finding created user:', error);
    return null;
  }
};

// Login function
export const login = async (email, password) => {
  try {
    // In development mode, use dummy data for testing
    if (isDevelopment()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // First check for created users
      const createdUser = await findCreatedUser(email, password);
      if (createdUser) {
        // Create auth response for created user
        const authData = {
          user: {
            _id: createdUser.id,
            email: createdUser.email,
            name: createdUser.name,
            phone: createdUser.phone,
            firstName: createdUser.firstName,
            lastName: createdUser.lastName,
            phoneNumber: createdUser.phoneNumber,
            userType: createdUser.userType || 'patient',
            status: 'active',
            createdAt: createdUser.createdAt,
            updatedAt: new Date().toISOString(),
          },
          tokens: {
            accessToken: `dev_token_${Date.now()}`,
            refreshToken: `dev_refresh_${Date.now()}`,
          }
        };
        
        // Store authentication data
        await AsyncStorage.setItem(TOKEN_KEY, authData.tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, authData.tokens.refreshToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(authData.user));
        
        console.log('✅ Login successful with created user:', email);
        return { user: authData.user, success: true };
      }
      
      // Fallback to original dummy user
      if (email === 'test@example.com' && password === 'password') {
        const { data } = dummyAuthResponse;
        
        // Transform dummy data to ensure consistent format
        const transformedUser = transformUserData(data.user);
        data.user = { ...data.user, ...transformedUser };
        
        // Store authentication data
        await AsyncStorage.setItem(TOKEN_KEY, data.tokens.accessToken);
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, data.tokens.refreshToken);
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(data.user));
        
        return { user: data.user, success: true };
      } else {
        // Provide helpful error message
        const createdUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
        const createdUsers = createdUsersJson ? JSON.parse(createdUsersJson) : [];
        
        if (createdUsers.length > 0) {
          const userEmails = createdUsers.map(u => u.email).join(', ');
          throw new Error(`Invalid credentials. Available test accounts: test@example.com, ${userEmails}`);
        } else {
          throw new Error('Invalid credentials. Try creating an account first or use test@example.com with password "password"');
        }
      }
    }
    
    // In production, call the real API
    const response = await axios.post(`${API_URL}${ENDPOINTS.AUTH.LOGIN}`, {
      email,
      password,
    });
    
    // Store authentication data
    const { user, tokens } = response.data.data;
    
    // Transform user data for consistent profile format
    const transformedUser = transformUserData(user);
    const finalUser = { ...user, ...transformedUser };
    
    await AsyncStorage.setItem(TOKEN_KEY, tokens.accessToken);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    
    return { user: finalUser, success: true };
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
      
      // Transform and store the user for later login
      const transformedData = transformUserData(userData);
      await storeCreatedUser(transformedData);
      
      // Return success response
      return { 
        success: true, 
        message: 'Registration successful',
        data: {
          ...dummyAuthResponse.data.user,
          ...transformedData,
          _id: 'dummy_id_' + Date.now(),
        }
      };
    }
    
    // In production, call the real API
    const response = await axios.post(`${API_URL}${ENDPOINTS.AUTH.REGISTER}`, userData);
    
    // Transform response data if needed
    if (response.data.data) {
      const transformedUser = transformUserData(response.data.data);
      response.data.data = { ...response.data.data, ...transformedUser };
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
  }
};

// Function to create user and store for development login
export const createUserForDevelopment = async (userData) => {
  if (!isDevelopment()) return;
  
  try {
    const transformedData = transformUserData(userData);
    await storeCreatedUser(transformedData);
    console.log('✅ User created and stored for development login:', userData.email);
  } catch (error) {
    console.error('Error creating user for development:', error);
  }
};

// Function to get all created users (for debugging)
export const getCreatedUsers = async () => {
  if (!isDevelopment()) return [];
  
  try {
    const existingUsersJson = await AsyncStorage.getItem(CREATED_USERS_KEY);
    return existingUsersJson ? JSON.parse(existingUsersJson) : [];
  } catch (error) {
    console.error('Error getting created users:', error);
    return [];
  }
};

// Function to clear all created users (for testing)
export const clearCreatedUsers = async () => {
  if (!isDevelopment()) return;
  
  try {
    await AsyncStorage.removeItem(CREATED_USERS_KEY);
    console.log('✅ Cleared all created users');
  } catch (error) {
    console.error('Error clearing created users:', error);
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
      
      // Handle name updates - split name into firstName/lastName if needed
      let updatedData = { ...profileData };
      if (profileData.name && !profileData.firstName && !profileData.lastName) {
        const nameParts = profileData.name.split(' ');
        updatedData.firstName = nameParts[0] || '';
        updatedData.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Handle phone mapping
      if (profileData.phone) {
        updatedData.phoneNumber = profileData.phone;
      }
      
      const updatedUser = { 
        ...user, 
        ...updatedData, 
        updatedAt: new Date().toISOString() 
      };
      
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    }
    
    // In production, call the real API
    const response = await authAPI.put(ENDPOINTS.PROFILE.UPDATE, profileData);
    
    // Transform and update stored user data
    const updatedUser = transformUserData(response.data.data);
    const finalUser = { ...response.data.data, ...updatedUser };
    
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(finalUser));
    return finalUser;
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
  createUserForDevelopment,
  getCreatedUsers,
  clearCreatedUsers,
}; 