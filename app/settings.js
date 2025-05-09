import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.iconWrapper}>
        <Ionicons name="settings" size={200} color="#7D7D7D" />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <Link href="/profile-settings" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-circle-outline" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Profile Settings</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/notifications" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="notifications-outline" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Notifications</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.row}>
            <Link href="/change-password" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <FontAwesome name="lock" size={36} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Change Password</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/change-email" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <MaterialIcons name="email" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Change Email</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.row}>
            <Link href="/delete-account" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="trash-outline" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Delete Account</Text>
              </TouchableOpacity>
            </Link>
            
            {/* Empty view to maintain the grid layout */}
            <View style={styles.emptyGridItem}></View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F0E2', // HERE - background for the main container
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    paddingTop: 20,
    zIndex: 1, // Lower z-index so it gets overlapped
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40, // Extra padding for the partially hidden icon
    paddingBottom: 40,
    marginTop: -0, // bring the container down a bit
    zIndex: 2, // Higher z-index to make it appear above the icon
  },
  gridContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridItem: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: '48%', 
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyGridItem: {
    width: '48%',
  },
  iconContainer: {
    marginBottom: 10,
  },
  buttonText: {
    color: '#7D7D7D',
    fontSize: 14,
    fontWeight: '400',
  },
});