import api from './ApiService';
import { ENDPOINTS } from '../config/api';
import { isDevelopment } from '../config/env';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const USER_KEY = '@user_data';

// Helper function to transform user data for consistent profile format
const transformUserDataForProfile = (userData) => {
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

/**
 * Get the user's profile
 */
export const getProfile = async () => {
  if (isDevelopment()) {
    // In development, use stored data
    const userData = await AsyncStorage.getItem(USER_KEY);
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    return transformUserDataForProfile(user);
  }
  
  const response = await api.get(ENDPOINTS.PROFILE.GET);
  return transformUserDataForProfile(response.data);
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
    
    // Transform profile data for consistent updates
    let transformedProfileData = { ...profileData };
    
    // Handle name updates - split name into firstName/lastName if needed
    if (profileData.name && !profileData.firstName && !profileData.lastName) {
      const nameParts = profileData.name.split(' ');
      transformedProfileData.firstName = nameParts[0] || '';
      transformedProfileData.lastName = nameParts.slice(1).join(' ') || '';
    }
    
    // Handle phone mapping
    if (profileData.phone) {
      transformedProfileData.phoneNumber = profileData.phone;
    }
    
    const updatedUser = { 
      ...user, 
      ...transformedProfileData, 
      updatedAt: new Date().toISOString() 
    };
    
    // Transform the updated user data for consistent profile format
    const transformedUser = transformUserDataForProfile(updatedUser);
    
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
    return transformedUser;
  }
  
  // Transform profile data for backend compatibility
  let backendProfileData = { ...profileData };
  
  // Handle name updates - split name into firstName/lastName if needed
  if (profileData.name && !profileData.firstName && !profileData.lastName) {
    const nameParts = profileData.name.split(' ');
    backendProfileData.firstName = nameParts[0] || '';
    backendProfileData.lastName = nameParts.slice(1).join(' ') || '';
  }
  
  // Handle phone mapping
  if (profileData.phone) {
    backendProfileData.phoneNumber = profileData.phone;
  }
  
  const response = await api.put(ENDPOINTS.PROFILE.UPDATE, backendProfileData);
  
  // Transform response data for consistent profile format
  const transformedData = transformUserDataForProfile(response.data);
  
  // Update local storage
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedData));
  
  return transformedData;
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
    
    // Transform the updated user data for consistent profile format
    const transformedUser = transformUserDataForProfile(updatedUser);
    
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedUser));
    return transformedUser;
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
  
  // Transform response data for consistent profile format
  const transformedData = transformUserDataForProfile(response.data);
  
  // Update local storage
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(transformedData));
  
  return transformedData;
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
export const changePassword = async (currentPassword, newPassword) => {
  if (isDevelopment()) {
    // In development, simulate password change
    await new Promise(resolve => setTimeout(resolve, 800));
    return { success: true, message: 'Password changed successfully' };
  }
  
  const response = await api.put(ENDPOINTS.PROFILE.CHANGE_PASSWORD, {
    currentPassword,
    newPassword,
  });
  
  return response.data;
};

export default {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  changePassword,
}; 