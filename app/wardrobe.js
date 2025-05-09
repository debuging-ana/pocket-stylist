import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useWardrobe } from '../context/wardrobeContext';
import { useState } from 'react';

export default function WardrobeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(''); // using state for search term so can react to changes real-time
  const { wardrobeItems } = useWardrobe(); //pulls items from our global state

  // to filter items based on user's search query , case-insensitive
  const filteredItems = wardrobeItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView style={styles.scrollContainer}>
      {/* for the search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="search your style archive.."
          placeholderTextColor="#7D7D7D"
          value={searchQuery}
          onChangeText={setSearchQuery} //updates state for every keystroke
        />
      </View>

      {/* only show results when actually searching (prevents empty state flash) */}
      {searchQuery && (
        <View style={styles.resultsContainer}>
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <View key={item.id} style={styles.searchItem}>
                <Image source={{ uri: item.imageUri }} style={styles.searchImage} />
                <Text style={styles.searchText}>{item.name}</Text>
                <Text style={styles.searchCategory}>{item.category}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>No items found</Text>
          )}
        </View>
      )}

      {/* add item button */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push('/wardrobe/add-item')}
      >
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>

      {/* categories grid */}
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
            
            {/* empty grid item to maintain layout */}
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
    padding: 15,
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
  },
  searchInput: {
    height: 40,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  resultsContainer: {
    backgroundColor: 'white',
    margin: 15,
    borderRadius: 10,
    padding: 15,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  searchImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  searchText: {
    fontWeight: 'bold',
    flex: 1,
  },
  searchCategory: {
    color: '#7D7D7D',
    textTransform: 'capitalize',
  },
  noResults: {
    textAlign: 'center',
    color: '#7D7D7D',
    padding: 10,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white', 
    borderTopLeftRadius: 30, //for rounded top corners
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    marginTop: 20,
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
    borderRadius: 30, //very rounded corners
    width: '48%', 
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, //super subtle shadow
    shadowRadius: 4,
    elevation: 2,
  },
  emptyGridItem: {
    width: '48%',
  },
  buttonText: {
    color: '#7D7D7D',
    fontSize: 14,
    fontWeight: '400',
    marginTop: 10,
  },
  addButton: {
    backgroundColor: '#4A775A',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    marginBottom: 20,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  categoryImage: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 10,
  },
});