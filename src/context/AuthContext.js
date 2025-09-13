import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userData } from '../data/dummyUser';
import { AppointmentService } from '../lib/api';

const AuthContext = createContext({});

const AUTH_STORAGE_KEY = '@auth_token';
const USER_STORAGE_KEY = '@user_data';

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Initialize appointment service when user changes
  useEffect(() => {
    if (user) {
      initializeAppointmentService();
    }
  }, [user]);

  const initializeAppointmentService = async () => {
    try {
      await AppointmentService.initialize(user, 'patient');
      console.log(`📅 Appointment service initialized for patient:`, user.name);
    } catch (error) {
      console.error('Error initializing appointment service:', error);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const [token, storedUser] = await Promise.all([
        AsyncStorage.getItem(AUTH_STORAGE_KEY),
        AsyncStorage.getItem(USER_STORAGE_KEY),
      ]);

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        setAuthToken(token);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        // No auto-login - user should start at roles selection
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check credentials - only allow patient login
      let loginUser = null;
      
      if (email === userData.patient.email) {
        loginUser = userData.patient;
      } else {
        throw new Error('Invalid credentials');
      }

      const token = `demo_token_${Date.now()}`;
      
      // Store auth data
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, token),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loginUser)),
      ]);

      setAuthToken(token);
      setUser(loginUser);
      setIsLoggedIn(true);

      return { success: true, user: loginUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginAsPatient = async () => {
    try {
      const patientUser = userData.patient;
      const token = `demo_token_patient_${Date.now()}`;
      
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, token),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(patientUser)),
      ]);

      setAuthToken(token);
      setUser(patientUser);
      setIsLoggedIn(true);

      console.log('🔐 Auto-logged in as Sageikot (Patient)');
      return { success: true, user: patientUser };
    } catch (error) {
      console.error('Error logging in as patient:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(USER_STORAGE_KEY),
      ]);

      setAuthToken(null);
      setUser(null);
      setIsLoggedIn(false);

      console.log('🔐 User logged out');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Force complete logout - clears everything and returns to auth
  const forceLogout = async () => {
    try {
      setLoading(true);
      
      // Clear all possible auth storage keys
      await Promise.all([
        AsyncStorage.removeItem(AUTH_STORAGE_KEY),
        AsyncStorage.removeItem(USER_STORAGE_KEY),
        AsyncStorage.removeItem('@current_role'), // Doctor role key
        AsyncStorage.removeItem('@doctor_data'), // Doctor data key
        AsyncStorage.removeItem('@user_data'), // User data key
        AsyncStorage.removeItem('@appointments'), // Appointments data
        AsyncStorage.removeItem('@appointment_notifications'), // Notifications
        AsyncStorage.removeItem('scheduledNotifications'), // Scheduled notifications
        AsyncStorage.removeItem('sentNotifications'), // Sent notifications
        AsyncStorage.removeItem('notificationHistory'), // Notification history
      ]);

      // Reset all auth state
      setAuthToken(null);
      setUser(null);
      setIsLoggedIn(false);

      console.log('🔐 Complete logout - returning to auth flow');
    } catch (error) {
      console.error('Force logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, automatically log in the new user as a patient
      const newUser = {
        ...userData,
        _id: `user_${Date.now()}`,
        id: `user_${Date.now()}`,
        roles: ['PATIENT'],
        userType: 'patient',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const token = `demo_token_${Date.now()}`;
      
      await Promise.all([
        AsyncStorage.setItem(AUTH_STORAGE_KEY, token),
        AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser)),
      ]);

      setAuthToken(token);
      setUser(newUser);
      setIsLoggedIn(true);

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      
      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    // Auth state
    isLoggedIn,
    user,
    loading,
    authToken,
    
    // Auth methods
    login,
    loginAsPatient,
    logout,
    forceLogout,
    register,
    updateProfile,
    
    // User data
    userData,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 