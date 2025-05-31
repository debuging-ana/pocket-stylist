import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, query, where, getDocs, startAt, endAt } from 'firebase/firestore';
import { db } from '../firebaseConfig';  // Import your Firebase config
import { useRouter } from 'expo-router';
import { getAuth } from "firebase/auth";

export default function AddContactScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');  // To hold the search input
  const [userResults, setUserResults] = useState([]);  // To hold the users matching the search term

  // Function to search for users in Firestore
  const searchUsers = async (term) => {
    if (term.trim() === '') {
      setUserResults([]); // If no search term, clear the results
      return;
    }

    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('firstName', '>=', term),
        where('firstName', '<=', term + '\uf8ff')
      );
      const querySnapshot = await getDocs(q);
      const currentUserEmail = getAuth().currentUser?.email; // Get current user's email

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        firstName: doc.data().firstName,
        lastName: doc.data().lastName,
        email: doc.data().email,
      }));

      // Exclude current user from results
      const filteredUsers = users.filter(user => user.email !== currentUserEmail);

      setUserResults(filteredUsers);
    } catch (error) {
      console.error("Error fetching users: ", error);
    }
  };

  // Trigger search when the user types in the input field
  useEffect(() => {
    searchUsers(searchTerm);
  }, [searchTerm]);

  const handleUserSelect = (userId, userName) => {
    // Navigate to the chat page when a user is selected
    router.push({
      pathname: '/chat/[friendName]',
      params: { friendName : userName },  // Pass the selected user's name to the chat screen
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Search for Users</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by first name"
        value={searchTerm}
        onChangeText={(text) => setSearchTerm(text)}  // Update search term
      />

      {/* Display search results */}
      <FlatList
        data={userResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.userItem} 
            onPress={() => handleUserSelect(item.id, item.firstName)}  // Select user by firstName
          >
            <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.noResults}>No users found</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchInput: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginBottom: 20,
  },
  userItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  userName: {
    fontSize: 18,
  },
  noResults: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginTop: 20,
  },
});
