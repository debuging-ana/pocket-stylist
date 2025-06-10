module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest-setup.js'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)': 'babel-jest'
  },
  transformIgnorePatterns: [
    // Add firebase and @firebase to the list of modules to transform
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-clone-referenced-element|@react-native-picker|react-native-super-grid|react-native-animatable|react-native-collapsible|react-native-vector-icons|firebase|@firebase/.*)',
  ],
  testMatch: [
    '**/__tests__/**/*.(js|jsx|ts|tsx)',
    '**/*.(test|spec).(js|jsx|ts|tsx)'
  ],
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/metro.config.js',
    '!**/.expo/**',
  ],
  moduleNameMapping: {
    '^../(.*)$': '<rootDir>/$1',
  },
  testEnvironment: 'jsdom',
};