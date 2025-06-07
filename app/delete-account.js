import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert
} from 'react-native';
import { router } from 'expo-router';
import { getAuth, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing, deviceWidth } from '../utils/responsive';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const auth = getAuth();
  
  const handleDeleteAccount = async () => {
    setError('');

    // Validation checks
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Password confirmation is required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);

            try {
              const user = auth.currentUser;

              if (!user || !user.email) {
                throw new Error('No user is currently logged in.');
              }

              const credential = EmailAuthProvider.credential(user.email, password);
              await reauthenticateWithCredential(user, credential);

              await deleteUser(user);

              Alert.alert(
                'Account Deleted', 
                'Your account has been successfully deleted.', 
                [
                  { text: 'OK', onPress: () => router.replace('/') }
                ]
              );
            } catch (err) {
              // Error handling
              let errorMessage = 'Failed to delete account. Please try again.';
              
              switch (err.code) {
                case 'auth/wrong-password':
                  errorMessage = 'Password is incorrect';
                  break;
                case 'auth/too-many-requests':
                  errorMessage = 'Too many unsuccessful attempts. Please try again later.';
                  break;
                case 'auth/requires-recent-login':
                  errorMessage = 'Please log in again before deleting your account';
                  router.push('/login');
                  break;
                case 'auth/invalid-credential':
                  errorMessage = 'Invalid credentials. Please try again.';
                  break;
                default:
                  console.error('Account deletion error:', err);
              }
              
              setError(errorMessage);
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
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
              <MaterialCommunityIcons name="delete" size={50} color="#EA6D6D" />
            </View>
            
            <Text style={styles.title}>Delete Account</Text>
            <Text style={styles.subtitle}>Permanently remove your account and data</Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.warningContainer}>
              <Feather name="alert-triangle" size={20} color="#FFA000" />
              <Text style={styles.warningText}>
                This action is permanent and cannot be undone. All your data will be permanently deleted.
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteAccount}
              disabled={isLoading}
            >
              <Text style={styles.deleteButtonText}>
                {isLoading ? 'Deleting...' : 'Delete Account'}
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
    paddingVertical: scaleSpacing(40),
    paddingBottom: scaleSpacing(40),
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
    marginBottom: scaleSpacing(30),
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: scaleSize(80),
    height: scaleSize(80),
    borderRadius: scaleSize(40),
    backgroundColor: '#FFEBEE',
    alignSelf: 'center',
    marginBottom: scaleSpacing(20),
  },
  title: {
    fontSize: scaleFontSize(26),
    fontWeight: 'bold',
    color: '#EA6D6D',
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF8E1',
    borderRadius: scaleSize(10),
    padding: scaleSpacing(15),
    marginBottom: scaleSpacing(20),
  },
  warningText: {
    color: '#333333',
    marginLeft: scaleSpacing(10),
    fontSize: scaleFontSize(14),
    flex: 1,
    lineHeight: scaleSpacing(20),
  },
  inputContainer: {
    marginBottom: scaleSpacing(15),
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    color: '#333333',
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
  deleteButton: {
    backgroundColor: '#EA6D6D',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    marginTop: scaleSpacing(10),
    marginBottom: scaleSpacing(15),
    elevation: 3,
    shadowColor: '#D32F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#828282',
    marginBottom: scaleSpacing(10),
  },
  cancelButtonText: {
    color: '#828282',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
});