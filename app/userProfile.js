import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';

export default function UserProfileScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>Profile</Text>
                <Text style={styles.username}>{user?.email?.split('@')[0] || 'Stylist'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <View style={styles.profileImageContainer}>
                  <Text style={styles.profileInitial}>{(user?.email?.charAt(0) || 'S').toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: '#F9F9F4',
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
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#828282',
    fontWeight: '500',
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: 3,
  },
  profileButton: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 24,
    padding: 0,
    color: '#4A6D51',
  },
});