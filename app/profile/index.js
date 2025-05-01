/*
Displays user info (read-only mode)
*/

import { View, Text, ScrollView } from 'react-native';

export default function ProfileScreen() {
  return (
    <ScrollView 
      contentContainerStyle={{ 
        flexGrow: 1,
        padding: 20 
      }}
    >
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Profile Information
      </Text>
      {/* i'll add the profile content here */}
    </ScrollView>
  );
}