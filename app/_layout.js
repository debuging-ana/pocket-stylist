import BackButton from '../components/BackButton';
import { Tabs, usePathname } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; 
import { AuthProvider,  useAuth } from '../context/AuthContext';

function TabsLayout() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <Tabs
      screenOptions={{
        headerLeft: () => {
          return pathname === '/' ? null : <BackButton />;
        },
        headerBackTitleVisible: false,
        headerStyle: {
          backgroundColor: '#AFC6A3',
        },
        headerTitleStyle: {
          color: 'white',
          fontWeight: '600',
        },
        headerTintColor: 'white',
        tabBarStyle: user ? {
          paddingBottom: 10,
          paddingTop: 5,
          height: 70,
          paddingLeft: 5,
          paddingRight: -30,
          justifyContent: 'center',
          alignItems: 'center',
        } : { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Feather name="home" size={28} color={color} />,
          tabBarItemStyle: { marginHorizontal: 30 },
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: 'Location',
          tabBarIcon: ({ color }) => <Entypo name="location" size={28} color={color} />,
          tabBarItemStyle: { marginHorizontal: 30 },
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
          tabBarIcon: ({ color }) => <Feather name="camera" size={28} color={color} />,
          tabBarItemStyle: { marginHorizontal: 30 },
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={28} color={color} />,
          tabBarItemStyle: { marginHorizontal: 30 },
        }}
      />
      <Tabs.Screen
        name="connect"
        options={{
          title: 'Connect',
          tabBarIcon: ({ color }) => <MaterialIcons name="connect-without-contact" size={28} color={color} />,
          tabBarItemStyle: { marginHorizontal: 30 },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={28} color={color} />,
          tabBarItemStyle: { marginHorizontal: 30 },
        }}
      />

      {/* Hidden Screens */}
      <Tabs.Screen name="login" options={{ title: 'Log-in', href: null }} />
      <Tabs.Screen name="signup" options={{ title: 'Sign-up', href: null }} />
      <Tabs.Screen name="profile/index" options={{ href: null }} />
      <Tabs.Screen name="forgot-password" options={{ title: 'Forgot Password', href: null }} />
      <Tabs.Screen name="delete-account" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ tabBarButton: () => null }} />
      <Tabs.Screen name="contacts" options={{ tabBarButton: () => null }} />
    </Tabs>
  );
}

export default function Layout() {
  return (
    // structure responsible to identify if user is logged in or not and also share the user details across the app pages
    <AuthProvider>   
      <TabsLayout />
    </AuthProvider>
  );
}