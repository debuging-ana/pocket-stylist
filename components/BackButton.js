import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from 'expo-router';

export default function BackButton() {
  const navigation = useNavigation();

  const handlePress = () => {
    if(navigation.canGoBack()){
      navigation.goBack();
    } else {
      navigation.navigate('index');
    }
  }
  
  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={{ marginLeft: 15 }}
    >
      <Text style={{ fontSize: 17 }}>←</Text>
    </TouchableOpacity>
  );
}