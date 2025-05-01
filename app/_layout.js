import { Stack } from 'expo-router';
import BackButton from '../components/BackButton';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerLeft: () => <BackButton />, //our custom back button
        headerBackTitleVisible: false, //for iOS specific which hides the back text (shows arrow)
        headerStyle: {
          backgroundColor: '#AFC6A3',
        },
        headerTitleStyle: {
          color: 'white',
          fontWeight: '600',
        },
        headerTintColor: 'white', 
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ title: 'Log In' }} />
      <Stack.Screen name="signup" options={{ title: 'Create Account' }} />
    </Stack>
  );
}