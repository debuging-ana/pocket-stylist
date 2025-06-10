// __tests__/WardrobeScreen.test.js
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WardrobeScreen from '../app/wardrobe'; 
import { useWardrobe } from '../context/wardrobeContext';
import { useAuth } from '../context/AuthContext';

// Mock expo-router with jest.fn()
const mockPush = jest.fn();
const mockUseRouter = {
  push: mockPush,
  replace: jest.fn(),
  back: jest.fn(),
};

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => mockUseRouter),
  Link: ({ children, href, asChild }) => {
    // Import React inside the function to avoid scope issues
    const React = require('react');
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        onPress: () => console.log(`Navigate to ${href}`),
      });
    }
    return children;
  },
}));

// Mock the contexts
jest.mock('../context/wardrobeContext');
jest.mock('../context/AuthContext');

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
}));

jest.mock('../firebaseConfig', () => ({
  db: {},
}));

// Mock responsive utils
jest.mock('../utils/responsive', () => ({
  scaleSize: jest.fn((size) => size),
  scaleWidth: jest.fn((width) => width),
  scaleHeight: jest.fn((height) => height),
  scaleFontSize: jest.fn((size) => size),
  scaleSpacing: jest.fn((spacing) => spacing),
  deviceWidth: 375,
  getTwoColumnWidth: jest.fn(() => 150),
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
  Feather: 'Feather',
  MaterialCommunityIcons: 'MaterialCommunityIcons',
}));

describe('WardrobeScreen Search Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default auth mock
    useAuth.mockReturnValue({
      user: {
        uid: 'test-uid',
        email: 'test@example.com'
      }
    });
  });

  describe('Search with results', () => {
    beforeEach(() => {
      // Mock wardrobe with items that include "shirt"
      useWardrobe.mockReturnValue({
        wardrobeItems: [
          {
            id: '1',
            name: 'Blue Shirt',
            category: 'tops',
            imageUri: 'https://example.com/shirt1.jpg'
          },
          {
            id: '2',
            name: 'Red T-shirt',
            category: 'tops',
            imageUri: 'https://example.com/shirt2.jpg'
          },
          {
            id: '3',
            name: 'Black Pants',
            category: 'bottoms',
            imageUri: 'https://example.com/pants.jpg'
          }
        ]
      });
    });

    it('should display only items with "shirt" in their name when searching for "shirt"', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      // Type "shirt" in the search bar
      fireEvent.changeText(searchInput, 'shirt');
      
      // Wait for the search results to be displayed
      await waitFor(() => {
        // Should show items with "shirt" in the name
        expect(getByText('Blue Shirt')).toBeTruthy();
        expect(getByText('Red T-shirt')).toBeTruthy();
        
        // Should NOT show items without "shirt" in the name
        expect(queryByText('Black Pants')).toBeNull();
      });
    });

    it('should search by category as well as name', async () => {
      const { getByPlaceholderText, getByText, queryByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      // Search for "tops" category
      fireEvent.changeText(searchInput, 'tops');
      
      await waitFor(() => {
        // Should show items in "tops" category
        expect(getByText('Blue Shirt')).toBeTruthy();
        expect(getByText('Red T-shirt')).toBeTruthy();
        
        // Should NOT show items in other categories
        expect(queryByText('Black Pants')).toBeNull();
      });
    });

    it('should be case insensitive when searching', async () => {
      const { getByPlaceholderText, getByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      // Search with different case
      fireEvent.changeText(searchInput, 'SHIRT');
      
      await waitFor(() => {
        expect(getByText('Blue Shirt')).toBeTruthy();
        expect(getByText('Red T-shirt')).toBeTruthy();
      });
    });

    it('should clear search results when search query is empty', async () => {
      const { getByPlaceholderText, queryByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      // First search for something
      fireEvent.changeText(searchInput, 'shirt');
      
      await waitFor(() => {
        expect(queryByText('Blue Shirt')).toBeTruthy();
      });
      
      // Clear the search
      fireEvent.changeText(searchInput, '');
      
      await waitFor(() => {
        // Search results should be hidden when query is empty
        expect(queryByText('Blue Shirt')).toBeNull();
      });
    });
  });

  describe('Search with no results', () => {
    beforeEach(() => {
      // Mock wardrobe without jackets
      useWardrobe.mockReturnValue({
        wardrobeItems: [
          {
            id: '1',
            name: 'Blue Shirt',
            category: 'tops',
            imageUri: 'https://example.com/shirt.jpg'
          },
          {
            id: '2',
            name: 'Black Pants',
            category: 'bottoms',
            imageUri: 'https://example.com/pants.jpg'
          }
        ]
      });
    });

    it('should display "No matching items found" when searching for "jacket" with no jackets in wardrobe', async () => {
      const { getByPlaceholderText, getByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      // Search for "jacket" when user doesn't own any
      fireEvent.changeText(searchInput, 'jacket');
      
      await waitFor(() => {
        expect(getByText('No matching items found')).toBeTruthy();
      });
    });

    it('should display "No matching items found" for any search with no results', async () => {
      const { getByPlaceholderText, getByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      // Search for something that doesn't exist
      fireEvent.changeText(searchInput, 'nonexistent item');
      
      await waitFor(() => {
        expect(getByText('No matching items found')).toBeTruthy();
      });
    });
  });

  describe('Empty wardrobe', () => {
    beforeEach(() => {
      // Mock empty wardrobe
      useWardrobe.mockReturnValue({
        wardrobeItems: []
      });
    });

    it('should display "No matching items found" when wardrobe is empty', async () => {
      const { getByPlaceholderText, getByText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      fireEvent.changeText(searchInput, 'anything');
      
      await waitFor(() => {
        expect(getByText('No matching items found')).toBeTruthy();
      });
    });
  });

  describe('Search input behavior', () => {
    beforeEach(() => {
      useWardrobe.mockReturnValue({
        wardrobeItems: [
          {
            id: '1',
            name: 'Test Item',
            category: 'tops',
            imageUri: 'https://example.com/test.jpg'
          }
        ]
      });
    });

    it('should render search input with correct placeholder', () => {
      const { getByPlaceholderText } = render(<WardrobeScreen />);
      
      expect(getByPlaceholderText('Search your style archive...')).toBeTruthy();
    });

    it('should update search input value when typing', () => {
      const { getByPlaceholderText } = render(<WardrobeScreen />);
      
      const searchInput = getByPlaceholderText('Search your style archive...');
      
      fireEvent.changeText(searchInput, 'test query');
      
      expect(searchInput.props.value).toBe('test query');
    });
  });

  describe('Action buttons', () => {
    beforeEach(() => {
      useWardrobe.mockReturnValue({
        wardrobeItems: []
      });
    });

    it('should render Add Item button and handle press', () => {
      const { getByText } = render(<WardrobeScreen />);
      
      const addItemButton = getByText('Add Item');
      expect(addItemButton).toBeTruthy();
      
      fireEvent.press(addItemButton);
      expect(mockPush).toHaveBeenCalledWith('/wardrobe/add-item');
    });

    it('should render Outfit button and handle press', () => {
      const { getByText } = render(<WardrobeScreen />);
      
      const outfitButton = getByText('Outfit');
      expect(outfitButton).toBeTruthy();
      
      fireEvent.press(outfitButton);
      expect(mockPush).toHaveBeenCalledWith('/wardrobe/add-outfit');
    });

    it('should render See Outfits button and handle press', () => {
      const { getByText } = render(<WardrobeScreen />);
      
      const seeOutfitsButton = getByText('See Outfits');
      expect(seeOutfitsButton).toBeTruthy();
      
      fireEvent.press(seeOutfitsButton);
      expect(mockPush).toHaveBeenCalledWith('/savedOutfits');
    });
  });
});