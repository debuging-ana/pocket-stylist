/* AUTHENTICATION FILES 
SignupScreen.js - Where new users create an account by entering their 
email, password and basic info. 
Validates passwords match.
*/

import { View, Text, ScrollView, StyleSheet } from 'react-native';

export default function SignupScreen() {
  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Create Account  :D</Text>
      {/* Form components will go heree */}
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