import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.contentContainer}>
        {/* App Name and Tagline */}
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>Pocket Stylist</Text>
          <Text style={styles.tagline}>Your AI-Powered Personal Stylist</Text>
        </View>
        
        {/* Feature Highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#FCE5CB' }]}>
              <Feather name="star" size={18} color="#E67E22" />
            </View>
            <Text style={styles.featureText}>Personalized style recommendations</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#D6EAF8' }]}>
              <Feather name="camera" size={18} color="#3498DB" />
            </View>
            <Text style={styles.featureText}>Analyze your wardrobe items</Text>
          </View>
          
          <View style={styles.featureItem}>
            <View style={[styles.featureIconContainer, { backgroundColor: '#E8F0E2' }]}>
              <Feather name="trending-up" size={18} color="#4A6D51" />
            </View>
            <Text style={styles.featureText}>Stay updated with latest trends</Text>
          </View>
        </View>
        
        {/* Login and Signup Buttons */}
        <View style={styles.buttonContainer}>
          <Link href="/login" asChild>
            <TouchableOpacity style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </Link>
          
          <Link href="/signup" asChild>
            <TouchableOpacity style={styles.signupButton}>
              <Text style={styles.signupButtonText}>Create an Account</Text>
              <Feather name="arrow-right" size={18} color="#FFFFFF" style={styles.buttonIcon} />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <Text style={styles.footerText}>Discover your perfect look today</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  contentContainer: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    fontWeight: '500',
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    fontSize: 15,
    color: '#555555',
    flex: 1,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#AFC6A3',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  loginButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#AFC6A3',
    borderRadius: 15,
    paddingVertical: 15,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  footerText: {
    position: 'absolute',
    bottom: 30,
    color: '#AAAAAA',
    fontSize: 13,
  },
});