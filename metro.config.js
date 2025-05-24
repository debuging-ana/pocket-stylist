const { getDefaultConfig } = require("expo/metro-config"); //imports the default metro bundler config for expo

const config = getDefaultConfig(__dirname);
config.resolver.sourceExts.push('cjs');
config.resolver.unstable_enablePackageExports = false;

module.exports = config; //applies that config to the root of our project
