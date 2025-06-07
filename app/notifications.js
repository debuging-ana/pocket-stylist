import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Switch
} from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing, deviceWidth } from '../utils/responsive';

export default function NotificationsScreen() {
  const router = useRouter();
  
  // State for notification settings
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSave = () => {
    // Here to persist settings to Firebase or AsyncStorage
    console.log('Notification settings saved:', {
      appNotifications,
      emailNotifications,
      smsNotifications,
      soundEnabled,
      vibrationEnabled,
    });
    router.back(); // Go back after saving
  };

  const handleCancel = () => {
    router.back(); // Go back without saving
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
                <Text style={styles.username}>Notifications</Text>
                <Text style={styles.greeting}>Manage your notification preferences</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Notification Types Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Notification Types</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#F0E5E9' }]}>
              <Ionicons name="notifications-outline" size={22} color="#AF7E88" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>App Notifications</Text>
              <Text style={styles.settingDescription}>Receive in-app notifications</Text>
            </View>
            <Switch
              value={appNotifications}
              onValueChange={setAppNotifications}
              trackColor={{ false: '#E0E0E0', true: '#AFC6A3' }}
              thumbColor={appNotifications ? '#4A6D51' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#E5EDF7' }]}>
              <Feather name="mail" size={22} color="#5A7DA3" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive notification emails</Text>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#E0E0E0', true: '#AFC6A3' }}
              thumbColor={emailNotifications ? '#4A6D51' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#E8F0E2' }]}>
              <Feather name="message-square" size={22} color="#4A6D51" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>SMS Notifications</Text>
              <Text style={styles.settingDescription}>Receive SMS alerts</Text>
            </View>
            <Switch
              value={smsNotifications}
              onValueChange={setSmsNotifications}
              trackColor={{ false: '#E0E0E0', true: '#AFC6A3' }}
              thumbColor={smsNotifications ? '#4A6D51' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Alert Settings</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#F0E9E5' }]}>
              <Feather name="volume-2" size={22} color="#AA8E7D" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Sound</Text>
              <Text style={styles.settingDescription}>Enable notification sounds</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={setSoundEnabled}
              trackColor={{ false: '#E0E0E0', true: '#AFC6A3' }}
              thumbColor={soundEnabled ? '#4A6D51' : '#FFFFFF'}
            />
          </View>

          <View style={styles.settingCard}>
            <View style={[styles.settingIconContainer, { backgroundColor: '#E8E5F7' }]}>
              <Feather name="smartphone" size={22} color="#7D75A3" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingName}>Vibration</Text>
              <Text style={styles.settingDescription}>Enable vibration alerts</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={setVibrationEnabled}
              trackColor={{ false: '#E0E0E0', true: '#AFC6A3' }}
              thumbColor={vibrationEnabled ? '#4A6D51' : '#FFFFFF'}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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
    paddingTop: scaleSpacing(20), // Increased top padding to account for status bar
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
    marginBottom: scaleSpacing(3),
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
  saveButton: {
    backgroundColor: '#4A6D51',
    marginHorizontal: scaleSpacing(20),
    marginTop: scaleSpacing(5),
    marginBottom: scaleSpacing(15.9),
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
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: scaleFontSize(16),
  },
  cancelButton: {
    marginHorizontal: scaleSpacing(20),
    marginBottom: scaleSpacing(30),
    padding: scaleSpacing(15),
    borderRadius: scaleSize(15),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6D51',
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: scaleFontSize(16),
  },
});