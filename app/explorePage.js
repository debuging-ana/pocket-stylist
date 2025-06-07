import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, StatusBar, Modal, Alert, FlatList, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, limit, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const WINDOW_WIDTH = Dimensions.get('window').width;

const ExplorePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBoardSelection, setShowBoardSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileActiveTab, setProfileActiveTab] = useState('boards');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const { user, userData, addPinToBoard } = useAuth();

  const [images] = useState([
    { id: 1, uri: require('../assets/images/image1.jpeg'), category: ['All', 'Casual'] },
    { id: 2, uri: require('../assets/images/image2.jpeg'), category: ['All', 'Casual'] },
    { id: 3, uri: require('../assets/images/image3.jpeg'), category: ['All', 'Streetwear'] },
    { id: 4, uri: require('../assets/images/image4.jpeg'), category: ['All', 'Streetwear'] },
    { id: 5, uri: require('../assets/images/image5.jpeg'), category: ['All', 'Casual'] },
    { id: 6, uri: require('../assets/images/image6.jpeg'), category: ['All', 'Casual'] },
    { id: 7, uri: require('../assets/images/image7.jpeg'), category: ['All', 'Formal'] },
    { id: 8, uri: require('../assets/images/image8.jpeg'), category: ['All', 'Streetwear'] },
    { id: 9, uri: require('../assets/images/image9.jpeg'), category: ['All', 'Streetwear'] },
    { id: 10, uri: require('../assets/images/image10.jpeg'), category: ['All', 'Streetwear'] },
    { id: 11, uri: require('../assets/images/image11.jpeg'), category: ['All', 'Formal'] },
    { id: 12, uri: require('../assets/images/image12.jpeg'), category: ['All', 'Formal'] },
    { id: 13, uri: require('../assets/images/image13.jpeg'), category: ['All', 'Sporty'] },
    { id: 14, uri: require('../assets/images/image14.jpeg'), category: ['All', 'Sporty'] },
    { id: 15, uri: require('../assets/images/image15.jpeg'), category: ['All', 'Sporty'] },
    { id: 16, uri: require('../assets/images/image16.jpeg'), category: ['All', 'Streetwear'] },
    { id: 17, uri: require('../assets/images/image17.jpeg'), category: ['All', 'Streetwear'] },
    { id: 18, uri: require('../assets/images/image18.jpeg'), category: ['All', 'Streetwear'] },
    { id: 19, uri: require('../assets/images/image19.jpeg'), category: ['All', 'Streetwear'] },
    { id: 20, uri: require('../assets/images/image20.jpeg'), category: ['All', 'Formal'] },
  ]);
  /*
  handles the add to board button press for an image
  this function initiates the saving process
  how it works:
  1. stores the selected image in state so we know which image to save
  2. shows the board selection modal so user can choose where to save it
  */
  const handleAddToBoard = (image) => {
    setSelectedImage(image);
    setShowBoardSelection(true);
  };

  /*
    saves the selected image to a specific board
    how it works:
    1. finds the selected board in the users boards
    2. checks if the pin already exists prevents duplicates
    3. creates a pin object with required fields
    4. calls addPinToBoard from our authcontext to save to firestore
    5. shows success or error messages
  */
  const handleBoardSelect = async (boardId) => {
    // safety check - make sure we have an image & user data
    if (!selectedImage || !userData) return;

    try {
      const board = (userData?.boards || []).find(b => b.id === boardId);

      // Check if pin already exists in board
      const isDuplicate = board?.pins?.some(pin => pin.id === selectedImage.id.toString());
      if (isDuplicate) {
        Alert.alert("Duplicate Pin", "This pin is already in the board");
        return;
      }

      // create the pin object to save
      const pinToAdd = {
        id: selectedImage.id.toString(), // unique id for the pin
        imageUri: Image.resolveAssetSource(selectedImage.uri).uri,
        title: `Pin ${selectedImage.id}`,        
        ownerId: user.uid, // required by firestore security rules                       
        createdAt: new Date().toISOString() // timestamp for ordering pins       
      };

      // saves the pin to the board using our context function
      await addPinToBoard(boardId, pinToAdd);
      Alert.alert("Success", "Pin added to board!");
    } catch (error) {
      Alert.alert("Error", "Failed to add pin to board");
    } finally {
      setShowBoardSelection(false);
    }
  };

  const filteredImages = activeTab === 'All'
    ? images
    : images.filter(image => image.category.includes(activeTab));

  // Search for users function
  const searchUsers = async (searchTerm) => {
    if (searchTerm.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const usersRef = collection(db, 'users');
      
      // Search by firstName
      const firstNameQuery = query(
        usersRef,
        where('firstName', '>=', searchTerm),
        where('firstName', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );
      
      // Search by email
      const emailQuery = query(
        usersRef,
        where('email', '>=', searchTerm),
        where('email', '<=', searchTerm + '\uf8ff'),
        limit(10)
      );

      const [firstNameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(firstNameQuery),
        getDocs(emailQuery)
      ]);

      const currentUserEmail = user?.email;
      const userMap = new Map();

      // Combine results from both queries and remove current user
      [...firstNameSnapshot.docs, ...emailSnapshot.docs].forEach((doc) => {
        const userData = doc.data();
        if (userData.email !== currentUserEmail) {
          userMap.set(doc.id, {
            id: doc.id,
            firstName: userData.firstName || 'Unknown',
            lastName: userData.lastName || '',
            email: userData.email,
            profilePhotoUri: userData.profilePhotoUri || null,
          });
        }
      });

      setSearchResults(Array.from(userMap.values()));
      setShowSearchResults(true);
    } catch (error) {
      console.error("Error searching users: ", error);
      Alert.alert("Error", "Failed to search users. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Trigger search when user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle user selection to view their profile
  const handleUserSelect = async (selectedUser) => {
    setIsLoadingProfile(true);
    try {
      // Fetch complete user data from Firestore
      const userDocRef = doc(db, 'users', selectedUser.id);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const fullUserData = userDocSnap.data();
        setSelectedUserData({
          ...selectedUser,
          ...fullUserData,
          id: selectedUser.id
        });
        
        // Check if current user is following this user
        const currentUserFollowing = userData?.following || [];
        setIsFollowing(currentUserFollowing.includes(selectedUser.id));
        
        setShowUserProfile(true);
      } else {
        Alert.alert("Error", "User profile not found");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      Alert.alert("Error", "Failed to load user profile");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Handle follow/unfollow functionality
  const handleFollowToggle = async () => {
    if (!user?.uid || !selectedUserData?.id || isFollowLoading) return;

    setIsFollowLoading(true);
    try {
      const currentUserRef = doc(db, 'users', user.uid);
      const targetUserRef = doc(db, 'users', selectedUserData.id);

      // Fetch current target user data to get accurate counts
      const targetUserSnap = await getDoc(targetUserRef);
      const targetUserData = targetUserSnap.data() || {};

      if (isFollowing) {
        // Unfollow: Remove from following/followers
        await updateDoc(currentUserRef, {
          following: arrayRemove(selectedUserData.id),
          followingCount: Math.max(0, (userData?.followingCount || userData?.following?.length || 0) - 1)
        });

        const newFollowerCount = Math.max(0, (targetUserData.followersCount || targetUserData.followers?.length || 0) - 1);
        await updateDoc(targetUserRef, {
          followers: arrayRemove(user.uid),
          followersCount: newFollowerCount
        });

        // Update local state
        setIsFollowing(false);
        setSelectedUserData(prev => ({
          ...prev,
          followersCount: newFollowerCount
        }));

      } else {
        // Follow: Add to following/followers
        await updateDoc(currentUserRef, {
          following: arrayUnion(selectedUserData.id),
          followingCount: (userData?.followingCount || userData?.following?.length || 0) + 1
        });

        const newFollowerCount = (targetUserData.followersCount || targetUserData.followers?.length || 0) + 1;
        await updateDoc(targetUserRef, {
          followers: arrayUnion(user.uid),
          followersCount: newFollowerCount
        });

        // Update local state
        setIsFollowing(true);
        setSelectedUserData(prev => ({
          ...prev,
          followersCount: newFollowerCount
        }));
      }

    } catch (error) {
      console.error("Error updating follow status:", error);
      Alert.alert("Error", "Failed to update follow status. Please try again.");
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Function to render other users' boards (read-only)
  const renderUserBoards = (userBoards) => (
    <View style={styles.categoriesContainer}>
      {(userBoards || []).length > 0 ? (
        Array(Math.ceil(userBoards.length / 2)).fill().map((_, rowIndex) => {
          const rowBoards = userBoards.slice(rowIndex * 2, rowIndex * 2 + 2);
          return (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {rowBoards.map((board) => (
                <View key={board.id} style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    {board.isFavorite ? 
                      <MaterialCommunityIcons name="heart" size={30} color="#DFBDBD" /> : 
                      <Entypo name="pin" size={30} color="#DFBDBD" />
                    }
                  </View>
                  
                  <View style={styles.categoryNameContainer}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {board.title}
                    </Text>
                    {board.isSecret && <Feather name="lock" size={14} color="#4A6D51" />}
                  </View>
                  
                  <Text style={styles.boardStats}>
                    {board.pins?.length || 0} {board.pins?.length === 1 ? 'Pin' : 'Pins'}
                  </Text>
                </View>
              ))}
              
              {rowBoards.length < 2 && <View style={styles.emptyGridItem} />}
            </View>
          );
        })
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No boards to display</Text>
        </View>
      )}
    </View>
  );

  // Function to render other users' looks (read-only)
  const renderUserLooks = (userLooks) => {
    const looks = userLooks || [];

    const renderLookItem = ({ item: look, index }) => {
      // Calculate column position (0 = left, 1 = middle, 2 = right)
      const columnIndex = index % 3;
      
      // Apply different margins based on column position
      const getContainerStyle = () => {
        const baseStyle = styles.outfitContainer;
        switch (columnIndex) {
          case 0: // First column (left)
            return [baseStyle, { marginLeft: 0, marginRight: 0 }];
          case 1: // Middle column
            return [baseStyle, { marginLeft: 10, marginRight: 10 }];
          case 2: // Right column
            return [baseStyle, { marginLeft: 0, marginRight: 0 }];
          default:
            return baseStyle;
        }
      };

      return (
        <View style={getContainerStyle()}>
          {look.outfitImageUri ? (
            <Image 
              source={{ uri: look.outfitImageUri }} 
              style={styles.outfitImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="tshirt-crew" size={40} color="#CCCCCC" />
            </View>
          )}
        </View>
      );
    };

    return (
      <>
        {/* Display profile looks if they exist */}
        {looks.length > 0 ? (
          <View style={styles.looksGridContainer}>
            <FlatList
              data={looks}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={renderLookItem}
              numColumns={3}
              contentContainerStyle={styles.looksGrid}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        ) : (
          /* Empty state for looks */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No looks to display</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Always show header */}
      <View style={styles.headerContainer}>
        <View style={styles.searchInputContainer}>
          <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for users..."
            placeholderTextColor="#828282"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setShowSearchResults(false);
              }}
              style={styles.clearButton}
            >
              <Feather name="x" size={18} color="#828282" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category tabs - only show when not searching */}
        {!showSearchResults && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabContainer}
          >
            {['All', 'Casual', 'Streetwear', 'Formal', 'Sporty'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Conditional rendering to avoid VirtualizedList nesting */}
      {showSearchResults ? (
        /* Search Results - Full screen FlatList */
        <View style={styles.searchResultsFullContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No users found</Text>
              <Text style={styles.noResultsSubtext}>Try searching with a different term</Text>
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.userResultItem}
                  onPress={() => handleUserSelect(item)}
                >
                  <View style={styles.userAvatar}>
                    {item.profilePhotoUri ? (
                      <Image 
                        source={{ uri: item.profilePhotoUri }} 
                        style={styles.userAvatarImage}
                      />
                    ) : (
                      <Text style={styles.userAvatarText}>
                        {(item.firstName.charAt(0) + (item.lastName.charAt(0) || '')).toUpperCase()}
                      </Text>
                    )}
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {item.firstName} {item.lastName}
                    </Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                  </View>
                  <Feather name="chevron-right" size={20} color="#CCCCCC" />
                </TouchableOpacity>
              )}
              showsVerticalScrollIndicator={false}
              style={styles.searchResultsFullList}
              contentContainerStyle={styles.searchResultsContent}
            />
          )}
        </View>
      ) : (
        /* Normal explore content - ScrollView with image grid */
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.imageGridContainer}>
            {filteredImages.map((image) => (
              <View key={image.id} style={styles.imageCard}>
                <Image
                  source={image.uri}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.imageActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleAddToBoard(image)}
                  >
                    <Text style={styles.actionButtonText}>Add to Board</Text>
                    <Feather name="arrow-right" size={14} color="#4A6D51" style={{ marginLeft: 5 }} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* Board selection modal */}
      <Modal
        visible={showBoardSelection}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBoardSelection(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Board</Text>
            {(userData?.boards || []).map(board => (
              <TouchableOpacity
                key={board.id}
                style={styles.boardItem}
                onPress={() => handleBoardSelect(board.id)}
              >
                <Text style={styles.boardName}>{board.title}</Text>
                <Text style={styles.pinCount}>{board.pins?.length || 0} Pins</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowBoardSelection(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* User Profile Modal */}
      <Modal
        visible={showUserProfile}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowUserProfile(false)}
      >
        <View style={styles.profileModalContainer}>
          {/* Header with close button */}
          <View style={styles.profileModalHeader}>
            <TouchableOpacity
              style={styles.closeProfileButton}
              onPress={() => setShowUserProfile(false)}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.profileModalTitle}>Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          {isLoadingProfile ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
          ) : selectedUserData ? (
            <ScrollView style={styles.profileContent} showsVerticalScrollIndicator={false}>
              {/* Profile Header Section */}
              <View style={styles.profileHeaderContainer}>
                <View style={styles.profileHeaderCard}>
                  {/* Profile image and basic info */}
                  <View style={styles.profileHeaderSection}>
                    <View style={styles.profileButton}>
                      {selectedUserData.profilePhotoUri ? (
                        <Image source={{ uri: selectedUserData.profilePhotoUri }} style={styles.profileImage} />
                      ) : (
                        <View style={styles.profileImageContainer}>
                          <Text style={styles.profileInitial}>
                            {((selectedUserData.firstName?.charAt(0) || '') + (selectedUserData.lastName?.charAt(0) || '')).toUpperCase() || 'U'}
                          </Text>
                        </View>
                      )}
                    </View>
                    
                    <View style={styles.profileHeaderRightSection}>
                      <View style={styles.profileUsernameContainer}>
                        <Text style={styles.profileUsername}>
                          {selectedUserData.firstName} {selectedUserData.lastName}
                        </Text>
                      </View>
                      
                      {/* Profile stats */}
                      <View style={styles.profileStatsContainer}>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatNumber}>{selectedUserData.followersCount || 0}</Text>
                          <Text style={styles.profileStatLabel}>Followers</Text>
                        </View>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatNumber}>{selectedUserData.followingCount || 0}</Text>
                          <Text style={styles.profileStatLabel}>Following</Text>
                        </View>
                        <View style={styles.profileStat}>
                          <Text style={styles.profileStatNumber}>{selectedUserData.monthlyViews || 0}</Text>
                          <Text style={styles.profileStatLabel}>Views</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  
                  {/* Bio section */}
                  {selectedUserData.bio && (
                    <View style={styles.profileBioContainer}>
                      <Text style={styles.profileBioText}>{selectedUserData.bio}</Text>
                    </View>
                  )}

                  {/* Action buttons */}
                  <View style={styles.profileButtonContainer}>
                    <TouchableOpacity 
                      style={styles.followButton}
                      onPress={handleFollowToggle}
                    >
                      <Text style={styles.profileActionButtonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.messageButton}
                      onPress={() => {
                        setShowUserProfile(false);
                        router.push({
                          pathname: '/chat/[friendName]',
                          params: { friendName: selectedUserData?.email }
                        });
                      }}
                    >
                      <Text style={styles.profileActionButtonText}>Message</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Boards/Looks tabs */}
              <View style={styles.profileTabsContainer}>
                <TouchableOpacity 
                  style={[styles.profileTab, profileActiveTab === 'boards' && styles.profileActiveTab]}
                  onPress={() => setProfileActiveTab('boards')}
                >
                  <Text style={[styles.profileTabText, profileActiveTab === 'boards' && styles.profileActiveTabText]}>Boards</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.profileTab, profileActiveTab === 'looks' && styles.profileActiveTab]}
                  onPress={() => setProfileActiveTab('looks')}
                >
                  <Text style={[styles.profileTabText, profileActiveTab === 'looks' && styles.profileActiveTabText]}>Looks</Text>
                </TouchableOpacity>
              </View>

              {/* Conditional content based on active tab */}
              {profileActiveTab === 'boards' ? (
                /* Boards Section */
                <View style={styles.profileSectionContainer}>
                  {renderUserBoards(selectedUserData.boards)}
                </View>
              ) : (
                /* Looks Section */
                renderUserLooks(selectedUserData.looks)
              )}
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
    backgroundColor: '#F9F9F4',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    height: 48,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
    width: 20,
    height: 20,
  },
  searchInput: {
    flex: 1,
    height: 24,
    padding: 0,
    margin: 0,
    color: '#4A6D51',
  },
  tabContainer: {
    paddingVertical: 15,
    paddingHorizontal: 0,
    marginBottom: 3,
    backgroundColor: '#F9F9F4',
  },
  tab: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 7,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6D51',
  },
  tabText: {
    fontSize: 16,
    color: '#828282',
  },
  activeTabText: {
    color: '#4A6D51',
    fontWeight: 'bold',
  },
  imageGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  imageCard: {
    width: '48%',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 170,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  actionButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 15,
    textAlign: 'center',
  },
  boardItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  boardName: {
    fontSize: 16,
    color: '#4A6D51',
    fontWeight: '600',
  },
  pinCount: {
    fontSize: 12,
    color: '#828282',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
  },
  searchResultsFullContainer: {
    flex: 1,
    backgroundColor: '#F9F9F4',
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#828282',
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#828282',
    textAlign: 'center',
  },
  userResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#E8F0E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userAvatarImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#828282',
  },
  searchResultsFullList: {
    flex: 1,
  },
  searchResultsContent: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 10.8,
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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    textAlign: 'center',
  },
  boardStats: {
    fontSize: 12,
    color: '#828282',
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
    minHeight: 200,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#B0B0B0',
    fontStyle: 'italic',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyGridItem: {
    width: '48%',
  },
  profileModalContainer: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  profileModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#AFC6A3',
  },
  closeProfileButton: {
    marginLeft: -5,
  },
  profileModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  headerSpacer: {
    width: 24,
  },
  profileContent: {
    flex: 1,
  },
  profileHeaderContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    backgroundColor: '#F9F9F4',
  },
  profileHeaderCard: {
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
  profileHeaderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  profileButton: {
    height: 95,
    width: 95,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    height: 94,
    width: 94,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileImageContainer: {
    height: 90,
    width: 90,
    borderRadius: 50,
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  profileHeaderRightSection: {
    flex: 1,
    marginLeft: 15,
  },
  profileUsernameContainer: {
    marginTop: 13,
    marginBottom: 5,
  },
  profileUsername: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  profileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  profileStatLabel: {
    fontSize: 12,
    color: '#828282',
  },
  profileBioContainer: {
    marginBottom: 15,
  },
  profileBioText: {
    fontSize: 14,
    color: '#828282',
    fontStyle: 'italic',
  },
  profileSectionContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileTabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  profileTab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  profileActiveTab: {
    borderBottomColor: '#4A6D51',
  },
  profileTabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#828282',
  },
  profileActiveTabText: {
    color: '#4A6D51',
    fontWeight: '600',
  },
  looksGridContainer: {
    flex: 1,
  },
  looksGrid: {
    padding: 20,
    paddingTop: 0,
  },
  outfitContainer: {
    flex: 1,
    maxWidth: (WINDOW_WIDTH - 60) / 3,
    width: (WINDOW_WIDTH - 60) / 3,
    padding: 4,
    alignItems: 'center',
    height: 128,
    position: 'relative',
    marginBottom: 5,
  },
  outfitImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  messageButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  followButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  profileActionButtonText: {
    color: '#4A6D51',
    fontWeight: 'bold',
  },
});

export default ExplorePage;