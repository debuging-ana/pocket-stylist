import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { updatePassword } from '../screens/services/auth'; 
import { FontAwesome } from '@expo/vector-icons';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChangePassword = async () => {
    setError('');

    // Validation checks
    if (!oldPassword) {
      setError('Current password is required');
      return;
    }

    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(oldPassword, newPassword);
      
      Alert.alert(
        'Success',
        'Your password has been updated successfully.',
        [
          { 
            text: 'OK', 
            onPress: () => router.back() // Go back to previous screen
          }
        ]
      );
    } catch (err) {
      // Error handling
      let errorMessage = 'Failed to update password. Please try again.';
      
      switch (err.code) {
        case 'auth/wrong-password':
          errorMessage = 'Current password is incorrect';
          break;
        case 'auth/weak-password':
          errorMessage = 'New password is too weak';
          break;
        case 'auth/requires-recent-login':
          errorMessage = 'Please log in again before changing your password';
          // Could navigate to re-authentication screen here
          router.push('/login'); // Redirect to login
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid credentials. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many unsuccessful attempts. Please try again later.';
          break;
        default:
          console.error('Password update error:', err);
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
        <FontAwesome name="lock" size={70} color="#7D7D7D" />
      </View>
      
      <Text style={styles.title}>Change Password</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter old password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={oldPassword}
          onChangeText={setOldPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
      </View>

      <TouchableOpacity
        style={styles.changeButton}
        onPress={handleChangePassword}
        disabled={isLoading}
      >
        <Text style={styles.changeButtonText}>
          {isLoading ? 'Updating...' : 'Change Password'}
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
    marginBottom: 30,
    textAlign: 'center',
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