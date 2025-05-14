import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Image, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useWardrobe } from '../context/wardrobeContext';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
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
                        <Ionicons 
                          name={
                            item.category.toLowerCase().includes('top') ? "shirt-outline" :
                            item.category.toLowerCase().includes('bottom') ? "restaurant-outline" :
                            item.category.toLowerCase().includes('jacket') ? "jacket-outline" :
                            item.category.toLowerCase().includes('accessory') ? "watch-outline" :
                            item.category.toLowerCase().includes('shoe') ? "footsteps-outline" :
                            "folder-outline"
                          } 
                          size={22} 
                          color="#4A6D51" 
                        />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingName}>{item.name}</Text>
                        <Text style={styles.settingDescription}>{item.category}</Text>
                      </View>
                      <Feather name="chevron-right" size={20} color="#CCCCCC" />
                    </TouchableOpacity>
                  </Link>
                ))
              ) : (
                <Text style={styles.noResults}>No items found</Text>
              )}
            </View>
          )}
        </View>

        {/* Categories Section */}
        <View style={styles.settingsSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Categories</Text>
          </View>

          <View style={styles.categoriesContainer}>
            <View style={styles.row}>
              <Link href="/wardrobe/tops" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    <Image 
                      source={require('../assets/images/polo-shirt.png')} 
                      style={styles.categoryImage}
                    />
                  </View>
                  <Text style={styles.categoryName}>Tops</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/wardrobe/bottoms" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    <Image 
                      source={require('../assets/images/pants.png')} 
                      style={styles.categoryImage}
                    />
                  </View>
                  <Text style={styles.categoryName}>Bottoms</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.row}>
              <Link href="/wardrobe/jackets" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    <Image 
                      source={require('../assets/images/jacket.png')} 
                      style={styles.categoryImage}
                    />
                  </View>
                  <Text style={styles.categoryName}>Jackets</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/wardrobe/accessories" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    <Image 
                      source={require('../assets/images/necklace.png')} 
                      style={styles.categoryImage}
                    />
                  </View>
                  <Text style={styles.categoryName}>Accessories</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.row}>
              <Link href="/wardrobe/shoes" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={[styles.categoryIconContainer, ]}>
                    <Image 
                      source={require('../assets/images/running-shoe.png')} 
                      style={styles.categoryImage}
                    />
                  </View>
                  <Text style={styles.categoryName}>Shoes</Text>
                </TouchableOpacity>
              </Link>

              
              
              {/* Empty grid item to maintain layout */}
              <View style={styles.emptyGridItem}></View>
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    paddingTop: 25,
    paddingBottom: 25,
    backgroundColor: '#E8F0E2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
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
    marginHorizontal: 20,
    marginTop: 10,
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
    paddingHorizontal: 20,
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
  settingInfo: {
    flex: 1,
    marginLeft: 15,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#828282',
    textTransform: 'capitalize',
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
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 0,
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
    fontSize: 16,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
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
  categoryImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
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