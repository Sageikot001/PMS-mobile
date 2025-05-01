import React, { createContext, useState, useEffect, useContext } from 'react';
import * as AuthService from '../services/AuthService';
import { ActivityIndicator, View } from 'react-native';

// Create the Auth Context
const AuthContext = createContext();

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial check for existing auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const isAuth = await AuthService.isAuthenticated();
        
        if (isAuth) {
          // Get user data from storage
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            setUser(userData);
          } else {
            // Get fresh user data if available in storage but no user object
            try {
              const freshUserData = await AuthService.getUserProfile();
              setUser(freshUserData);
            } catch (profileError) {
              // If we can't get fresh data, log the user out
              await AuthService.logout();
            }
          }
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
        setError('Failed to initialize authentication');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.login(email, password);
      setUser(result.user);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.register(userData);
      return result;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setLoading(true);
      await AuthService.logout();
      setUser(null);
    } catch (e) {
      console.error('Logout error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Get profile data
  const refreshProfile = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userData = await AuthService.getUserProfile();
      setUser(userData);
      return userData;
    } catch (e) {
      console.error('Profile refresh error:', e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Update profile data
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const updatedUser = await AuthService.updateUserProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (e) {
      console.error('Profile update error:', e);
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  // The context value that will be provided
  const authContextValue = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    isLoggedIn: !!user,
  };

  // If we're in the initial loading state, show a loader
  if (loading && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 