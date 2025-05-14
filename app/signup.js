/* AUTHENTICATION FILES 
SignupScreen.js - Where new users create an account by entering their 
email, password and basic info. 
Validates passwords match.
*/

import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  StyleSheet, 
  Alert
} from 'react-native';
import { Link } from 'expo-router';
import { signupUser } from '../screens/services/auth'; 

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const handleSignup = async () => {
    // Reset error state
    setError('');
    
    // Validate inputs
    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }
    
    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password) {
      setError('Password is required');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Show loading state
    setIsLoading(true);
    
    //actual firebase integration
    try {
      await signupUser(email, password);
      // Show success alert
    Alert.alert(
        'Account Created',
        'Your account has been successfully created!',
        [
          { 
            text: 'OK',
            onPress: () => {
              router.push('/login');
            } 
          }
        ]
      );

      //clears form fields
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      let errorMessage = 'Sign up failed. Please try again.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already in use';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
      }
      setError(errorMessage);
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create your Account</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        {/* First Name and Last Name fields side by side */}
        <View style={styles.nameFieldsContainer}>
          <View style={styles.nameFieldWrapper}>
            <TextInput
              style={styles.nameInput}
              placeholder="First Name"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="words"
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>
          
          <View style={styles.nameFieldWrapper}>
            <TextInput
              style={styles.nameInput}
              placeholder="Last Name"
              placeholderTextColor="#A0A0A0"
              autoCapitalize="words"
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
        </View>
        
        {/* Email field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#A0A0A0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        
        {/* Password field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
        
        {/* Confirm Password field */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#A0A0A0"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        
        {/* Sign Up button */}
        <TouchableOpacity 
          style={styles.signupButton} 
          onPress={handleSignup}
          disabled={isLoading}
        >
          <Text style={styles.signupButtonText}>
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
        
        {/* Already have an account link */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
      </View>

  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    color: '#828282',
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
  nameFieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nameFieldWrapper: {
    flex: 0.48, // Slightly less than half to create space between
  },
  nameInput: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  signupButton: {
    backgroundColor: '#828282',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 3, // For Android shadows
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  loginText: {
    color: '#828282',
    fontSize: 16,
  },
  loginLink: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});