beforeAll(() => {
  jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterAll(() => {
  console.log.mockRestore();
});

import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
// Mock Firebase config file FIRST - this prevents the actual Firebase imports '@testing-library/react-native'
jest.mock('../../firebaseConfig', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-uid', email: 'test@example.com' } },
}));

// Mock Firebase functions BEFORE importing the component
jest.mock('firebase/firestore', () => ({
  onSnapshot: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  doc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: { uid: 'test-uid', email: 'test@example.com' },
  }),
}));

//import { useNotifications } from '../../context/NotificationContext';

jest.mock('../../context/NotificationContext', () => ({
  useNotifications: () => ({
    hasUnreadMessages: false,
  }),
}));

// Import Firebase functions from the mocked module
const { onSnapshot, getDocs } = require('firebase/firestore');
const { useRouter } = require('expo-router');


// Import your ContactsScreen component AFTER mocking
import ContactsScreen from '../../app/contacts';

const mockRouter = {
  push: jest.fn(),
};

describe('ContactsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial Render', () => {
    test('renders header with correct title and username', () => {
      // Mock empty contacts
      onSnapshot.mockImplementation((q, successCallback, errorCallback) => {
        if (errorCallback) {
            errorCallback({ code: 'permission-denied' });
        }
        return jest.fn(); // unsubscribe
        });

      render(<ContactsScreen />);

      expect(screen.getByText('Contacts')).toBeTruthy();
      expect(screen.getByText('test')).toBeTruthy(); // username from test@example.com
    });

    test('renders search input with correct placeholder', () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      expect(searchInput).toBeTruthy();
    });

    test('renders empty state when no contacts exist', () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      render(<ContactsScreen />);

      expect(screen.getByText('No conversations yet')).toBeTruthy();
      expect(screen.getByText('Search for friends above to start chatting')).toBeTruthy();
    });
  });

  describe('Search Functionality', () => {
    test('shows search results when typing in search input', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      // Mock search results
      getDocs.mockImplementation(() => Promise.resolve({
        docs: [
          {
            id: 'user1',
            data: () => ({
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com'
            })
          }
        ]
      }));

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      fireEvent.changeText(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeTruthy();
      });
    });

    test('shows loading state while searching', () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      // Mock slow search
      getDocs.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ docs: [] }), 1000)
      ));

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      fireEvent.changeText(searchInput, 'John');

      expect(screen.getByText('Searching...')).toBeTruthy();
    });

    test('shows no results message when search returns empty', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      getDocs.mockImplementation(() => Promise.resolve({ docs: [] }));

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      fireEvent.changeText(searchInput, 'NonexistentUser');

      await waitFor(() => {
        expect(screen.getByText('No users found')).toBeTruthy();
        expect(screen.getByText('Try searching with a different term')).toBeTruthy();
      });
    });

    test('clears search when X button is pressed', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      fireEvent.changeText(searchInput, 'John');

      // Wait for the clear button to appear
      await waitFor(() => {
        const clearButton = screen.getByTestId('clear-search');
        expect(clearButton).toBeTruthy();
      });

      const clearButton = screen.getByTestId('clear-search');
      fireEvent.press(clearButton);

      expect(searchInput.props.value).toBe('');
    });
  });

  describe('Contact Navigation', () => {
    test('navigates to chat when contact is pressed', async () => {
      // Mock contacts data
      const mockContacts = [
        {
          id: 'chat1',
          data: () => ({
            participants: ['test@example.com', 'friend@example.com'],
            lastMessage: 'Hello there',
            lastUpdated: { toDate: () => new Date() },
            lastMessageSender: 'friend@example.com'
          })
        }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockContacts });
        return jest.fn();
      });

      // Mock user lookup
      getDocs.mockImplementation(() => Promise.resolve({
        docs: [{
          data: () => ({
            firstName: 'Friend',
            lastName: 'User',
            email: 'friend@example.com'
          })
        }]
      }));

      render(<ContactsScreen />);

      await waitFor(() => {
        const contactItem = screen.getByText('Friend User');
        expect(contactItem).toBeTruthy();
      });

      const contactItem = screen.getByText('Friend User');
      fireEvent.press(contactItem.parent);

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/chat/[friendName]',
        params: { friendName: 'friend@example.com' }
      });
    });

    test('navigates to chat when search result is selected', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      getDocs.mockImplementation(() => Promise.resolve({
        docs: [{
          id: 'user1',
          data: () => ({
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com'
          })
        }]
      }));

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      fireEvent.changeText(searchInput, 'John');

      await waitFor(() => {
        const userItem = screen.getByText('John Doe');
        fireEvent.press(userItem.parent);
      });

      expect(mockRouter.push).toHaveBeenCalledWith({
        pathname: '/chat/[friendName]',
        params: { friendName: 'john@example.com' }
      });
    });

    test('navigates to profile when profile button is pressed', () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      render(<ContactsScreen />);

      const profileButton = screen.getByTestId('profile-button'); // You'll need to add testID
      fireEvent.press(profileButton);

      expect(mockRouter.push).toHaveBeenCalledWith('/profile');
    });
  });

  describe('Contact List Display', () => {
    test('displays contacts with correct information', async () => {
      const mockContacts = [
        {
          id: 'chat1',
          data: () => ({
            participants: ['test@example.com', 'friend@example.com'],
            lastMessage: 'Hello there',
            lastUpdated: { toDate: () => new Date() },
            lastMessageSender: 'friend@example.com'
          })
        }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockContacts });
        return jest.fn();
      });

      getDocs.mockImplementation(() => Promise.resolve({
        docs: [{
          data: () => ({
            firstName: 'Friend',
            lastName: 'User',
            email: 'friend@example.com'
          })
        }]
      }));

      render(<ContactsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Friend User')).toBeTruthy();
        expect(screen.getByText('Hello there')).toBeTruthy();
      });
    });

    test('shows "You:" prefix for messages sent by current user', async () => {
      const mockContacts = [
        {
          id: 'chat1',
          data: () => ({
            participants: ['test@example.com', 'friend@example.com'],
            lastMessage: 'Hello there',
            lastUpdated: { toDate: () => new Date() },
            lastMessageSender: 'test@example.com' // Current user sent this
          })
        }
      ];

      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: mockContacts });
        return jest.fn();
      });

      getDocs.mockImplementation(() => Promise.resolve({
        docs: [{
          data: () => ({
            firstName: 'Friend',
            lastName: 'User',
            email: 'friend@example.com'
          })
        }]
      }));

      render(<ContactsScreen />);

      await waitFor(() => {
        expect(screen.getByText('You: Hello there')).toBeTruthy();
      });
    });
  });

  describe('Error Handling', () => {
    test('handles Firebase errors gracefully', () => {
        onSnapshot.mockImplementation((q, successCallback, errorCallback) => {
            if (errorCallback) {
            errorCallback({ code: 'permission-denied' });
            }
            return jest.fn();
        });

        render(<ContactsScreen />);

        expect(screen.getByText('Contacts')).toBeTruthy(); // fallback UI
        }); 

    test('handles search errors gracefully', async () => {
      onSnapshot.mockImplementation((query, callback) => {
        callback({ docs: [] });
        return jest.fn();
      });

      getDocs.mockImplementation(() => Promise.reject(new Error('Search failed')));

      render(<ContactsScreen />);

      const searchInput = screen.getByPlaceholderText('Search for friends...');
      fireEvent.changeText(searchInput, 'John');

      await waitFor(() => {
        // Should not crash and should show no results
        expect(screen.getByText('No users found')).toBeTruthy();
      });
    });
  });
});