import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; 

export default function AiFiltersScreen() {
  const [filters, setFilters] = useState({
    gender: false,
    bodyType: false,
    lifestyle: false,
  });

  const [selectedItems, setSelectedItems] = useState({
    tops: [],
    bottoms: [],
    jackets: [],
    shoes: [],
    accessories: [],
  });

  const router = useRouter(); 
  const { selectedItems: selectedItemsParam } = useLocalSearchParams();

  useEffect(() => {
    if (selectedItemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(selectedItemsParam));
        setSelectedItems(parsedItems);
      } catch (error) {
        console.error('Error parsing selected items:', error);
      }
    }
  }, [selectedItemsParam]);

  const toggleFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

  const onGeneratePress = () => {
    const anyFilterSelected = Object.values(filters).some((value) => value);
    
    // Pass selected items to both routes
    const selectedItemsQuery = encodeURIComponent(JSON.stringify(selectedItems));
    
    if (anyFilterSelected) {
      router.push(`wardrobe/outfits-with-filters?selectedItems=${selectedItemsQuery}`);
    } else {
      router.push(`wardrobe/outfits-no-filters?selectedItems=${selectedItemsQuery}`); 
    }
  };

  // Function to render selected items by category
  const renderSelectedItems = () => {
    const allSelectedItems = Object.entries(selectedItems)
      .filter(([category, items]) => items.length > 0)
      .map(([category, items]) => ({ category, items }));

    if (allSelectedItems.length === 0) return null;

    return (
      <View style={styles.selectedItemsContainer}>
        <Text style={styles.selectedItemsTitle}>Selected Items</Text>
        {allSelectedItems.map(({ category, items }) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{capitalize(category)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.itemsRow}>
                {items.map((item) => (
                  <View key={item.id} style={styles.selectedItemCard}>
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.selectedItemImage}
                    />
                    <Text style={styles.selectedItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="filter-list" size={80} color="#7D7D7D" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Filters</Text>

        <View style={styles.filtersContainer}>
          {Object.entries(filters).map(([key, value]) => (
            <Pressable key={key} style={styles.filterOption} onPress={() => toggleFilter(key)}>
              <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                {value && <MaterialIcons name="check" size={18} color="white" />}
              </View>
              <Text style={styles.filterText}>{capitalize(key)}</Text>
            </Pressable>
          ))}
        </View>

        {/* Render selected items */}
        {renderSelectedItems()}

        <TouchableOpacity style={styles.generateButton} onPress={onGeneratePress}>
          <Text style={styles.generateButtonText}>Generate</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}


const newStyles = {
  selectedItemsContainer: {
    marginBottom: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  selectedItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7D7D7D',
    marginBottom: 8,
  },
  itemsRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  selectedItemCard: {
    width: 80,
    marginRight: 12,
    alignItems: 'center',
  },
  selectedItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 4,
  },
  selectedItemName: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
};

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
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7D7D7D',
    marginBottom: 20,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 40,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#7D7D7D',
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7D7D7D',
  },
  filterText: {
    fontSize: 16,
    color: '#333',
  },
  generateButton: {
    marginTop: 20,
    backgroundColor: '#4A6D51',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  ...newStyles,
});