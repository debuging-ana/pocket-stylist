//DELETE ACCOUNT PAGE HERE

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function DeleteAccount() {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleInitialDelete = () => {
    setShowConfirmation(true);
  };

  const handleCancelDelete = () => {
    setShowConfirmation(false);
    setPassword('');
    setConfirmText('');
  };

  const handleConfirmDelete = () => {
    if (confirmText !== 'DELETE') {
      Alert.alert('Error', 'Please type DELETE to confirm');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    // Here you would implement the actual account deletion logic
    // Typically involves API call to your backend
    
    Alert.alert(
      'Account Deleted',
      'Your account has been successfully deleted',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate to login or welcome screen
            router.replace('/'); // Replace with appropriate route
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.iconWrapper}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#7D7D7D" />
        </TouchableOpacity>
        <Ionicons name="trash" size={120} color="#FF6B6B" />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Delete Account</Text>
        <Text style={styles.description}>
          We're sorry to see you go. Deleting your account will remove all your data and cannot be undone.
        </Text>
        
        {!showConfirmation ? (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleInitialDelete}
          >
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.confirmationContainer}>
            <Text style={styles.confirmationLabel}>Enter your password:</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <Text style={styles.confirmationLabel}>Type DELETE to confirm:</Text>
            <TextInput
              style={styles.input}
              placeholder="DELETE"
              value={confirmText}
              onChangeText={setConfirmText}
            />
            
            <View style={styles.buttonRow}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmButtonText}>Confirm Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        <View style={styles.warningContainer}>
          <Ionicons name="warning-outline" size={20} color="#FF6B6B" style={styles.warningIcon} />
          <Text style={styles.warningText}>
            This action is permanent and cannot be reversed. All your data will be permanently removed from our servers.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F0E2',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 160,
    paddingTop: 40,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    marginTop: -20,
    zIndex: 2,
    minHeight: 500,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmationContainer: {
    marginVertical: 20,
  },
  confirmationLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  warningText: {
    color: '#666',
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});