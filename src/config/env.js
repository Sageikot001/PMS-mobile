import Constants from 'expo-constants';

// Get environment variables from Expo configuration or use fallbacks
const getEnvVariable = (key, fallback = null) => {
  // Try to get from Expo Constants first
  if (Constants.expoConfig?.extra?.[key]) {
    return Constants.expoConfig.extra[key];
  }
  
  // Try to get from manifest (for published apps)
  if (Constants.manifest?.extra?.[key]) {
    return Constants.manifest.extra[key];
  }
  
  // Use fallback value
  return fallback;
};

// Payment Service Keys
export const paystackPublicKey = getEnvVariable(
  'PAYSTACK_PUBLIC_KEY', 
  'pk_test_3dc9e07411801bf934aba4e41abdabb5d6d10599'
);

export const flutterwavePublicKey = getEnvVariable(
  'FLUTTERWAVE_PUBLIC_KEY', 
  'FLWPUBK_TEST_dummy_key'
);

// Telnyx Configuration
export const telnyxConfig = {
  sipUser: getEnvVariable('TELNYX_SIP_USER', 'dev_user'),
  sipPassword: getEnvVariable('TELNYX_SIP_PASSWORD', 'dev_password'),
  apiKey: getEnvVariable('TELNYX_API_KEY', 'dev_api_key'),
  debug: getEnvVariable('TELNYX_DEBUG', 'true') === 'true',
};

// Function to check if we're in development or production environment
export const isDevelopment = () => {
  return __DEV__;
};

// Export all environment variables for easy access
export const ENV = {
  // Payment Services
  PAYSTACK_PUBLIC_KEY: paystackPublicKey,
  FLUTTERWAVE_PUBLIC_KEY: flutterwavePublicKey,
  
  // Telnyx
  TELNYX_SIP_USER: telnyxConfig.sipUser,
  TELNYX_SIP_PASSWORD: telnyxConfig.sipPassword,
  TELNYX_API_KEY: telnyxConfig.apiKey,
  TELNYX_DEBUG: telnyxConfig.debug,
  
  // Environment
  IS_DEVELOPMENT: isDevelopment(),
  NODE_ENV: isDevelopment() ? 'development' : 'production',
};

console.log('Environment loaded:', {
  paystack: paystackPublicKey ? 'configured' : 'missing',
  flutterwave: flutterwavePublicKey ? 'configured' : 'missing',
  telnyx: telnyxConfig.sipUser !== 'dev_user' ? 'configured' : 'using_defaults',
  environment: ENV.NODE_ENV
}); 