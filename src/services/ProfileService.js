import api from './ApiService';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const USER_KEY = '@user_data';

/**
 * Get the user's profile
 */
export const getProfile = async () => {
  if (isDevelopment()) {
    // In development, use stored data
    const userData = await AsyncStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
  
  const response = await api.get(ENDPOINTS.PROFILE.GET);
  return response.data;
};

/**
 * Update the user's profile
 * @param {object} profileData - Profile data to update
 */
export const updateProfile = async (profileData) => {
  if (isDevelopment()) {
    // In development, update stored data
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) throw new Error('User not found');
    
    const user = JSON.parse(userData);
    const updatedUser = { ...user, ...profileData, updatedAt: new Date().toISOString() };
    
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  const response = await api.put(ENDPOINTS.PROFILE.UPDATE, profileData);
  
  // Update local storage
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
  
  return response.data;
};

/**
 * Upload a profile photo
 * @param {object} photo - Photo object
 */
export const uploadProfilePhoto = async (photo) => {
  if (isDevelopment()) {
    // In development, update stored data
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) throw new Error('User not found');
    
    const user = JSON.parse(userData);
    const updatedUser = { 
      ...user, 
      profilePicture: photo.uri,
      updatedAt: new Date().toISOString()
    };
    
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  // Create form data
  const formData = new FormData();
  formData.append('photo', {
    uri: photo.uri,
    type: photo.type || 'image/jpeg',
    name: photo.fileName || 'profile.jpg',
  });
  
  // Upload photo
  const response = await api.post(ENDPOINTS.PROFILE.UPLOAD_PHOTO, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  // Update local storage
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
  
  return response.data;
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
export const changePassword = async (currentPassword, newPassword) => {
  if (isDevelopment()) {
    // In development, just simulate success
    return { success: true, message: 'Password changed successfully' };
  }
  
  const response = await api.post(ENDPOINTS.AUTH.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  
  return response;
};

export default {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
}; 