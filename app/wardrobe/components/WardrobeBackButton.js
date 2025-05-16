import { TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function WardrobeBackButton() {
  const router = useRouter();
  
  return (
    <TouchableOpacity 
      onPress={() => router.push('/wardrobe')}
      style={{ marginLeft: 15 }}
    >
      <Feather name="arrow-left" size={24} color="white" />
    </TouchableOpacity>
  );
}