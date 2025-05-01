import { isDevelopment } from './env';

// Define API URLs for different environments
const DEV_API_URL = 'http://localhost:3000/api';
const PROD_API_URL = 'https://carepoint-api.yourdomain.com/api'; // Replace with your production API URL

// Export the appropriate API URL based on environment
export const API_URL = isDevelopment() ? DEV_API_URL : PROD_API_URL;

// API endpoints
export const ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/login/basic',
    REGISTER: '/signup/basic',
    LOGOUT: '/logout',
    REFRESH_TOKEN: '/token/refresh',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/password',
  },
  
  // User profile endpoints
  PROFILE: {
    GET: '/profile/my',
    UPDATE: '/profile',
    UPLOAD_PHOTO: '/profile/photo',
  },
  
  // Health metrics endpoints
  HEALTH: {
    GET_METRICS: '/health/metrics',
    ADD_METRIC: '/health/metrics',
    UPDATE_METRIC: '/health/metrics',
    DELETE_METRIC: '/health/metrics',
    
    // Medication management
    MEDICATIONS: '/health/medications',
    MEDICATION_DETAILS: (id) => `/health/medications/${id}`,
    
    // Condition management
    CONDITIONS: '/health/conditions',
    CONDITION_DETAILS: (id) => `/health/conditions/${id}`,
  },
  
  // Order endpoints
  ORDERS: {
    LIST: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    CREATE: '/orders',
    CANCEL: (id) => `/orders/${id}/cancel`,
  },
  
  // Pharmacy endpoints
  PHARMACY: {
    LIST: '/pharmacies',
    DETAILS: (id) => `/pharmacies/${id}`,
    DRUGS: '/drugs',
    DRUG_DETAILS: (id) => `/drugs/${id}`,
  },
  
  // Consultation endpoints
  CONSULTATION: {
    LIST: '/consultations',
    BOOK: '/consultations',
    CANCEL: (id) => `/consultations/${id}/cancel`,
    PROFESSIONALS: '/professionals',
    PROFESSIONAL_DETAILS: (id) => `/professionals/${id}`,
  },
  
  // Wallet endpoints
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    TOP_UP: '/wallet/topup',
    WITHDRAW: '/wallet/withdraw',
  },
};

export default {
  API_URL,
  ENDPOINTS,
}; 