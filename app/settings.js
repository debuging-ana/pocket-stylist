import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore'; // Add imports for Firestore
import { db } from '../firebaseConfig'; // Import your Firebase configuration
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing, deviceWidth } from '../utils/responsive';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [userFirstName, setUserFirstName] = useState('');

  useEffect(() => {
    // Fetch user profile data from Firestore when component mounts
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setProfilePhotoUri(userData.profilePhotoUri || null);
            setUserFirstName(userData.firstName || user?.email?.split('@')[0] || 'Stylist');
          }
        } catch (error) {
          console.log('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();  // Call the logout function from context
      router.push('/'); // Navigate to the root (index.js) after logout
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>Settings</Text>
                <Text style={styles.username}>{userFirstName}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                {profilePhotoUri ? (
                  <Image 
                    source={{ uri: profilePhotoUri }} 
                    style={styles.profileImage} 
                    accessibilityLabel="Profile photo"
                  />
                ) : (
                  <View style={styles.profileImageContainer}>
                    <Text style={styles.profileInitial}>{(user?.email?.charAt(0) || 'S').toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Account Settings</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#CDD7E4' }]}>
              <Ionicons name="person-circle-outline" size={22} color="#536C8C" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Profile Settings</Text>
              <Text style={styles.settingDescription}>Update your personal information</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/notifications')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#CADBC1' }]}>
              <Ionicons name="notifications-outline" size={22} color="#4A6D51" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Notifications</Text>
              <Text style={styles.settingDescription}>Manage your notification preferences</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/change-password')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#E3D3C6' }]}>
              <Feather name="lock" size={22} color="#8B6E57" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Change Password</Text>
              <Text style={styles.settingDescription}>Update your account password</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/change-email')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#E3D3C6' }]}>
              <Feather name="mail" size={22} color="#8B6E57" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Change Email</Text>
              <Text style={styles.settingDescription}>Update your email address</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Delete Account</Text>
          </View>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => router.push('/delete-account')}
          >
            <View style={[styles.settingIconContainer, { backgroundColor: '#DFBDBD' }]}>
              <Feather name="trash-2" size={22} color="#995454" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Delete Account</Text>
              <Text style={styles.settingDescription}>Permanently delete your account</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color="#FFFFFF" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
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
    paddingHorizontal: scaleSpacing(20),
    paddingTop: scaleSpacing(20),
    paddingBottom: 0,
    backgroundColor: '#F9F9F4',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(20),
    padding: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: scaleFontSize(16),
    color: '#828282',
    fontWeight: '500',
  },
  username: {
    fontSize: scaleFontSize(26),
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: scaleSpacing(3),
  },
  profileButton: {
    height: scaleSize(45),
    width: scaleSize(45),
    borderRadius: scaleSize(22.5),
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
    height: scaleSize(40),
    width: scaleSize(40),
    borderRadius: scaleSize(50),
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: scaleSize(48),
    width: scaleSize(48),
    borderRadius: scaleSize(50),
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  settingsSection: {
    padding: scaleSpacing(20),
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSpacing(15),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: '#4A6D51',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    marginBottom: scaleSpacing(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIconContainer: {
    height: scaleSize(45),
    width: scaleSize(45),
    borderRadius: scaleSize(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: scaleSpacing(15),
  },
  settingName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: scaleSpacing(4),
  },
  settingDescription: {
    fontSize: scaleFontSize(13),
    color: '#828282',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#EA6D6D',
    marginHorizontal: scaleSpacing(20),
    marginVertical: scaleSpacing(10),
    marginTop: scaleSpacing(5),
    padding: scaleSpacing(15),
    borderRadius: scaleSize(15),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: scaleFontSize(16),
    marginLeft: scaleSpacing(8),
  },
});