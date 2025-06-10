module.exports = {
  preset: 'jest-expo',
  setupFiles: [
    // Polyfills here
    './jest-setup-polyfills.js'  // we'll split polyfills into this file
  ],
  setupFilesAfterEnv: [
    './jest-setup-after-env.js' // for jest-native matchers import
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-navigation|expo(nent)?|@expo(nent)?|react-native-vector-icons|@react-native|@react-native-community|@expo/vector-icons|firebase|@firebase)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'jsdom',
};
