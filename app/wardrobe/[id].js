import { View, Text, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { wardrobeItems } = useWardrobe();

  const item = wardrobeItems.find((item) => item.id === id);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Add item image or icon here */}
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.category}>Category: {item.category}</Text>
      <Text style={styles.description}>Description: {item.description || 'No description provided.'}</Text>
      {/* Add other fields like color, size, brand etc. */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
});