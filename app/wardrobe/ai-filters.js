import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Image, StatusBar } from 'react-native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
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
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectedItemsScrollContent}
        >
          {allSelectedItems.map(({ category, items }) => (
            <View key={category} style={styles.categoryScrollContainer}>
              <Text style={styles.categoryScrollTitle}>{capitalize(category)}</Text>
              <View style={styles.categoryItemsContainer}>
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
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="magic-staff" size={40} color="#4A6D51" />
            </View>
            <Text style={styles.headerTitle}>AI Outfit Generator</Text>
            <Text style={styles.headerSubtitle}>
              Choose filters to personalize your AI-generated outfit
            </Text>
          </View>
        </View>

        {/* Content Section */}
        <ScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
          {/* Filters Card */}
          <View style={styles.filtersCard}>
            <Text style={styles.sectionTitle}>Personalization Filters</Text>
            <Text style={styles.sectionSubtitle}>
              Select any filters to get more personalized outfit recommendations (optional)
            </Text>

            <View style={styles.filtersContainer}>
              {Object.entries(filters).map(([key, value]) => (
                <TouchableOpacity key={key} style={styles.filterOption} onPress={() => toggleFilter(key)}>
                  <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                    {value && <MaterialIcons name="check" size={16} color="#FFFFFF" />}
                  </View>
                  <Text style={styles.filterText}>{capitalize(key)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Render selected items */}
          {renderSelectedItems()}

          {/* Generate Button */}
          <TouchableOpacity style={styles.generateButton} onPress={onGeneratePress}>
            <MaterialCommunityIcons name="auto-fix" size={20} color="#FFFFFF" />
            <Text style={styles.generateButtonText}>Generate AI Outfit</Text>
          </TouchableOpacity>
          
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/wardrobe/add-outfit')}
          >
            <Text style={styles.backButtonText}>Back to Selection</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#F9F9F4',
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBE9D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filtersCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
    marginBottom: 20,
  },
  filtersContainer: {
    marginTop: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9F9F4',
    borderRadius: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A6D51',
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4A6D51',
  },
  filterText: {
    fontSize: 16,
    color: '#4A6D51',
    fontWeight: '500',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6D51',
    paddingVertical: 16,
    borderRadius: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedItemsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedItemsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectedItemsScrollContent: {
    paddingRight: 20,
  },
  categoryScrollContainer: {
    marginRight: 24,
    alignItems: 'center',
  },
  categoryScrollTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 12,
    textAlign: 'center',
  },
  categoryItemsContainer: {
    alignItems: 'center',
  },
  selectedItemCard: {
    width: 80,
    marginBottom: 8,
    alignItems: 'center',
  },
  selectedItemImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    resizeMode: 'cover',
    marginBottom: 6,
  },
  selectedItemName: {
    fontSize: 11,
    color: '#4A6D51',
    textAlign: 'center',
    fontWeight: '500',
    paddingHorizontal: 2,
  },
});