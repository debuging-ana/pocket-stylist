// AUTHENTICATION FILES
// LoginScreen.js - The screen where existing users enter their 
// email and password to access their account. 
// Shows error messages if login fails.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet
} from 'react-native';
import { Link } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate authentication
      setTimeout(() => {
        setIsLoading(false);
        // Simulate error for now 
        setError('Invalid email or password. Please try again.');
      }, 1500);
    } catch (err) {
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Log In to your Account</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={isLoading}
      >
        <Text style={styles.loginButtonText}>
          {isLoading ? 'Logging in...' : 'Log In'}
        </Text>
      </TouchableOpacity>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </Link>
        <Text style={styles.signUpText}> or </Text>
        <Link href="/change-password" asChild>
          <TouchableOpacity>
            <Text style={styles.signUpLink}>Forgot password</Text> 
          </TouchableOpacity>
        </Link>
       
        </View>
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
  title: {
    fontSize: 24,
    color: '#828282',
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  loginButton: {
    backgroundColor: '#828282',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    elevation: 3, //for android shadows
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: '#4285F4',
    textAlign: 'center',
    marginBottom: 50,
    textDecorationLine: 'underline',
    fontSize: 16
  },
  signUpContainer: {
    flexDirection: 'coloumn',
    alignItems: 'center',
    gap: 5,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
  signUpText: {
    color: '#828282',
    fontSize: 16,
  },
  
  signUpLink: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 14,
  },
});