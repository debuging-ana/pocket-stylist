
import BackButton from '../components/BackButton';
import { Tabs } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function Layout() {
  return (
    <Tabs screenOptions={{
      headerLeft: () => <BackButton />,
      headerBackTitleVisible: false,
      headerStyle: {
        backgroundColor: '#AFC6A3',
      },
      headerTitleStyle: {
        color: 'white',
        fontWeight: '600',
      },
      headerTintColor: 'white',
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Welcome Page',
          tabBarIcon: ({ color }) => <Feather name="home" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarIcon: ({ color }) => <Entypo name="location" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <Feather name="camera" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: 'Log-in',
          href: null,
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: 'Sign-up',
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}