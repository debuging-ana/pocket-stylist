import CategoryScreen from './categoryScreen';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import WardrobeBackButton from './components/WardrobeBackButton';

export default function JacketsScreen() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <WardrobeBackButton />,
    });
  }, [navigation]);
  
  return <CategoryScreen category="jackets" />;
}