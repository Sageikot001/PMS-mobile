import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = {
  ACCESS_TOKEN: '@pms_access_token',
  REFRESH_TOKEN: '@pms_refresh_token',
  ACCESS_EXPIRES_AT: '@pms_access_expires_at',
  USER: '@pms_user',
};

export const AuthUtils = {
  // Read the current access token from storage
  getAccessToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  },

  // Read the current refresh token from storage
  getRefreshToken: async () => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEY.REFRESH_TOKEN);
    } catch {
      return null;
    }
  },

  // Stores tokens and computes absolute expiry time from seconds
  storeTokens: async ({ accessToken, refreshToken, expiresIn }) => {
    try {
      const now = Date.now();
      const expiresAt = now + Math.max(0, expiresIn || 0) * 1000;
      await AsyncStorage.multiSet([
        [STORAGE_KEY.ACCESS_TOKEN, accessToken || ''],
        [STORAGE_KEY.REFRESH_TOKEN, refreshToken || ''],
        [STORAGE_KEY.ACCESS_EXPIRES_AT, String(expiresAt)],
      ]);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  },

  // Clear all token related state
  clearTokens: async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY.ACCESS_TOKEN,
        STORAGE_KEY.REFRESH_TOKEN,
        STORAGE_KEY.ACCESS_EXPIRES_AT,
      ]);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  // Save the current authenticated user (optional, useful in UI)
  setUser: async (user) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY.USER,
        JSON.stringify(user || null)
      );
    } catch (error) {
      console.error('Error setting user:', error);
    }
  },

  //Read the current user
  getUser: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY.USER);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },
  // Convenience for user id if present
  getUserId: async () => {
    const user = await AuthUtils.getUser();
    return user?._id || user?.id || null;
  },

  //Returns true if no expiry set or already past
  isTokenExpired: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY.ACCESS_EXPIRES_AT);
      if (!raw) return true;
      const expiresAt = Number(raw);
      return !expiresAt || Date.now() >= expiresAt;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return true;
    }
  },

  //return true if expiry is within the next minute
  shouldRefreshToken: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY.ACCESS_EXPIRES_AT);
      if (!raw) return true;
      const expiresAt = Number(raw);
      const marginMs = 60_000;
      return Date.now() >= expiresAt - marginMs;
    } catch (error) {
      console.error('Error checking token expiry:', error);
      return false;
    }
  },
};
