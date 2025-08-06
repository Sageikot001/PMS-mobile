// Backend Configuration
// Update these values based on your backend deployment

const BACKEND_CONFIG = {
  // Development
  DEVELOPMENT: {
    BASE_URL: 'http://localhost:3000/api',
    SOCKET_URL: 'http://localhost:3000',
  },
  
  // Production (update with your actual production URLs)
  PRODUCTION: {
    BASE_URL: 'https://your-backend-domain.com/api',
    SOCKET_URL: 'https://your-backend-domain.com',
  },
  
  // Staging (if needed)
  STAGING: {
    BASE_URL: 'https://staging.your-backend-domain.com/api',
    SOCKET_URL: 'https://staging.your-backend-domain.com',
  }
};

// Environment detection
const getEnvironment = () => {
  // You can set this based on your build configuration
  // For now, defaulting to development
  return __DEV__ ? 'DEVELOPMENT' : 'PRODUCTION';
};

// Export current environment config
export const getBackendConfig = () => {
  const env = getEnvironment();
  return BACKEND_CONFIG[env];
};

// Export individual configs for direct access
export const API_BASE_URL = getBackendConfig().BASE_URL;
export const SOCKET_URL = getBackendConfig().SOCKET_URL;

// API Endpoints
export const API_ENDPOINTS = {
  APPOINTMENTS: '/appointments',
  USERS: '/users',
  NOTIFICATIONS: '/notifications',
  AUTH: '/auth',
  HEALTH: '/health',
};

// Default export
export default {
  API_BASE_URL,
  SOCKET_URL,
  API_ENDPOINTS,
  getBackendConfig,
}; 