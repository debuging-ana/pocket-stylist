import { TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      onPress={() => router.back()}
      style={{ marginLeft: 15 }}
    >
      <Text style={{ fontSize: 17 }}>←</Text>
    </TouchableOpacity>
  );
}