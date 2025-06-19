import { telnyxConfig, ENV } from './env';

// Note: These environment variables are now loaded from env.js
// For production builds, you'll configure real Telnyx credentials in app.json

export const TelnyxConfig = {
  // SIP Credentials (from env.js)
  sipUser: telnyxConfig.sipUser,
  sipPassword: telnyxConfig.sipPassword,
  apiKey: telnyxConfig.apiKey,
  
  // Debug mode for call quality monitoring
  debug: telnyxConfig.debug,
  
  // Development mode flag
  isDevelopment: ENV.IS_DEVELOPMENT || telnyxConfig.sipUser === 'dev_user',
  
  // Default configuration
  defaultCallerName: 'Professional',
  
  // Audio/Video settings
  audioSettings: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true
  },
  
  videoSettings: {
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: 'user' // 'user' for front camera, 'environment' for back camera
  },
  
  // Call settings
  callSettings: {
    maxCallDuration: 3600, // 1 hour in seconds
    enableCallRecording: false,
    enableCallQualityMonitoring: true
  },
  
  // Push notification settings
  pushSettings: {
    enablePushNotifications: true,
    soundFile: 'default', // or path to custom sound file
    vibrationPattern: [1000, 1000, 1000]
  },
  
  // Development settings
  developmentSettings: {
    simulateIncomingCalls: true,
    callAnswerDelay: 3000, // milliseconds
    enableCallQualitySimulation: true
  }
};

export const validateTelnyxConfig = () => {
  // In development mode, validation is more lenient
  if (TelnyxConfig.isDevelopment) {
    console.log('TelnyxConfig: Running in development/simulation mode');
    return true;
  }
  
  const errors = [];
  
  if (!TelnyxConfig.sipUser || TelnyxConfig.sipUser === 'dev_user') {
    errors.push('TELNYX_SIP_USER is required for production');
  }
  
  if (!TelnyxConfig.sipPassword || TelnyxConfig.sipPassword === 'dev_password') {
    errors.push('TELNYX_SIP_PASSWORD is required for production');
  }
  
  if (!TelnyxConfig.apiKey || TelnyxConfig.apiKey === 'dev_api_key') {
    errors.push('TELNYX_API_KEY is required for production');
  }
  
  if (errors.length > 0) {
    console.warn(`Telnyx configuration warnings: ${errors.join(', ')}`);
    console.log('Continuing in development mode...');
    return true;
  }
  
  return true;
};

export const getTelnyxInitConfig = (pushToken = null) => {
  validateTelnyxConfig();
  
  return {
    sipUser: TelnyxConfig.sipUser,
    sipPassword: TelnyxConfig.sipPassword,
    pushToken: pushToken,
    debug: TelnyxConfig.debug,
    callerName: TelnyxConfig.defaultCallerName,
    audioSettings: TelnyxConfig.audioSettings,
    videoSettings: TelnyxConfig.videoSettings,
    isSimulation: TelnyxConfig.isDevelopment
  };
};

export default TelnyxConfig; 