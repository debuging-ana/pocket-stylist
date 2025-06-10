// Polyfill for setImmediate / clearImmediate (needed for some React Native libraries in Jest)
global.setImmediate = global.setImmediate || ((fn, ...args) => setTimeout(fn, 0, ...args));
global.clearImmediate = global.clearImmediate || ((id) => clearTimeout(id));

// Extend Jest matchers for React Native
import '@testing-library/jest-native/extend-expect';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  }),
  Link: ({ children, href, asChild, ...props }) => {
    if (asChild && children) {
      return children;
    }
    return children;
  },
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

// Mock Firebase - adjust path to match your project structure
jest.mock('./firebaseConfig', () => ({
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        profilePhotoUri: null,
        firstName: 'Test User',
      }),
    })
  ),
}));

// Mock contexts - adjust paths to match your project structure
jest.mock('./context/wardrobeContext', () => ({
  useWardrobe: jest.fn(() => ({
    wardrobeItems: [],
  })),
}));

jest.mock('./context/AuthContext', () => ({
  useAuth: jest.fn(() => ({
    user: {
      uid: 'test-uid',
      email: 'test@example.com',
    },
  })),
}));

// Mock responsive utils - adjust path to match your project structure
jest.mock('./utils/responsive', () => ({
  scaleSize: jest.fn((size) => size),
  scaleWidth: jest.fn((width) => width),
  scaleHeight: jest.fn((height) => height),
  scaleFontSize: jest.fn((size) => size),
  scaleSpacing: jest.fn((spacing) => spacing),
  deviceWidth: 375,
  getTwoColumnWidth: jest.fn(() => 150),
}));

// Mock images - adjust paths to match your project structure
jest.mock('./assets/images/pants.png', () => 'pants-image');
jest.mock('./assets/images/jacket.png', () => 'jacket-image');

// Global mocks
global.__DEV__ = true;
