import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking
} from 'react-native';
import { router } from 'expo-router';
import { 
  updateEmail, 
  getCurrentUser, 
  isGoogleProvider,
  getAuthProvider
} from '../services/auth';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function ChangeEmail() {
  const [newEmail, setNewEmail] = useState(''); // stores new email input
  const [isLoading, setIsLoading] = useState(false); // loading state during operations
  const [error, setError] = useState(''); // error message display
  const [authProvider, setAuthProvider] = useState(null); // tracks users auth method (Google/Email)
  
  // get current user from Firebase authentication
  const user = getCurrentUser();
  // extract current email if user exists
  const currentEmail = user ? user.email : '';

  // determine authentication provider on component mount
  useEffect(() => {
    if (user) {
      // set provider type to customize UI/UX flow
      setAuthProvider(getAuthProvider());
    }
  }, [user]);

  /**
   * Handles email change process with proper validation and error handling
   * 
   * this function:
   * 1. validates the new email address
   * 2. determines authentication method (Google vs Email/Password)
   * 3. for Google users: it opens Google account settings
   * 4. for Email users: uses Firebase's secure email update flow
   * 5. provides user feedback throughout the process
   */
  const handleChangeEmail = async () => {
    setError(''); // reset previous errors
    setIsLoading(true); // start loading indicator

    // input validation checks
    if (!newEmail) {
      setError('New email is required');
      setIsLoading(false);
      return;
    }

    // email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    // prevent updating to the same email
    if (newEmail === currentEmail) {
      setError('New email must be different from current email');
      setIsLoading(false);
      return;
    }

    try {
      // handle Google-authenticated users differently
      if (isGoogleProvider(user)) {
        /**
         * GOOGLE ACCOUNT FLOW:
         * since Google manages authentication, we'll direct users to their Google settings
         * doing this maintains security & follows Google's account management practices
         */
        await Linking.openURL('https://myaccount.google.com/email');
        alert('Please change your email through your Google account settings. This ensures your account security is maintained through Google\'s verification process.');
      } else {
        /**
         * EMAIL/PASSWORD ACCOUNT FLOW:
         * Uses Firebase's secure email update process that:
         * 1. sends verification email to new address
         * 2. only updates email after verification
         * 3. maintains account security throughout
         */
        await updateEmail(newEmail);
        alert('A verification email has been sent to your new address. Please check your inbox & follow the instructions to complete the email change. Your email will update automatically after verification.');
        router.push('/settings');
      }
    } catch (err) {
      // for debugging
      console.log('Email change error:', {
        code: err?.code,
        message: err?.message,
        fullError: err
      });

      // handle specific Firebase error cases
      let errorMessage = 'Failed to update email. Please try again.';

      if (err?.code) {
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address format';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already associated with another account';
            break;
          case 'auth/requires-recent-login':
            errorMessage = 'Security verification required. Please log in again before changing your email.';
            router.push('/login');
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email update operation not permitted. Please verify your current email first.';
            break;
          default:
            errorMessage = err.message || 'An unexpected error occurred. Please try again later.';
            console.error('Email update error:', err);
        }
      } else {
        errorMessage = err.message || 'An error occurred during email update.';
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false); // to end loading indicator
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
            {/* Icon header */}
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="email-edit" size={50} color="#4A6D51" />
            </View>
            <Text style={styles.title}>Change Email</Text>
            <Text style={styles.subtitle}>Update your account email address</Text>
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* special notice for Google account users */}
            {authProvider === 'google.com' && (
              <View style={styles.warningContainer}>
                <Feather name="alert-triangle" size={16} color="#ED6C02" />
                <Text style={styles.warningText}>
                  Your account is managed by Google. For security reasons, please update your email through Google's account settings.
                </Text>
              </View>
            )}

            {/* current email display */}
            {currentEmail ? (
              <View style={styles.currentEmailContainer}>
                <Text style={styles.currentEmailLabel}>Current Email:</Text>
                <Text style={styles.currentEmailText}>{currentEmail}</Text>
                <Text style={styles.providerText}>
                  ({authProvider === 'google.com' ? 'Google account' : 'Email/password account'})
                </Text>
              </View>
            ) : null}

            {/* conditional rendering based on the account type */}
            {authProvider !== 'google.com' ? (
              // EMAIL/PASSWORD ACCOUNT FORM
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>New Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your new email address"
                    placeholderTextColor="#A0A0A0"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    value={newEmail}
                    onChangeText={setNewEmail}
                    editable={!isLoading}
                  />
                </View>

                {/* change email button */}
                <TouchableOpacity
                  style={[
                    styles.changeButton, 
                    isLoading && styles.disabledButton
                  ]}
                  onPress={handleChangeEmail}
                  disabled={isLoading}
                >
                  <Text style={styles.changeButtonText}>
                    {isLoading ? 'Sending Verification...' : 'Change Email'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              // GOOGLE ACCOUNT BUTTON
              <TouchableOpacity
                style={styles.googleButton}
                onPress={() => Linking.openURL('https://myaccount.google.com/email')}
                disabled={isLoading}
              >
                <Text style={styles.googleButtonText}>
                  {isLoading ? 'Opening Google...' : 'Update Email via Google'}
                </Text>
              </TouchableOpacity>
            )}

            {/* cancel button (made to always visible) */}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.push('/settings')}
              disabled={isLoading}
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
    paddingBottom: 40, 
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
    marginBottom: 30, 
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E5', 
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  warningText: {
    color: '#ED6C02', 
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
  providerText: {
    fontSize: 14,
    color: '#666', 
    fontStyle: 'italic',
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
  disabledButton: {
    backgroundColor: '#A0BFA8', 
    opacity: 0.7,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#4285F4', 
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  googleButtonText: {
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
  }
});