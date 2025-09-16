import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    API_URL:
      process.env.api_url ||
      process.env.API_URL ||
      'https://care-point-api-1.onrender.com',
    X_API_KEY: process.env.x_api_key || process.env.X_API_KEY || undefined,
  },
  runtimeVersion: { policy: 'sdkVersion' },
});
