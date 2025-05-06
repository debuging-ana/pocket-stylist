import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function SettingsScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>
        
        <Link href="/profile-settings" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Profile Settings</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/notifications" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Notifications</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/change-password" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Change Password</Text>
          </TouchableOpacity>
        </Link>
        
        <Link href="/change-email" asChild>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Change Email</Text>
          </TouchableOpacity>
        </Link>
        
        <TouchableOpacity style={[styles.button, styles.dangerButton]}>
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white', 
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#828282', 
    marginBottom: 40,
    alignSelf: 'flex-start',
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#AFC6A3', 
    padding: 15,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3,
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  dangerButton: {
    backgroundColor: '#E57373',
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});