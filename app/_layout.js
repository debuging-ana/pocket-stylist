import BackButton from '../components/BackButton';
import { Tabs, usePathname } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons'; 
import { WardrobeProvider } from '../context/wardrobeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

function TabsLayout() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <WardrobeProvider>
      <Tabs
        screenOptions={{
          headerBackTitleVisible: false,
          headerTitle: 'Pocket Stylist', 
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
          name="homepage"
          options={{
            tabBarIcon: ({ color }) => <Feather name="home" size={28} color={color} />,
            tabBarItemStyle: { marginHorizontal: 42 },
          }}
        />
        <Tabs.Screen
          name="wardrobe"
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="hanger" size={28} color={color} />,
            tabBarItemStyle: { marginHorizontal: 40 },
          }}
        />
        <Tabs.Screen
          name="camera"
          options={{
            tabBarIcon: ({ color }) => <Feather name="camera" size={28} color={color} />,
            tabBarItemStyle: { marginHorizontal: 42 },
          }}
        />
        <Tabs.Screen
          name="connect"
          options={{
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-group" size={28} color={color} />,
            tabBarItemStyle: { marginHorizontal: 42 },
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={28} color={color} />,
            tabBarItemStyle: { marginHorizontal: 40 },
          }}
        />

        {/* Hidden Screens */}
        <Tabs.Screen name="login" options={{ title: 'Log-in', tabBarButton: () => null }} />
        <Tabs.Screen name="signup" options={{ title: 'Sign-up', tabBarButton: () => null }} />
        <Tabs.Screen name="profile/index" options={{ title: 'Profile', tabBarButton: () => null }} />
        <Tabs.Screen name="change-password" options={{ title: 'Change Password', tabBarButton: () => null }} />
        <Tabs.Screen name="delete-account" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="chat/[friendName]" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="contacts" options={{ tabBarButton: () => null, tabBarStyle: { display: 'none' }, title: 'Chat' }} />
        <Tabs.Screen name="wardrobe/add-item" options={{ title: 'Add Item', tabBarButton: () => null, headerShown: true }} />
        <Tabs.Screen name="wardrobe/tops" options={{ title: 'My Tops', tabBarButton: () => null, headerShown: true }} />
        <Tabs.Screen name="wardrobe/bottoms" options={{ title: 'My Bottoms', tabBarButton: () => null, headerShown: true }} />
        <Tabs.Screen name="wardrobe/jackets" options={{ title: 'My Jackets', tabBarButton: () => null, headerShown: true }} />
        <Tabs.Screen name="wardrobe/accessories" options={{ title: 'My Accessories', tabBarButton: () => null, headerShown: true }} />
        <Tabs.Screen name="wardrobe/shoes" options={{ title: 'My Shoes', tabBarButton: () => null, headerShown: true }} />
        <Tabs.Screen name="wardrobe/edit-item" options={{ title: 'Edit Item', tabBarButton: () => null, headerShown: true }} />
      </Tabs>
    </WardrobeProvider>
  );
}

export default function Layout() {
  return (
    <AuthProvider>   
      <TabsLayout />
    </AuthProvider>
  );
}
