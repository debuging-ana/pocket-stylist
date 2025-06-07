import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationBadge from '../components/NotificationBadge';
import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Add imports for Firestore
import { db } from '../firebaseConfig'; // Import your Firebase configuration
import { useWardrobe } from '../context/wardrobeContext';
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing, deviceWidth } from '../utils/responsive';

const getCategoryIcon = (category, size = 22) => {
  const icons = {
    tops: 'tshirt-crew',
    bottoms: 'human',
    jackets: 'coat-rack',
    accessories: 'bag-personal',
    shoes: 'shoe-formal',
  };
  return icons[category] || 'hanger';
};

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { totalHasUnread } = useNotifications();
  const { wardrobeItems } = useWardrobe(); // Get wardrobe items from context
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [userFirstName, setUserFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  console.log('🏠 Homepage: totalHasUnread =', totalHasUnread);

  // Derive recent items from wardrobeItems
  const recentItems = wardrobeItems
    .sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt?.seconds * 1000);
      const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt?.seconds * 1000);
      return dateB - dateA;
    })
    .slice(0, 2);

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
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserProfile();
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
      <View style={styles.container}>
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

        {/* Quick Actions Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/wardrobe')}>
              <View style={[styles.actionIconContainer, { 
                backgroundColor: '#CDD7E4',
                borderColor: '#536C8C',
                borderWidth: 1
              }]}>
                <MaterialCommunityIcons name="hanger" size={22} color="#536C8C" />
              </View>
              <Text style={styles.actionText}>My Wardrobe</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/camera')}>
              <View style={[styles.actionIconContainer, { 
                backgroundColor: '#CADBC1',
                borderColor: '#4A6D51',
                borderWidth: 1
              }]}>
                <Feather name="camera" size={22} color="#4A6D51" />
              </View>
              <Text style={styles.actionText}>Camera</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/contacts')}>
              <View style={[styles.actionIconContainer, { 
                backgroundColor: '#E3D3C6',
                borderColor: '#8B6E57',
                borderWidth: 1
              }]}>
                <Ionicons name="chatbubble-ellipses" size={22} color="#8B6E57" />
                <NotificationBadge hasUnread={totalHasUnread} />
              </View>
              <Text style={styles.actionText}>Messages</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/settings')}>
              <View style={[styles.actionIconContainer, { 
                backgroundColor: '#DFBDBD',
                borderColor: '#995454',
                borderWidth: 1
              }]}>
                <Ionicons name="settings-outline" size={22} color="#995454" />
              </View>
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Style Suggestions Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Style Suggestions</Text>
            <TouchableOpacity onPress={() => router.push('/suggestions')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionsScrollContent}>
            <TouchableOpacity 
              style={[styles.suggestionCard, { 
                backgroundColor: '#CDD7E4',
                borderColor: '#536C8C' 
              }]} 
              onPress={() => router.push('/daily-outfit')}
            >
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
            <TouchableOpacity 
              style={[styles.suggestionCard, { 
                backgroundColor: '#CADBC1',
                borderColor: '#4A6D51'
              }]} 
              onPress={() => router.push('/events')}
            >
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
            <TouchableOpacity 
              style={[styles.suggestionCard, { 
                backgroundColor: '#E3D3C6',
                borderColor: '#8B6E57'
              }]} 
              onPress={() => router.push('/events')}
            >
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
            <TouchableOpacity 
              style={[styles.suggestionCard, { 
                backgroundColor: '#DFBDBD',
                borderColor: '#995454'
              }]} 
              onPress={() => router.push('/made-for-you')}
            >
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

        {/* Recent Items Section */}
        <View style={styles.contentSection}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>Recent Items</Text>
            <TouchableOpacity onPress={() => router.push('/wardrobe')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={styles.recentItemCard}>
              <ActivityIndicator size="small" color="#4A6D51" />
            </View>
          ) : recentItems.length === 0 ? (
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
          ) : (
            recentItems.map((item) => (
              <TouchableOpacity 
                key={item.id} 
                style={styles.recentItemCard} 
                onPress={() => router.push(`/wardrobe/${item.id}`)}
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
                        name={getCategoryIcon(item.category)} 
                        size={24} 
                        color="#AFC6A3" 
                      />
                    </View>
                  )}
                </View>
                <View style={styles.recentItemInfo}>
                  <Text style={styles.recentItemName}>{item.name}</Text>
                  <Text style={styles.recentItemCategory}>
                    {item.category}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))
          )}
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
    paddingHorizontal: scaleSpacing(20),
    paddingTop: scaleSpacing(20),
    paddingBottom: scaleSpacing(10),
    backgroundColor: '#F9F9F4',
  },
  headerCard: {
    backgroundColor: 'white',
    borderRadius: scaleSize(20),
    padding: scaleSpacing(20),
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
    fontSize: scaleFontSize(16),
    color: '#828282',
    fontWeight: '500',
  },
  username: {
    fontSize: scaleFontSize(26),
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: scaleSpacing(3),
  },
  profileButton: {
    height: scaleSize(45),
    width: scaleSize(45),
    borderRadius: scaleSize(22.5),
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
    height: scaleSize(40),
    width: scaleSize(40),
    borderRadius: scaleSize(50),
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: scaleSize(48),
    width: scaleSize(48),
    borderRadius: scaleSize(50),
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  contentSection: {
    paddingHorizontal: scaleSpacing(20),
    paddingTop: scaleSpacing(15),
    paddingBottom: scaleSpacing(5),
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSpacing(20),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: '#4A6D51',
  },
  seeAllText: {
    fontSize: scaleFontSize(14),
    color: '#828282',
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: scaleSpacing(5),
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
  },
  actionIconContainer: {
    height: scaleSize(60),
    width: scaleSize(60),
    borderRadius: scaleSize(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scaleSpacing(8),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  actionText: {
    fontSize: scaleFontSize(12),
    color: '#4A6D51',
    textAlign: 'center',
    fontWeight: '500',
  },
  suggestionsScrollContent: {
    paddingRight: scaleSpacing(20),
  },
  suggestionCard: {
    width: scaleWidth(260),
    height: scaleHeight(180),
    borderRadius: scaleSize(20),
    marginRight: scaleSpacing(15),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    padding: scaleSpacing(20),
    justifyContent: 'flex-end',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSpacing(8),
  },
  cardTag: {
    fontSize: scaleFontSize(12),
    color: '#FFFFFF',
    marginLeft: scaleSpacing(5),
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: scaleSpacing(8),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardDescription: {
    fontSize: scaleFontSize(13),
    color: '#FFFFFF',
    marginBottom: scaleSpacing(12),
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: scaleSpacing(8),
    paddingHorizontal: scaleSpacing(15),
    borderRadius: scaleSize(15),
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
    fontSize: scaleFontSize(13),
    marginRight: scaleSpacing(5),
  },
  recentItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(12),
    marginBottom: scaleSpacing(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  recentItemImageContainer: {
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(10),
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
    width: scaleSize(60),
    height: scaleSize(60),
    backgroundColor: '#F8F8F8',
    borderRadius: scaleSize(10),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addItemIconContainer: {
    width: scaleSize(60),
    height: scaleSize(60),
    borderRadius: scaleSize(10),
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderStyle: 'dashed',
  },
  recentItemInfo: {
    flex: 1,
    marginLeft: scaleSpacing(15),
  },
  recentItemName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: scaleSpacing(4),
  },
  recentItemSubtext: {
    fontSize: scaleFontSize(13),
    color: '#828282',
  },
  recentItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  recentItemCategory: {
    fontSize: scaleFontSize(13),
    color: '#828282',
    textTransform: 'capitalize',
  },
  tipCard: null,
  tipIconContainer: null,
  tipContent: null,
  tipTitle: null,
  tipText: null,
});