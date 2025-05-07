import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function ConnectScreen() {
  return (
    <ScrollView style={styles.scrollContainer}>
    {/* wrapper for the main icon at the top of the screen in case want to change it */}
    <View style={styles.iconWrapper}>
        <MaterialIcons name="connect-without-contact" size={80} color="#7D7D7D" />
    </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <Link href="/profile" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="person-circle-outline" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>My Profile</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/contacts" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="people-outline" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Contacts</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.row}>
            <Link href="/chat" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="chatbubbles-outline" size={40} color="#7D7D7D" />
                </View>
                <Text style={styles.buttonText}>Messages</Text>
              </TouchableOpacity>
            </Link>
            
            {/* Empty grid item to maintain layout */}
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
    backgroundColor: '#E8F0E2',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    paddingTop: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    marginTop: 0,
    zIndex: 2,
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