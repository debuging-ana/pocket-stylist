import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';

export default function ContactsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const friends = [
    { id: '1', name: 'Alice Johnson' },
    { id: '2', name: 'Bob Smith' },
    { id: '3', name: 'Charlie Lee' },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>Contacts</Text>
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

        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Contacts</Text>
            <TouchableOpacity onPress={() => router.push('/add-contact')}>
              <Feather name="plus" size={20} color="#4A6D51" />
            </TouchableOpacity>
          </View>

          {friends.map((friend) => (
            <TouchableOpacity 
              key={friend.id}
              style={styles.settingCard}
              onPress={() => router.push({
                pathname: '/chat/[friendName]', 
                params: { friendName: friend.name }
              })}
            >
              <View style={[styles.settingIconContainer, { backgroundColor: '#E8F0E2' }]}>
                <Text style={styles.contactInitial}>
                  {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={styles.settingName}>{friend.name}</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
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
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6D51',
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
  }
});