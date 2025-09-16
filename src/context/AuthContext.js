import React, {
  createContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  useContext,
} from 'react';
import { AuthUtils } from '../lib/auth-utils';
import { authApi, profileAPI } from '../lib/api';

export const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isLoading: false,
  error: '',
  login: async (_email, _password) => {},
  register: async (_payload) => {},
  logout: async () => {},
  refreshProfile: async () => {},
  forgotPassword: async (_email) => {},
  resetPassword: async (_token, _password) => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const bootstrap = useCallback(async () => {
    try {
      const token = await AuthUtils.getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }
      const res = await profileAPI.me();
      setUser(res?.data?.data ?? null);
    } catch (_) {
      await AuthUtils.clearTokens();
      setUser(null);
    } finally {
      setIsBootstrapping(false);
    }
  }, []);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // inside AuthProvider

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      const data = res?.data?.data;
      const tokens = data?.tokens;
      const userPayload = data?.user;

      if (tokens?.accessToken && tokens?.refreshToken) {
        await AuthUtils.storeTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn:
            typeof tokens.accessTokenExpiresIn === 'number'
              ? tokens.accessTokenExpiresIn
              : 0,
        });
        setUser(userPayload ?? null);
        return userPayload;
      }
      throw new Error(res?.data?.message || 'Invalid login response');
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Login failed. Please try again.'
      );
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await authApi.signup(payload);
      const data = res?.data?.data;
      const tokens = data?.tokens;
      const userPayload = data?.user;

      if (tokens?.accessToken && tokens?.refreshToken) {
        await AuthUtils.storeTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn:
            typeof tokens.accessTokenExpiresIn === 'number'
              ? tokens.accessTokenExpiresIn
              : 0,
        });
        setUser(userPayload ?? null);
        return userPayload;
      }
      throw new Error(res?.data?.message || 'Invalid signup response');
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          'Signup failed. Please try again.'
      );
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      try {
        await authApi.logout();
      } catch (_) {}
      await AuthUtils.clearTokens();
      setUser(null);
    } catch (e) {
      setError(e?.message || 'Logout failed.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await profileAPI.me();
      const next = res?.data?.data ?? null;
      setUser(next);
      return next;
    } catch (e) {
      setError(e?.message || 'Failed to refresh profile.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      return true;
    } catch (e) {
      setError(e?.message || 'Failed to send reset email.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token, password) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.resetPassword(token, password);
      return true;
    } catch (e) {
      setError(e?.message || 'Failed to reset password.');
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      forgotPassword,
      resetPassword,
    }),
    [
      user,
      isBootstrapping,
      isLoading,
      error,
      login,
      register,
      logout,
      refreshProfile,
      forgotPassword,
      resetPassword,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
