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

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={styles.backButton}
              >
                <Feather name="chevron-left" size={24} color="#4A6D51" />
              </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
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
    marginBottom: 3,
  },
  settingsSection: {
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIconContainer: {
    height: 45,
    width: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#828282',
  },
  saveButton: {
    backgroundColor: '#4A6D51',
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
    padding: 15,
    borderRadius: 15,
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
    fontSize: 16,
  },
  cancelButton: {
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontWeight: '500',
    fontSize: 16,
  },
});