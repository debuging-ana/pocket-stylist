import { Tabs } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { WardrobeProvider } from '../context/wardrobeContext';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { Platform } from 'react-native';

function TabsLayout() {
  const { user } = useAuth();

  return (
    <NotificationProvider>
      <WardrobeProvider>
        <Tabs
          screenOptions={{
            headerShown: true,
            headerBackVisible: false,
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
              backgroundColor: '#AFC6A3',
              paddingBottom: 10,
              paddingTop: 5,
              height: 70,
              paddingLeft: 5,
              paddingRight: -30,
              justifyContent: 'center',
              alignItems: 'center',
            } : { display: 'none' },
            tabBarActiveTintColor: '#FFFFFF',
            tabBarInactiveTintColor: '#FFFFFF',
            ...Platform.select({
              ios: {
                presentation: 'card',
                gestureEnabled: true,
                animationEnabled: true,
              },
              android: {
                animation: 'slide_from_right',
              },
            }),
          }}
        >
          <Tabs.Screen
            name="homepage"
            options={{
              tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="home-variant" size={28} color="#FFFFFF" />,
              tabBarItemStyle: { marginHorizontal: 42 },
            }}
          />
          <Tabs.Screen
            name="explorePage"
            options={{
              tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="magnify" size={28} color="#FFFFFF" />,
              tabBarItemStyle: { marginHorizontal: 40 },
            }}
          />
          <Tabs.Screen
            name="camera"
            options={{
              tabBarIcon: ({ focused }) => <Ionicons name="camera" size={28} color="#FFFFFF" />,
              tabBarItemStyle: { marginHorizontal: 42 },
            }}
          />
          <Tabs.Screen
            name="wardrobe"
            options={{
              tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="hanger" size={28} color="#FFFFFF" />,
              tabBarItemStyle: { marginHorizontal: 42 },
            }}
          />
          <Tabs.Screen
            name="userProfile"
            options={{
              tabBarIcon: ({ focused }) => <MaterialCommunityIcons name="account" size={28} color="#FFFFFF" />,
              tabBarItemStyle: { marginLeft: 42, marginRight: 50 },
            }}
          />

          {/* Hidden Screens */}
          <Tabs.Screen name="login" options={{ title: 'Log-in', tabBarButton: () => null }} />
          <Tabs.Screen name="signup" options={{ title: 'Sign-up', tabBarButton: () => null }} />
          <Tabs.Screen name="profile/index" options={{ title: 'Profile', tabBarButton: () => null }} />
          <Tabs.Screen name="change-password" options={{ title: 'Change Password', tabBarButton: () => null }} />
          <Tabs.Screen name="delete-account" options={{ tabBarButton: () => null }} />
          <Tabs.Screen name="chat/[friendName]" options={{ tabBarButton: () => null }} />
          <Tabs.Screen name="wardrobe/add-item" options={{ title: 'Add Item', tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/tops" options={{ title: 'My Tops', tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/bottoms" options={{ title: 'My Bottoms', tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/jackets" options={{ title: 'My Jackets', tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/accessories" options={{ title: 'My Accessories', tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/shoes" options={{ title: 'My Shoes', tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/edit-item" options={{ tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/add-outfit" options={{ tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="wardrobe/[id]" options={{ tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="outfit/[id]" options={{ tabBarButton: () => null, headerShown: true }} />
          <Tabs.Screen name="savedOutfits" options={{ tabBarButton: () => null, headerShown: true }} />
        </Tabs>
      </WardrobeProvider>
    </NotificationProvider>
  );
}

export default function Layout() {
  return (
    <AuthProvider>   
      <TabsLayout />
    </AuthProvider>
  );
}