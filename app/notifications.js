import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';

export default function NotificationSettings() {
  const [appNotifications, setAppNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const handleSave = () => {
    // You could persist settings to Firebase or AsyncStorage here
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Notification Settings</Text>

      <SettingToggle
        label="App Notifications"
        value={appNotifications}
        onValueChange={setAppNotifications}
      />
      <SettingToggle
        label="Email Notifications"
        value={emailNotifications}
        onValueChange={setEmailNotifications}
      />
      <SettingToggle
        label="SMS Notifications"
        value={smsNotifications}
        onValueChange={setSmsNotifications}
      />
      <SettingToggle
        label="Sound"
        value={soundEnabled}
        onValueChange={setSoundEnabled}
      />
      <SettingToggle
        label="Vibration"
        value={vibrationEnabled}
        onValueChange={setVibrationEnabled}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SettingToggle({ label, value, onValueChange }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        trackColor={{ false: '#ccc', true: '#7D7D7D' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#ccc"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#7D7D7D',
    textAlign: 'center',
    marginBottom: 30,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  label: {
    fontSize: 16,
    color: '#444',
  },
  saveButton: {
    backgroundColor: '#7D7D7D',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7D7D7D',
    fontSize: 16,
    fontWeight: '600',
  },
});
