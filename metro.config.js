// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Add support for additional asset extensions
config.resolver.assetExts.push(
  'png',
  'jpg',
  'jpeg',
  'gif',
  'svg'
);

// Configure source extensions
config.resolver.sourceExts.push(
  'jsx',
  'js',
  'ts',
  'tsx'
);

module.exports = config; 