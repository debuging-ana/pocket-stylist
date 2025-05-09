import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useWardrobe } from '../context/wardrobeContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function WardrobeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { wardrobeItems } = useWardrobe();

  // Filter items based on user's search query, case-insensitive
  const filteredItems = wardrobeItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color="#7D7D7D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="search your style archive..."
            placeholderTextColor="#7D7D7D"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Search Results (only show when searching) */}
      {searchQuery && (
        <View style={styles.resultsContainer}>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <Link href={`/wardrobe/${item.id}`} asChild key={item.id}>
                <TouchableOpacity style={styles.searchItem}>
                  <View style={styles.searchImagePlaceholder}>
                    <Ionicons 
                      name={
                        item.category.toLowerCase().includes('top') ? "shirt-outline" :
                        item.category.toLowerCase().includes('bottom') ? "restaurant-outline" :
                        item.category.toLowerCase().includes('jacket') ? "jacket-outline" :
                        item.category.toLowerCase().includes('accessory') ? "watch-outline" :
                        item.category.toLowerCase().includes('shoe') ? "footsteps-outline" :
                        "folder-outline"
                      } 
                    size={24} 
                    color="#7D7D7D" 
                  />
                </View>
                <View style={styles.searchTextContainer}>
                  <Text style={styles.searchText}>{item.name}</Text>
                  <Text style={styles.searchCategory}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            </Link>
            ))
          ) : (
            <Text style={styles.noResults}>No items found</Text>
          )}
        </View>
      )}

      {/* Add Item Button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push('/wardrobe/add-item')}
      >
        <Ionicons name="add" size={22} color="white" style={styles.addIcon} />
        <Text style={styles.addButtonText}>Add Item</Text>
      </TouchableOpacity>

      {/* Categories Grid */}
      <View style={styles.contentContainer}>
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <Link href="/wardrobe/tops" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <Image 
                  source={require('../assets/images/polo-shirt.png')} 
                  style={styles.categoryImage}
                />
                <Text style={styles.buttonText}>Tops</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/wardrobe/bottoms" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <Image 
                  source={require('../assets/images/pants.png')} 
                  style={styles.categoryImage}
                />
                <Text style={styles.buttonText}>Bottoms</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.row}>
            <Link href="/wardrobe/jackets" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <Image 
                  source={require('../assets/images/jacket.png')} 
                  style={styles.categoryImage}
                />
                <Text style={styles.buttonText}>Jackets</Text>
              </TouchableOpacity>
            </Link>
            
            <Link href="/wardrobe/accessories" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <Image 
                  source={require('../assets/images/necklace.png')} 
                  style={styles.categoryImage}
                />
                <Text style={styles.buttonText}>Accessories</Text>
              </TouchableOpacity>
            </Link>
          </View>
          
          <View style={styles.row}>
            <Link href="/wardrobe/shoes" asChild>
              <TouchableOpacity style={styles.gridItem}>
                <Image 
                  source={require('../assets/images/running-shoe.png')} 
                  style={styles.categoryImage}
                />
                <Text style={styles.buttonText}>Shoes</Text>
              </TouchableOpacity>
            </Link>
            
            {/* Empty grid item to maintain layout */}
            <View style={styles.emptyGridItem}></View>
          </View>
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
  searchContainer: {
    paddingHorizontal: 15,
    marginBottom: 10,
    paddingTop: 20, // Add space to the top
    zIndex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 30, // Reduce this value to make the search bar skinnier
    padding: 5,
  },
  resultsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 2,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  searchTextContainer: {
    flex: 1,
  },
  searchText: {
    fontWeight: 'bold',
    color: '#4A775A',
  },
  searchCategory: {
    color: '#7D7D7D',
    textTransform: 'capitalize',
    fontSize: 12,
    marginTop: 4,
  },
  noResults: {
    textAlign: 'center',
    color: '#7D7D7D',
    padding: 15,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#AFC6A3',
    padding: 15,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    minHeight: '100%',
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    zIndex: 2,
  },
  gridContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridItem: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: '48%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyGridItem: {
    width: '48%',
  },
  categoryImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  buttonText: {
    color: '#7D7D7D',
    fontSize: 14,
    fontWeight: '400',
  },
});