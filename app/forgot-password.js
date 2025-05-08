import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../firebaseConfig.js";
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState ('');
  const navigation = useNavigation();

  const handleResetPassword = () => {
    const auth = getAuth(app);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert ("A reset password link has just been sent to your e-mail.");
        navigation.navigate('index');
      })
      .catch((err) => {
        Alert.alert("Error", err.message);
      });
  }
  return (
    <View style={{
      flex: 1,
      padding: 35,
      backgroundColor: 'white',
      justifyContent: 'center',
    }} >
      <Text style={{
        paddingBottom: 10,
        fontSize: 28,
        fontWeight: 600,
      }}>Password Reset</Text>

      <Text style={{
        paddingBottom: 60,
      }}>
        Provide the e-mail address associated with your account to recovery your password.</Text>

      <Text style={{
        fontSize: 18,
        fontWeight: 400,
        paddingBottom: 13,
      }}>
        E-mail:
      </Text>
      <TextInput placeholder='Your e-mail address'
      onChangeText={setEmail}
        style={{
          backgroundColor: 'white',
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          borderWidth: 1,
          borderColor: '#E0E0E0',
        }} />

      <TouchableOpacity onPress={
        handleResetPassword
      }
      
        style={{
        backgroundColor: 'grey',
        padding: 18,
        marginTop: 18,
        borderRadius: 18,

      }}>
        <Text style={{
          backgroundColor: 'grey',
          fontSize: 16,
          fontWeight: 600,
          textAlign: 'center',
          color: 'white',
        }}
        >Reset Password</Text>
      </TouchableOpacity>
    </View>
  );
}