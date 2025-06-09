import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OutfitsWithFiltersScreen() {
  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="style" size={80} color="#7D7D7D" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.title}>AI-Generated Outfits</Text>
        <Text style={styles.subtitle}>Based on your filters and wardrobe</Text>

        {/* Placeholder for outfit results */}
        <View style={styles.outfitBox}>
          <Text style={styles.outfitText}>Filtered Outfit #1</Text>
        </View>
        <View style={styles.outfitBox}>
          <Text style={styles.outfitText}>Filtered Outfit #2</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F0E2',
  },
  scrollContent: {
    flexGrow: 1,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    paddingTop: 20,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7D7D7D',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 30,
  },
  outfitBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  outfitText: {
    fontSize: 16,
    color: '#333',
  },
});
