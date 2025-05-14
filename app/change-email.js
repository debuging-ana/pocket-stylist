import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { updateEmail, getCurrentUser } from '../screens/services/auth'; 
import { FontAwesome } from '@expo/vector-icons';

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState(''); // For potential reauthentication
  const [showPasswordField, setShowPasswordField] = useState(false);
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

      Alert.alert(
        'Success',
        'Your email has been updated successfully.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
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
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.iconContainer}>
        <FontAwesome name="envelope" size={70} color="#7D7D7D" />
      </View>

      <Text style={styles.title}>Change Email</Text>
      
      {currentEmail ? (
        <Text style={styles.currentEmail}>Current: {currentEmail}</Text>
      ) : null}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={newEmail}
          onChangeText={setNewEmail}
        />
      </View>

      {showPasswordField && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
      )}

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
        onPress={() => router.back()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    color: '#7D7D7D',
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
  },
  currentEmail: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  changeButton: {
    backgroundColor: '#7D7D7D',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#7D7D7D',
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
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#7D7D7D',
  },
  cancelButtonText: {
    color: '#7D7D7D',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
});