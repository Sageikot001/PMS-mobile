import ApiService from './ApiService';
import { ENDPOINTS } from '../config/api';
import { createUserForDevelopment } from './AuthService';
import { isDevelopment } from '../config/env';

// User types enumeration
export const USER_TYPES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  INSTITUTION: 'institution',
  ADMIN: 'admin',
};

// User status enumeration
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
  VERIFIED: 'verified',
};

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
 * User Management Service
 * Handles all user-related operations for different user types
 */
class UserManagementService {
  
  // Create a new user based on user type
  async createUser(userData, userType) {
    try {
      const endpoint = this.getRegistrationEndpoint(userType);
      
      // Transform user data for consistent profile format
      const transformedData = transformUserDataForProfile(userData);
      const userDataWithType = {
        ...transformedData,
        userType,
        status: USER_STATUS.PENDING,
      };
      
      // In development mode, store user for authentication
      if (isDevelopment()) {
        await createUserForDevelopment(userDataWithType);
      }
      
      const response = await ApiService.post(endpoint, userDataWithType);
      
      // Transform response data if needed
      let responseData = response.data;
      if (responseData) {
        responseData = transformUserDataForProfile(responseData);
      }
      
      return {
        success: true,
        data: responseData,
        message: response.message || 'User created successfully',
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Get user profile by ID
  async getUserProfile(userId) {
    try {
      const response = await ApiService.get(`${ENDPOINTS.PROFILE.GET}/${userId}`);
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return transformedData;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      // Transform update data if needed
      let transformedUpdateData = { ...updateData };
      
      // Handle name updates - split name into firstName/lastName if needed
      if (updateData.name && !updateData.firstName && !updateData.lastName) {
        const nameParts = updateData.name.split(' ');
        transformedUpdateData.firstName = nameParts[0] || '';
        transformedUpdateData.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      // Handle phone mapping
      if (updateData.phone) {
        transformedUpdateData.phoneNumber = updateData.phone;
      }
      
      const response = await ApiService.put(`${ENDPOINTS.PROFILE.UPDATE}/${userId}`, transformedUpdateData);
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'Profile updated successfully',
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get users by type with pagination
  async getUsersByType(userType, page = 1, limit = 20, filters = {}) {
    try {
      const response = await ApiService.get('/users', {
        userType,
        page,
        limit,
        ...filters,
      });
      
      // Transform user data in the response
      const transformedUsers = (response.data || []).map(user => 
        transformUserDataForProfile(user)
      );
      
      return {
        data: transformedUsers,
        pagination: response.pagination || {},
        hasMore: response.pagination?.hasNextPage || false,
      };
    } catch (error) {
      console.error('Error fetching users by type:', error);
      throw error;
    }
  }

  // Search users
  async searchUsers(query, userType = null, page = 1, limit = 20) {
    try {
      const response = await ApiService.get('/users/search', {
        q: query,
        userType,
        page,
        limit,
      });
      
      // Transform user data in the response
      const transformedUsers = (response.data || []).map(user => 
        transformUserDataForProfile(user)
      );
      
      return {
        data: transformedUsers,
        pagination: response.pagination || {},
        hasMore: response.pagination?.hasNextPage || false,
      };
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Update user status
  async updateUserStatus(userId, status) {
    try {
      const response = await ApiService.patch(`/users/${userId}/status`, { status });
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'Status updated successfully',
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  // Upload user profile photo
  async uploadProfilePhoto(userId, imageData) {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: imageData.uri,
        type: imageData.type,
        name: imageData.fileName || 'profile.jpg',
      });

      const response = await ApiService.post(
        `${ENDPOINTS.PROFILE.UPLOAD_PHOTO}/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);

      return {
        success: true,
        data: transformedData,
        message: response.message || 'Photo uploaded successfully',
      };
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  // Verify user account
  async verifyUser(userId, verificationData) {
    try {
      const response = await ApiService.post(`/users/${userId}/verify`, verificationData);
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'User verified successfully',
      };
    } catch (error) {
      console.error('Error verifying user:', error);
      throw error;
    }
  }

  // Get user statistics
  async getUserStats(userType = null) {
    try {
      const response = await ApiService.get('/users/stats', { userType });
      return response.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Patient-specific methods
  async createPatientProfile(patientData) {
    try {
      // Transform patient data for consistent profile format
      const transformedData = transformUserDataForProfile(patientData);
      const patientDataWithType = {
        ...transformedData,
        userType: USER_TYPES.PATIENT,
      };
      
      // In development mode, store user for authentication
      if (isDevelopment()) {
        await createUserForDevelopment(patientDataWithType);
      }
      
      const response = await ApiService.post('/patients', patientDataWithType);
      
      // Transform response data for consistent profile format
      const transformedResponseData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedResponseData,
        message: response.message || 'Patient profile created successfully',
      };
    } catch (error) {
      console.error('Error creating patient profile:', error);
      throw error;
    }
  }

  async updatePatientMedicalHistory(patientId, medicalHistory) {
    try {
      const response = await ApiService.put(`/patients/${patientId}/medical-history`, {
        medicalHistory,
      });
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'Medical history updated successfully',
      };
    } catch (error) {
      console.error('Error updating patient medical history:', error);
      throw error;
    }
  }

  // Doctor-specific methods
  async createDoctorProfile(doctorData) {
    try {
      // Transform doctor data for consistent profile format
      const transformedData = transformUserDataForProfile(doctorData);
      const doctorDataWithType = {
        ...transformedData,
        userType: USER_TYPES.DOCTOR,
      };
      
      // In development mode, store user for authentication
      if (isDevelopment()) {
        await createUserForDevelopment(doctorDataWithType);
      }
      
      const response = await ApiService.post('/doctors', doctorDataWithType);
      
      // Transform response data for consistent profile format
      const transformedResponseData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedResponseData,
        message: response.message || 'Doctor profile created successfully',
      };
    } catch (error) {
      console.error('Error creating doctor profile:', error);
      throw error;
    }
  }

  async updateDoctorSpecialization(doctorId, specializations) {
    try {
      const response = await ApiService.put(`/doctors/${doctorId}/specializations`, {
        specializations,
      });
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'Specializations updated successfully',
      };
    } catch (error) {
      console.error('Error updating doctor specializations:', error);
      throw error;
    }
  }

  async getDoctorSchedule(doctorId) {
    try {
      const response = await ApiService.get(`/doctors/${doctorId}/schedule`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      throw error;
    }
  }

  // Institution-specific methods
  async createInstitutionProfile(institutionData) {
    try {
      // Transform institution data for consistent profile format
      const transformedData = transformUserDataForProfile(institutionData);
      const institutionDataWithType = {
        ...transformedData,
        userType: USER_TYPES.INSTITUTION,
      };
      
      // In development mode, store user for authentication
      if (isDevelopment()) {
        await createUserForDevelopment(institutionDataWithType);
      }
      
      const response = await ApiService.post('/institutions', institutionDataWithType);
      
      // Transform response data for consistent profile format
      const transformedResponseData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedResponseData,
        message: response.message || 'Institution profile created successfully',
      };
    } catch (error) {
      console.error('Error creating institution profile:', error);
      throw error;
    }
  }

  async updateInstitutionServices(institutionId, services) {
    try {
      const response = await ApiService.put(`/institutions/${institutionId}/services`, {
        services,
      });
      
      // Transform response data for consistent profile format
      const transformedData = transformUserDataForProfile(response.data);
      
      return {
        success: true,
        data: transformedData,
        message: response.message || 'Services updated successfully',
      };
    } catch (error) {
      console.error('Error updating institution services:', error);
      throw error;
    }
  }

  async getInstitutionDoctors(institutionId, page = 1, limit = 20) {
    try {
      const response = await ApiService.get(`/institutions/${institutionId}/doctors`, {
        page,
        limit,
      });
      
      // Transform user data in the response
      const transformedUsers = (response.data || []).map(user => 
        transformUserDataForProfile(user)
      );
      
      return {
        data: transformedUsers,
        pagination: response.pagination || {},
        hasMore: response.pagination?.hasNextPage || false,
      };
    } catch (error) {
      console.error('Error fetching institution doctors:', error);
      throw error;
    }
  }

  // Utility methods
  getRegistrationEndpoint(userType) {
    switch (userType) {
      case USER_TYPES.PATIENT:
        return '/patients/register';
      case USER_TYPES.DOCTOR:
        return '/doctors/register';
      case USER_TYPES.INSTITUTION:
        return '/institutions/register';
      default:
        return ENDPOINTS.AUTH.REGISTER;
    }
  }

  validateUserData(userData, userType) {
    const commonRequired = ['email', 'password', 'firstName', 'lastName'];
    
    const typeSpecificRequired = {
      [USER_TYPES.PATIENT]: ['dateOfBirth', 'gender'],
      [USER_TYPES.DOCTOR]: ['medicalLicense', 'specializations'],
      [USER_TYPES.INSTITUTION]: ['institutionName', 'address', 'phoneNumber'],
    };

    const required = [...commonRequired, ...(typeSpecificRequired[userType] || [])];
    const missing = required.filter(field => !userData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    return true;
  }

  formatUserData(userData, userType) {
    const transformedData = transformUserDataForProfile(userData);
    const formatted = {
      ...transformedData,
      userType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Type-specific formatting
    switch (userType) {
      case USER_TYPES.PATIENT:
        formatted.patientId = `PAT_${Date.now()}`;
        break;
      case USER_TYPES.DOCTOR:
        formatted.doctorId = `DOC_${Date.now()}`;
        break;
      case USER_TYPES.INSTITUTION:
        formatted.institutionId = `INST_${Date.now()}`;
        break;
    }

    return formatted;
  }
}

export default new UserManagementService(); 