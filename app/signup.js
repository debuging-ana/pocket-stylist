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
import { Link, useRouter } from 'expo-router';
import { signupUser } from '../services/auth';
import Feather from '@expo/vector-icons/Feather';
import { db } from '../firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Main signup screen component for new user registration
// Includes form validation, user creation, and navigation
export default function SignupScreen() {
  // State variables for form inputs and validation
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  
  // Main function to handle user signup process
  // Includes validation, Firebase user creation, and navigation
  const handleSignup = async () => {
    // Reset error state before validation
    setError('');
    
    // Input validation checks
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
    
    // Show loading state during signup process
    setIsLoading(true);
    
    // Firebase user creation process
    try {
      const user = await signupUser(email, password);

      // Save user info to Firestore for profile data
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        firstName,
        lastName,
        createdAt: serverTimestamp()
      });
      
      // Show success message and navigate to login
      alert('Account created successfully! Please log in.');
      router.push('/login');
      
      // Clear all form fields after successful signup
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

    } catch (err) {
      // Handle different types of Firebase authentication errors
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView 
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main signup form container */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            {/* Page title and description */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to manage your wardrobe</Text>
            
            {/* Error message display */}
            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            {/* Name input fields row */}
            <View style={styles.nameFieldsContainer}>
              <View style={styles.nameFieldWrapper}>
                <Text style={styles.inputLabel}>First Name</Text>
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
                <Text style={styles.inputLabel}>Last Name</Text>
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
            
            {/* Email input field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
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
            
            {/* Password input field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
            
            {/* Password confirmation input field */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor="#A0A0A0"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            
            {/* Main signup button */}
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.signupButtonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Login redirect section */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </>
  );
}

// Styles for the signup screen
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F9F9F4',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingBottom: 80,
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
    marginBottom: 40,
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
  nameFieldsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  nameFieldWrapper: {
    flex: 0.48, // Slightly less than half to create space between
  },
  nameInput: {
    backgroundColor: '#F9F9F4',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
  signupButton: {
    backgroundColor: '#4A6D51',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 5,
    elevation: 3,
    shadowColor: '#4A6D51',
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
    marginTop: 30,
  },
  loginText: {
    color: '#828282',
    fontSize: 16,
  },
  loginLink: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '500',
  },
});