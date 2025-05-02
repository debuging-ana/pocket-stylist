import { View, Text, TouchableOpacity, TextInput } from 'react-native';

export default function ChangePasswordScreen() {
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
        style={{
          backgroundColor: 'white',
          borderRadius: 15,
          padding: 15,
          fontSize: 16,
          borderWidth: 1,
          borderColor: '#E0E0E0',
        }} />

      <TouchableOpacity style={{
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