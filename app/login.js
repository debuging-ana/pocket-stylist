/* AUTHENTICATION FILES 
LoginScreen.js - The screen where existing users enter their 
email and password to access their account. 
Shows error messages if login fails.
*/

import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>where the users will log in</Text>
      {/* Form components go here like email,password, submit, forgot password etc. */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    color: '#828282', 
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
  },
});