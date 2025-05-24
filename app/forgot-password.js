import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, ScrollView } from 'react-native';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../firebaseConfig.js";
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleResetPassword = () => {
    if (!email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    setIsLoading(true);
    const auth = getAuth(app);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert("A reset password link has just been sent to your e-mail if you have an account with us.");
        navigation.navigate('index');
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
        setIsLoading(false);
      });
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Password Reset</Text>

      <Text style={styles.description}>
        Provide the e-mail address associated with your account to recovery your password.
      </Text>

      <View style={styles.inputContainer}>
        <TextInput 
          placeholder='Your e-mail address'
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
          style={styles.input} 
        />
      </View>

      <TouchableOpacity 
        onPress={handleResetPassword}
        disabled={isLoading}
        style={styles.resetButton}
      >
        <Text style={styles.resetButtonText}>
          {isLoading ? 'Sending...' : 'Reset Password'}
        </Text>
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
  title: {
    fontSize: 24,
    textAlign: 'center',
    color: '#828282',
    fontWeight: '700',
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#828282',
    marginBottom: 40,
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
  resetButton: {
    backgroundColor: '#828282',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3, //for android shadows
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});