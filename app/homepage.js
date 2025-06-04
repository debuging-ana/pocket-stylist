import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Add imports for Firestore
import { db } from '../firebaseConfig'; // Import your Firebase configuration

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [userFirstName, setUserFirstName] = useState('');
  const [recentItems, setRecentItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

    // Fetch the 2 most recently added wardrobe items
    const fetchRecentItems = async () => {
      if (user?.uid) {
        setIsLoading(true);
        try {
          const itemsRef = collection(db, "users", user.uid, "wardrobe");
          const q = query(itemsRef, orderBy("createdAt", "desc"), limit(2));
          const querySnapshot = await getDocs(q);

          const items = [];
          querySnapshot.forEach((doc) => {
            items.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setRecentItems(items);
        } catch (error) {
          console.log('Error fetching recent items:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
    fetchRecentItems();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>{getGreeting()},</Text>
                <Text style={styles.username}>{userFirstName}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                {profilePhotoUri ? (
                  <Image 
                    source={{ uri: profilePhotoUri }} 
                    style={styles.profileImage} 
                    accessibilityLabel="Profile photo"
                  />
                ) : (
                  <View style={styles.profileImageContainer}>
                    <Text style={styles.profileInitial}>{(user?.email?.charAt(0) || 'S').toUpperCase()}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/wardrobe')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#CDD7E4' }]}>
                <MaterialCommunityIcons name="hanger" size={22} color="#536C8C" />
              </View>
              <Text style={styles.actionText}>My Wardrobe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/camera')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#CADBC1' }]}>
                <Feather name="camera" size={22} color="#4A6D51" />
              </View>
              <Text style={styles.actionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/contacts')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#E3D3C6' }]}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#8B6E57" />
              </View>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/settings')}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#DFBDBD' }]}>
                <Ionicons name="settings-outline" size={22} color="#995454" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Style Suggestions</Text>
            <TouchableOpacity onPress={() => router.push('/suggestions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScrollContent}>
            <TouchableOpacity style={[styles.suggestionCard, { backgroundColor: '#CDD7E4' }]} onPress={() => router.push('/daily-outfit')}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="sunny-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cardTag}>Weather-Based</Text>
                </View>
                <Text style={styles.cardTitle}>Today's Look</Text>
                <Text style={styles.cardDescription}>Perfect outfit suggestions based on today's weather and your style preferences</Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>View Outfit</Text>
                  <Feather name="arrow-right" size={14} color="#4A6D51" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.suggestionCard, { backgroundColor: '#CADBC1' }]} onPress={() => router.push('/occasion-outfits')}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cardTag}>Special Event</Text>
                </View>
                <Text style={styles.cardTitle}>Event Ready</Text>
                <Text style={styles.cardDescription}>Outfit ideas perfect for your upcoming events and occasions</Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Explore</Text>
                  <Feather name="arrow-right" size={14} color="#4A6D51" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.suggestionCard, { backgroundColor: '#E3D3C6' }]} onPress={() => router.push('/occasion-styles')}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="briefcase-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cardTag}>Occasion-Based</Text>
                </View>
                <Text style={styles.cardTitle}>Styling by Occasion</Text>
                <Text style={styles.cardDescription}>Find the perfect look for any occasion, from office meetings to weekend brunches</Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Browse Occasions</Text>
                  <Feather name="arrow-right" size={14} color="#4A6D51" />
                </View>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.suggestionCard, { backgroundColor: '#DFBDBD' }]} onPress={() => router.push('/made-for-you')}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.cardTag}>Personalized</Text>
                </View>
                <Text style={styles.cardTitle}>Made for You</Text>
                <Text style={styles.cardDescription}>Custom style recommendations based on your preferences.</Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>Generate now!</Text>
                  <Feather name="arrow-right" size={14} color="#4A6D51" />
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Recent Items</Text>
            <TouchableOpacity onPress={() => router.push('/wardrobe')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentItems.length > 0 ? (
            // Show actual recent items
            recentItems.map(item => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recentItemCard} 
                onPress={() => router.push(`/wardrobe/item/${item.id}`)}
              >
                <View style={styles.recentItemImageContainer}>
                  {item.imageUri ? (
                    <Image 
                      source={{ uri: item.imageUri }} 
                      style={styles.recentItemImage}
                    />
                  ) : (
                    <View style={styles.recentItemImagePlaceholder}>
                      <MaterialCommunityIcons 
                        name={item.category === 'shoes' ? 'shoe-formal' : 'tshirt-crew'} 
                        size={24} 
                        color="#AFC6A3" 
                      />
                    </View>
                  )}
                </View>
                <View style={styles.recentItemInfo}>
                  <Text style={styles.recentItemName}>{item.name}</Text>
                  <View style={styles.recentItemDetails}>
                    <Text style={styles.recentItemCategory}>{item.category}</Text>
                    <Text style={styles.recentItemLastWorn}>
                      {item.lastWorn ? `Last worn: ${item.lastWorn}` : 'Not worn yet'}
                    </Text>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))
          ) : (
            // Show an "Add Item" button when no items exist
            <TouchableOpacity 
              style={styles.recentItemCard}
              onPress={() => router.push('/wardrobe/add-item')}
            >
              <View style={styles.addItemIconContainer}>
                <Feather name="plus" size={24} color="#AFC6A3" />
              </View>
              <View style={styles.recentItemInfo}>
                <Text style={styles.recentItemName}>Add Your First Item</Text>
                <Text style={styles.recentItemSubtext}>
                  Start building your digital wardrobe
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.contentSection}>
          <TouchableOpacity style={styles.tipCard} onPress={() => router.push('/tips')}>
            <View style={styles.tipIconContainer}>
              <Ionicons name="bulb-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Style Tip</Text>
              <Text style={styles.tipText}>Try mixing textures within the same color family for a sophisticated monochromatic look</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#CCCCCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingBottom: 10,
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#FFFFFF',
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
  contentSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
  },
  seeAllText: {
    fontSize: 14,
    color: '#828282',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconContainer: {
    height: 60,
    width: 60,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: 12,
    color: '#4A6D51',
    textAlign: 'center',
    fontWeight: '500',
  },
  suggestionsScrollContent: {
    paddingRight: 20,
  },
  suggestionCard: {
    width: 260,
    height: 180,
    borderRadius: 20,
    marginRight: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTag: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  cardButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 5,
  },
  recentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recentItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recentItemImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  recentItemInfo: {
    flex: 1,
    marginLeft: 15,
  },
  recentItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 4,
  },
  recentItemSubtext: {
    fontSize: 13,
    color: '#828282',
  },
  recentItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentItemCategory: {
    fontSize: 13,
    color: '#828282',
    textTransform: 'capitalize',
  },
  recentItemLastWorn: {
    fontSize: 12,
    color: '#AAAAAA',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 15,
    padding: 30,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#828282',
    textAlign: 'center',
    marginBottom: 15,
  },
  addItemButton: {
    backgroundColor: '#4A6D51',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addItemButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4A6D51',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 3,
  },
  tipText: {
    fontSize: 13,
    color: '#828282',
  },
});