import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../firebaseConfig.js";
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleResetPassword = () => {
    setError('');
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    const auth = getAuth(app);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert(
          "Email Sent",
          "A password reset link has been sent to your email.",
          [{ text: "OK", onPress: () => router.replace('/login') }]
        );
      })
      .catch((err) => {
        let errorMessage = 'Failed to send reset email. Please try again.';
        switch (err.code) {
          case 'auth/invalid-email':
            errorMessage = 'Invalid email format';
            break;
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later';
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      });
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color="#D32F2F" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput 
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
              />
            </View>

            <TouchableOpacity 
              onPress={handleResetPassword}
              disabled={isLoading}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.backButtonText}>Back to Login</Text>
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
    marginTop: 20,
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
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
    marginLeft: 8,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
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
  resetButton: {
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
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '500',
  },
});