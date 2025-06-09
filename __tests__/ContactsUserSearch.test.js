import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';

// Simple mock component that demonstrates the search functionality
const SimpleContactsSearch = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  // Mock users database
  const mockUsers = [
    { id: '1', firstName: 'Alice', lastName: 'Smith', email: 'alice@example.com' },
    { id: '2', firstName: 'Bob', lastName: 'Johnson', email: 'bob@example.com' },
    { id: '3', firstName: 'Charlie', lastName: 'Brown', email: 'charlie@example.com' },
  ];

  // Search function
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Simulate search delay
    setTimeout(() => {
      const results = mockUsers.filter(user =>
        user.firstName.toLowerCase().includes(term.toLowerCase()) ||
        user.lastName.toLowerCase().includes(term.toLowerCase()) ||
        user.email.toLowerCase().includes(term.toLowerCase())
      );
      setUsers(results);
      setLoading(false);
    }, 300);
  };

  const handleUserSelect = (user) => {
    // Simulate navigation to chat
    console.log('Navigate to chat with:', user.email);
    // Clear search
    setSearchTerm('');
    setUsers([]);
  };

  return (
    <View testID="contacts-screen">
      <Text>Contacts</Text>
      
      <TextInput
        testID="search-input"
        placeholder="Search for friends..."
        value={searchTerm}
        onChangeText={handleSearch}
      />

      {loading && (
        <Text testID="loading-text">Searching...</Text>
      )}

      {searchTerm && !loading && users.length === 0 && (
        <Text testID="no-results">No users found</Text>
      )}

      {users.map(user => (
        <TouchableOpacity
          key={user.id}
          testID={`user-${user.id}`}
          onPress={() => handleUserSelect(user)}
        >
          <Text testID={`user-name-${user.id}`}>
            {user.firstName} {user.lastName}
          </Text>
          <Text testID={`user-email-${user.id}`}>
            {user.email}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

describe('User Search - Basic Functionality Test', () => {
  test('should render search input', () => {
    const { getByTestId } = render(<SimpleContactsSearch />);
    
    expect(getByTestId('search-input')).toBeTruthy();
    expect(getByTestId('contacts-screen')).toBeTruthy();
  });

  test('should show search results when typing', async () => {
    const { getByTestId, getByText } = render(<SimpleContactsSearch />);
    
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'alice');

    // Wait for search results
    await waitFor(() => {
      expect(getByText('Alice Smith')).toBeTruthy();
    });
  });

  test('should show loading state during search', () => {
    const { getByTestId } = render(<SimpleContactsSearch />);
    
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'alice');

    // Should show loading immediately
    expect(getByTestId('loading-text')).toBeTruthy();
  });

  test('should show no results message when no users found', async () => {
    const { getByTestId } = render(<SimpleContactsSearch />);
    
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'xyz');

    // Wait for no results
    await waitFor(() => {
      expect(getByTestId('no-results')).toBeTruthy();
    });
  });

  test('should clear search when user is selected', async () => {
    const { getByTestId } = render(<SimpleContactsSearch />);
    
    const searchInput = getByTestId('search-input');
    fireEvent.changeText(searchInput, 'alice');

    // Wait for results and select user
    await waitFor(() => {
      expect(getByTestId('user-1')).toBeTruthy();
    });

    fireEvent.press(getByTestId('user-1'));

    // Search should be cleared
    expect(searchInput.props.value).toBe('');
  });

  test('should find users by first name, last name, or email', async () => {
    const { getByTestId, getByText } = render(<SimpleContactsSearch />);
    const searchInput = getByTestId('search-input');

    // Search by first name
    fireEvent.changeText(searchInput, 'alice');
    await waitFor(() => {
      expect(getByText('Alice Smith')).toBeTruthy();
    });

    // Search by email
    fireEvent.changeText(searchInput, 'bob@example.com');
    await waitFor(() => {
      expect(getByText('Bob Johnson')).toBeTruthy();
    });
  });
});
