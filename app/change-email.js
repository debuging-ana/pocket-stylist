import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar
} from 'react-native';
import { router } from 'expo-router';
import { updateEmail, getCurrentUser } from '../screens/services/auth';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState(''); // For potential reauthentication
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const user = getCurrentUser();
  const currentEmail = user ? user.email : '';

  const handleChangeEmail = async () => {
    setError('');

    if (!newEmail) {
      setError('New email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    // Prevent updating to the same email
    if (newEmail === currentEmail) {
      setError('New email must be different from your current email');
      return;
    }

    setIsLoading(true);

    try {
      await updateEmail(newEmail);
      
      alert('Your email has been updated successfully.');
      router.push('/settings'); // Navigate to settings page
    } catch (err) {
      let errorMessage = 'Failed to update email. Please try again.';

      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again before changing your email';
          // For security-sensitive operations, Firebase may require recent authentication
          router.push('/login');
          break;
        default:
          console.error('Email update error:', err);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="email-edit" size={50} color="#4A6D51" />
            </View>
            
            <Text style={styles.title}>Change Email</Text>
            <Text style={styles.subtitle}>Update your account email</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {currentEmail ? (
              <View style={styles.currentEmailContainer}>
                <Text style={styles.currentEmailLabel}>Current Email:</Text>
                <Text style={styles.currentEmailText}>{currentEmail}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new email address"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={newEmail}
                onChangeText={setNewEmail}
              />
            </View>

            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangeEmail}
              disabled={isLoading}
            >
              <Text style={styles.changeButtonText}>
                {isLoading ? 'Updating...' : 'Change Email'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.push('/settings')}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F4',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingBottom: 40, // Added extra padding at the bottom
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30, // Added margin at the bottom of the card
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBE9D1',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 10,
    fontSize: 14,
  },
  currentEmailContainer: {
    backgroundColor: '#DBE9D1',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A6D51',
  },
  currentEmailLabel: {
    fontSize: 14,
    color: '#4A6D51',
    fontWeight: '500',
    marginBottom: 5,
  },
  currentEmailText: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A6D51',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9F9F4',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  changeButton: {
    backgroundColor: '#4A6D51',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#4A6D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6D51',
    marginBottom: 10, 
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
});