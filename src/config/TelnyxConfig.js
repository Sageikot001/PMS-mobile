// src/config/TelnyxConfig.js
import Constants from 'expo-constants';
import { isDevelopment } from './env';

const extra = (Constants.expoConfig || Constants.manifest)?.extra || {};
// Expect TELNYX to be provided via app.config.js extra (non-secret or dev-only)
const telnyxExtra = extra.TELNYX || {};

const SIM_DEFAULTS = {
  sipUser: 'dev_user',
  sipPassword: 'dev_password',
  apiKey: 'dev_api_key',
  debug: true,
};

const resolved = {
  sipUser: telnyxExtra.sipUser || SIM_DEFAULTS.sipUser,
  sipPassword: telnyxExtra.sipPassword || SIM_DEFAULTS.sipPassword,
  apiKey: telnyxExtra.apiKey || SIM_DEFAULTS.apiKey,
  debug:
    typeof telnyxExtra.debug === 'boolean'
      ? telnyxExtra.debug
      : SIM_DEFAULTS.debug,
};

export const TelnyxConfig = {
  sipUser: resolved.sipUser,
  sipPassword: resolved.sipPassword,
  apiKey: resolved.apiKey,

  debug: resolved.debug,

  // Use app dev mode (or fall back to simulation if using dev defaults)
  isDevelopment: isDevelopment() || resolved.sipUser === SIM_DEFAULTS.sipUser,

  defaultCallerName: 'Professional',

  audioSettings: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },

  videoSettings: {
    width: 1280,
    height: 720,
    frameRate: 30,
    facingMode: 'user',
  },

  callSettings: {
    maxCallDuration: 3600,
    enableCallRecording: false,
    enableCallQualityMonitoring: true,
  },

  pushSettings: {
    enablePushNotifications: true,
    soundFile: 'default',
    vibrationPattern: [1000, 1000, 1000],
  },

  developmentSettings: {
    simulateIncomingCalls: true,
    callAnswerDelay: 3000,
    enableCallQualitySimulation: true,
  },
};

export const validateTelnyxConfig = () => {
  if (TelnyxConfig.isDevelopment) {
    console.log('TelnyxConfig: Development/simulation mode');
    return true;
  }
  const errors = [];
  if (!TelnyxConfig.sipUser || TelnyxConfig.sipUser === SIM_DEFAULTS.sipUser) {
    errors.push('TELNYX_SIP_USER is required for production');
  }
  if (
    !TelnyxConfig.sipPassword ||
    TelnyxConfig.sipPassword === SIM_DEFAULTS.sipPassword
  ) {
    errors.push('TELNYX_SIP_PASSWORD is required for production');
  }
  if (!TelnyxConfig.apiKey || TelnyxConfig.apiKey === SIM_DEFAULTS.apiKey) {
    errors.push('TELNYX_API_KEY is required for production');
  }
  if (errors.length) {
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
    pushToken,
    debug: TelnyxConfig.debug,
    callerName: TelnyxConfig.defaultCallerName,
    audioSettings: TelnyxConfig.audioSettings,
    videoSettings: TelnyxConfig.videoSettings,
    isSimulation: TelnyxConfig.isDevelopment,
  };
};

export default TelnyxConfig;
