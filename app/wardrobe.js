import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useWardrobe } from '../context/wardrobeContext';
import { useState } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

// utility function to render category icons based on item category
const getCategoryIcon = (category, size = 22) => {
  const normalized = category.toLowerCase();

  // return appropriate icon/component based on category
  if (normalized.includes('top')) {
    return <MaterialCommunityIcons name="tshirt-crew" size={size} color="#4A6D51" />;
  }
  if (normalized.includes('bottom')) {
    return (
      <Image 
        source={require('../assets/images/pants.png')}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );
  }
  if (normalized.includes('jacket')) {
    return (
      <Image 
        source={require('../assets/images/jacket.png')}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );
  }
  if (normalized.includes('accessories')) {
    return <MaterialCommunityIcons name="necklace" size={size} color="#4A6D51" />;
  }
  if (normalized.includes('shoe')) {
    return <MaterialCommunityIcons name="shoe-formal" size={size} color="#4A6D51" />;
  }

  // default icon
  return <MaterialCommunityIcons name="folder" size={size} color="#4A6D51" />;
};

export default function WardrobeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { wardrobeItems } = useWardrobe();
  const { user } = useAuth();

  // Filter items based on user's search query, case-insensitive
  const filteredItems = wardrobeItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>My Wardrobe</Text>
                <Text style={styles.username}>{user?.email?.split('@')[0] || 'Stylist'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <View style={styles.profileImageContainer}>
                  <Text style={styles.profileInitial}>{(user?.email?.charAt(0) || 'S').toUpperCase()}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
          
          {/* Search Bar in Header */}
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your style archive..."
              placeholderTextColor="#828282"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Add Item Button in Header */}
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/wardrobe/add-item')}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add Item</Text>
          </TouchableOpacity>
          
          {/* Search Results (only show when searching) */}
          {searchQuery && (
            <View style={styles.resultsContainer}>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <Link href={`/wardrobe/${item.id}`} asChild key={item.id}>
                    <TouchableOpacity style={styles.settingCard}>
                      <View style={[styles.settingIconContainer, { backgroundColor: '#E8F0E2' }]}>
                        {getCategoryIcon(item.category)}
                      </View>
                      <Text style={styles.categoryName}>{item.name}</Text>
                    </TouchableOpacity>
                  </Link>
                ))
              ) : (
                <Text style={styles.noResults}>No matching items found</Text>
              )}
            </View>
          )}

        {/* Categories Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>

          <View style={styles.categoriesContainer}>
            <View style={styles.row}>
              <Link href="/wardrobe/tops" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer]}>
                    {getCategoryIcon('tops', 40)}
                  </View>
                  <Text style={styles.categoryName}>Tops</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/wardrobe/bottoms" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    {getCategoryIcon('bottoms', 40)}
                  </View>
                  <Text style={styles.categoryName}>Bottoms</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.row}>
              <Link href="/wardrobe/jackets" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    {getCategoryIcon('jackets', 40)}
                  </View>
                  <Text style={styles.categoryName}>Jackets</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/wardrobe/accessories" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer]}>
                    {getCategoryIcon('accessories', 40)}
                  </View>
                  <Text style={styles.categoryName}>Accessories</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.row}>
              <Link href="/wardrobe/shoes" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    {getCategoryIcon('shoes', 40)}
                  </View>
                  <Text style={styles.categoryName}>Shoes</Text>
                </TouchableOpacity>
              </Link>
              
              {/* Empty grid item to maintain layout */}
              <View style={styles.emptyGridItem}></View>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: '#F9F9F4',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#828282',
    fontWeight: '500',
  },
  username: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: 3,
  },
  profileButton: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImageContainer: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginTop: 10,
    marginLeft:20,
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 24,
    padding: 0,
    color: '#4A6D51',
  },
  resultsContainer: {
    marginTop: 15,
    marginLeft: 20,
    marginRight: 20,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIconContainer: {
    height: 45,
    width: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResults: {
    textAlign: 'center',
    color: '#828282',
    padding: 15,
  },
  settingsSection: {
    padding: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#AFC6A3',
    marginTop: 20,
    marginBottom: 0,
    marginLeft: 20,
    marginRight: 20,
    padding: 15,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 8,
  },
  categoriesContainer: {
    marginTop: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryCard: {
    width: '48%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    alignItems: 'center',
  },
  categoryIconContainer: {
    height: 70,
    width: 70,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
  },
  emptyGridItem: {
    width: '48%',
  },
});