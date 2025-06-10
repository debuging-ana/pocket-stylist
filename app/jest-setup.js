import '@testing-library/jest-native/extend-expect';

// Mock Firebase - make sure the path matches what you're actually importing
jest.mock('../firebaseConfig', () => ({
  db: {},
  auth: {},
}));

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-uid', email: 'test@example.com' }
  })),
}));

// Mock Firebase Firestore - enhanced with better mock behavior
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  onSnapshot: jest.fn((query, callback) => {
    // Mock an empty snapshot by default
    const mockSnapshot = {
      docs: [],
      forEach: jest.fn(),
      empty: true,
      size: 0
    };
    
    // Call the callback immediately with mock data
    if (callback) {
      setTimeout(() => callback(mockSnapshot), 0);
    }
    
    // Return unsubscribe function
    return jest.fn();
  }),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    docs: [],
    forEach: jest.fn(),
    empty: true,
    size: 0
  })),
  doc: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() => Promise.resolve({
    exists: () => false,
    data: () => null,
    id: 'mock-doc-id'
  })),
}));

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
}));

// Mock Expo Vector Icons
jest.mock('@expo/vector-icons/Feather', () => 'Feather');

// Mock React Native components
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  return {
    ...ReactNative,
    StatusBar: 'StatusBar',
  };
});

// Mock context providers - adjust paths as needed
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-uid', email: 'test@example.com' }
  }),
}));

jest.mock('../context/NotificationContext', () => ({
  useNotifications: () => ({
    hasUnreadMessages: {}
  }),
}));

// Mock components - adjust paths as needed
jest.mock('../components/NotificationBadge', () => 'NotificationBadge');

// Mock responsive utils - adjust path as needed
jest.mock('../utils/responsive', () => ({
  scaleSize: (size) => size,
  scaleWidth: (width) => width,
  scaleHeight: (height) => height,
  scaleFontSize: (size) => size,
  scaleSpacing: (spacing) => spacing,
}));