import Constants from 'expo-constants';

const extra = (Constants.expoConfig || Constants.manifest)?.extra || {};

export const ENV = {
  API_URL: extra.API_URL || 'https://care-point-api-1.onrender.com',
  X_API_KEY: extra.X_API_KEY || undefined,
};

export const isDevelopment = () => __DEV__;
