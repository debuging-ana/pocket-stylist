// Password change screen for updating user account password
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
import { updatePassword } from '../services/auth';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { scaleSize, scaleFontSize, scaleSpacing } from '../utils/responsive';

export default function ChangePassword() {
  // Form input states
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  // Loading state for password update process
  const [isLoading, setIsLoading] = useState(false);
  // Error message display state
  const [error, setError] = useState('');

  // Function to handle password change with validation and Firebase update
  const handleChangePassword = async () => {
    setError('');

    // Input validation checks
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
      // Update password using Firebase auth service
      await updatePassword(oldPassword, newPassword);
      
      alert('Your password has been updated successfully.');
      router.push('/settings'); // Navigate back to settings page
    } catch (err) {
      // Handle different Firebase authentication errors
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
          // Redirect to login for re-authentication
          router.push('/login');
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            {/* Header icon */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="shield-key" size={50} color="#4A6D51" />
            </View>
            
            {/* Title and subtitle */}
            <Text style={styles.title}>Change Password</Text>
            <Text style={styles.subtitle}>Update your account password</Text>

            {/* Error message display */}
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Current password input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Current Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>

            {/* New password input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter new password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>

            {/* Confirm new password input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Change password button */}
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={styles.changeButtonText}>
                {isLoading ? 'Updating...' : 'Change Password'}
              </Text>
            </TouchableOpacity>

            {/* Cancel button */}
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
    paddingVertical: scaleSpacing(40),
    paddingBottom: scaleSpacing(40), // Added extra padding at the bottom
  },
  headerContainer: {
    paddingHorizontal: scaleSpacing(20),
    paddingTop: scaleSpacing(20),
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(20),
    padding: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: scaleSpacing(30), // Added margin at the bottom of the card
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: scaleSize(40),
    backgroundColor: '#DBE9D1',
    alignSelf: 'center',
    marginBottom: scaleSpacing(20),
  },
  title: {
    fontSize: scaleFontSize(26),
    fontWeight: 'bold',
    color: '#4A6D51',
    textAlign: 'center',
    marginBottom: scaleSpacing(10),
  },
  subtitle: {
    fontSize: scaleFontSize(16),
    color: '#828282',
    textAlign: 'center',
    marginBottom: scaleSpacing(20),
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: scaleSize(10),
    padding: scaleSpacing(10),
    marginBottom: scaleSpacing(20),
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: scaleSpacing(10),
    fontSize: scaleFontSize(14),
  },
  inputContainer: {
    marginBottom: scaleSpacing(15),
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    color: '#4A6D51',
    marginBottom: scaleSpacing(8),
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F9F9F4',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    fontSize: scaleFontSize(16),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  changeButton: {
    backgroundColor: '#4A6D51',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    marginTop: scaleSpacing(10),
    marginBottom: scaleSpacing(15),
    elevation: 3,
    shadowColor: '#4A6D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  changeButtonText: {
    color: 'white',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6D51',
    marginBottom: scaleSpacing(10), // Added bottom margin
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
});