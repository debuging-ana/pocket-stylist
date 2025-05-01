import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Logo and App Name */}
        <View style={styles.headerContainer}>
          <Feather name="shopping-bag" size={40} color="#AFC6A3" />
          <Text style={styles.appName}>Pocket Stylist</Text>
        </View>
        
        {/* Tagline */}
        <Text style={styles.tagline}>Your AI-Powered Personal Stylist</Text>
        
        <View style={styles.buttonContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.buttonText}>Create an Account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Discover your perfect look today</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white', 
    padding: 20,
  },
  
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'center',
  },

  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#828282',
    marginLeft: 10,
  },
  
  tagline: {
    fontSize: 16,
    color: '#828282',
    marginBottom: 30,
    fontWeight: '500',
    textAlign: 'center',
  },

  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },

  loginButton: {
    backgroundColor: '#CAD8C3', 
    padding: 15,
    borderRadius: 15,
    width: '75%',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },

  signupButton: {
    backgroundColor: '#AFC6A3', 
    padding: 15,
    borderRadius: 15,
    width: '75%',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },

  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  footerText: {
    fontSize: 14,
    color: '#828282',
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  }
});