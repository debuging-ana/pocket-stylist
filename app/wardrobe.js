import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, StatusBar } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useWardrobe } from '../context/wardrobeContext';
import { useState, useEffect, useMemo } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore'; // Add imports for Firestore
import { db } from '../firebaseConfig'; // Import your Firebase configuration

// Pre-load and cache images
const CATEGORY_ICONS = {
  pants: require('../assets/images/pants.png'),
  jacket: require('../assets/images/jacket.png'),
};

// Pre-define icon components for better performance
const TopIcon = ({ size }) => (
  <MaterialCommunityIcons name="tshirt-crew" size={size} color="#4A6D51" />
);

const AccessoryIcon = ({ size }) => (
  <MaterialCommunityIcons name="sunglasses" size={size} color="#4A6D51" />
);

const ShoeIcon = ({ size }) => (
  <MaterialCommunityIcons name="shoe-formal" size={size} color="#4A6D51" />
);

const DefaultIcon = ({ size }) => (
  <MaterialCommunityIcons name="folder" size={size} color="#4A6D51" />
);

// Optimized category icon function
const getCategoryIcon = (category, size = 22) => {
  const normalized = category.toLowerCase();

  if (normalized.includes('top')) {
    return <TopIcon size={size} />;
  }
  if (normalized.includes('bottom')) {
    return (
      <Image 
        source={CATEGORY_ICONS.pants}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );
  }
  if (normalized.includes('jacket')) {
    return (
      <Image 
        source={CATEGORY_ICONS.jacket}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );
  }
  if (normalized.includes('accessories')) {
    return <AccessoryIcon size={size} />;
  }
  if (normalized.includes('shoe')) {
    return <ShoeIcon size={size} />;
  }

  return <DefaultIcon size={size} />;
};

export default function WardrobeScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { wardrobeItems } = useWardrobe();
  const { user } = useAuth();
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [userFirstName, setUserFirstName] = useState('');

  useEffect(() => {
    // Fetch user profile data from Firestore when component mounts
    const fetchUserProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setProfilePhotoUri(userData.profilePhotoUri || null);
            setUserFirstName(userData.firstName || user?.email?.split('@')[0] || 'Stylist');
          }
        } catch (error) {
          console.log('Error fetching user profile:', error);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  // Memoize filtered items to prevent unnecessary recalculations
  const filteredItems = useMemo(() => 
    wardrobeItems.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [wardrobeItems, searchQuery]
  );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
          {/* Search Bar */}
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
          
          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: '#CDD7E4',
                borderColor: '#536C8C',
              }]} 
              onPress={() => router.push('/wardrobe/add-item')}
            >
              <Feather name="plus" size={18} color="#536C8C" />
              <Text style={[styles.buttonText, { color: '#536C8C' }]}>Add Item</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: '#CADBC1',
                borderColor: '#4A6D51',
              }]} 
              onPress={() => router.push('/looks/create')}
            >
              <Feather name="plus" size={18} color="#4A6D51" />
              <Text style={[styles.buttonText, { color: '#4A6D51' }]}>Outfit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { 
                backgroundColor: '#E3D3C6',
                borderColor: '#8B6E57',
              }]} 
              onPress={() => router.push('/looks')}
            >
              <MaterialCommunityIcons name="hanger" size={18} color="#8B6E57" />
              <Text style={[styles.buttonText, { color: '#8B6E57' }]}>See Outfits</Text>
            </TouchableOpacity>
          </View>
          
          {/* Search Results (only show when searching) */}
          {searchQuery && (
            <View style={styles.resultsContainer}>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <Link href={`/wardrobe/${item.id}`} asChild key={item.id}>
                    <TouchableOpacity style={styles.searchResultCard}>
                      <Image 
                        source={{ uri: item.imageUri }} 
                        style={styles.searchResultImage}
                      />
                      <Text style={styles.searchResultText}>{item.name}</Text>
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
            <Text style={styles.sectionTitle}>Clothing Categories</Text>
          </View>

          <View style={styles.categoriesContainer}>
            <View style={styles.row}>
              <Link href="/wardrobe/tops" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    {getCategoryIcon('tops', 45)}
                  </View>
                  <Text style={styles.categoryName}>Tops</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/wardrobe/bottoms" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    {getCategoryIcon('bottoms', 45)}
                  </View>
                  <Text style={styles.categoryName}>Bottoms</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.row}>
              <Link href="/wardrobe/jackets" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    {getCategoryIcon('jackets', 45)}
                  </View>
                  <Text style={styles.categoryName}>Jackets</Text>
                </TouchableOpacity>
              </Link>
              
              <Link href="/wardrobe/accessories" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    {getCategoryIcon('accessories', 45)}
                  </View>
                  <Text style={styles.categoryName}>Accessories</Text>
                </TouchableOpacity>
              </Link>
            </View>
            
            <View style={styles.row}>
              <Link href="/wardrobe/shoes" asChild>
                <TouchableOpacity style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    {getCategoryIcon('shoes', 45)}
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
    borderRadius: 50,
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: 48,
    width: 48,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
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
    marginTop: 20,
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
    marginTop: 10,
    marginHorizontal: 20,
  },
  searchResultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchResultImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  searchResultText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  noResults: {
    textAlign: 'center',
    color: '#666',
    padding: 20,
    fontSize: 16,
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
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 50,
    marginTop: 40,
    marginBottom: 20,
    gap: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
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
    height: 158,
    backgroundColor: '#FFFFFF',
    borderColor: '#4A6D51',
    borderWidth: 1,
    borderRadius: 15,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIconContainer: {
    height: '60%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    textAlign: 'center',
  },
  emptyGridItem: {
    width: '48%',
  },
});