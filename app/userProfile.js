import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, Image, Dimensions, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const WINDOW_WIDTH = Dimensions.get('window').width;

export default function UserProfileScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('boards');
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [editingState, setEditingState] = useState({
    name: '',
    bio: ''
  });
  const [deleteMode, setDeleteMode] = useState(false);

  // initializes profile data when userData changes
  useEffect(() => {
    if (userData === null) {
      // set up default values for new users
      setEditingState({
        name: user?.email?.split('@')[0] || 'Stylist',
        bio: ''
      });
      setProfilePhotoUri(null);
    } else {
      // use existing profile data from Firestore
      setEditingState({
        name: userData?.firstName || user?.email?.split('@')[0] || 'Stylist',
        bio: userData?.bio || ''
      });
      setProfilePhotoUri(userData?.profilePhotoUri || null);
    }
  }, [userData, user]);

  const handleSave = async () => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      // check if document exists first
      await setDoc(userRef, {}, { merge: true });
      // then update it
      await updateDoc(userRef, {
        firstName: editingState.name,
        bio: editingState.bio,
        lastUpdated: new Date().toISOString()
      });
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving profile:", error);
      Alert.alert("Error", "Failed to save profile");
    }
  };

  /*
      BOARD MANAGEMENT FUNCTIONS
  */

  // shows a dialog to create a new board
  const showAddBoardDialog = () => {
    Alert.prompt(
      "New Board",
      "Enter a name for your new board:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Create",
          onPress: (boardName) => {
            if (boardName?.trim()) {
              addBoard(boardName.trim());
            } else {
              Alert.alert("Error", "Board name cannot be empty");
            }
          },
        },
      ],
      "plain-text",
      "",
      "default"
    );
  };

  // creates a new board & saves it to Firestore
  const addBoard = async (boardName) => {
    try {
      const userRef = doc(db, "users", user.uid);
      // create a new board object with all required properties
      const newBoard = {
        id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`, // Unique ID using timestamp + random
        title: boardName,
        pins: [], // start with empty pins array
        updated: new Date().toISOString(), // last update timestamp
        isSecret: false, // default visibility
        isFavorite: false, // not favourited by default
        ownerId: user.uid,  // critical for Firestore security rules
        createdAt: new Date().toISOString(), // creation timestamp
        lastUpdated: new Date().toISOString() // tracks modifications
      };

      // to ensure the user document exists (doesnt overwrite existing fields)
      await setDoc(userRef, {}, { merge: true }); 

      // then update new board to users boards array in Firestore
      await updateDoc(userRef, {
        boards: arrayUnion(newBoard), // arrayUnion safely adds to existing array
        lastUpdated: new Date().toISOString() // update users last modified timestamp
      });
    } catch (error) {
      console.error("Error creating board:", error);
      Alert.alert("Error", "Failed to create board. Please try again!");
    }
  };

  /*
    BOARD DISPLAY FUNCTIONS
  */

  // renders the users boards in a responsive grid layout
  const renderBoards = () => (
    <View style={styles.categoriesContainer}>
      {/* checks if user has any boards */}
      {(userData?.boards || []).length > 0 ? (
        // create rows with 2 boards each
        Array(Math.ceil(userData.boards.length / 2)).fill().map((_, rowIndex) => {
          const rowBoards = userData.boards.slice(rowIndex * 2, rowIndex * 2 + 2);
          return (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {/* render each board in the row */}
              {rowBoards.map((board) => (
                <TouchableOpacity 
                  key={board.id} 
                  style={styles.categoryCard}
                  // navigate to board detail screen when pressed
                  onPress={() => router.push({ pathname: '/boards/[id]', params: { id: board.id } })}
                >
                  {/* board icon - heart for favorite, pin for normal */}
                  <View style={styles.categoryIconContainer}>
                    {board.isFavorite ? 
                      <MaterialCommunityIcons name="heart" size={30} color="#DFBDBD" /> : 
                      <Entypo name="pin" size={30} color="#DFBDBD" />
                    }
                  </View>
                  
                  {/* board title & privacy indicator */}
                  <View style={styles.categoryNameContainer}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {board.title}
                    </Text>
                    {/* show lock icon for secret boards */}
                    {board.isSecret && <Feather name="lock" size={14} color="#4A6D51" />}
                  </View>
                  
                  {/* Pin count display */}
                  <Text style={styles.boardStats}>
                    {board.pins?.length || 0} {board.pins?.length === 1 ? 'Pin' : 'Pins'}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* empty space filler for last row with single board */}
              {rowBoards.length < 2 && <View style={styles.emptyGridItem} />}
            </View>
          );
        })
      ) : (
        // show empty state message when no boards exist
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            No boards yet. Tap the '+' button to create your first style board!
          </Text>
        </View>
      )}
    </View>
  );

  // looks section
  const renderLooks = () => {
    const filteredLooks = (userData?.looks || []).filter(look => 
      searchQuery === '' || 
      look.outfitName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderLookItem = ({ item: look, index }) => {
      // Calculate column position (0 = left, 1 = middle, 2 = right)
      const columnIndex = index % 3;
      
      // Apply different margins based on column position
      const getContainerStyle = () => {
        const baseStyle = styles.outfitContainer;
        switch (columnIndex) {
          case 0: // First column (left) - fixed left position
            return [baseStyle, { marginLeft: 0, marginRight: 0 }];
          case 1: // Middle column - perfectly centered with fixed margins
            return [baseStyle, { marginLeft: 10, marginRight: 10 }];
          case 2: // Right column - fixed right position
            return [baseStyle, { marginLeft: 0, marginRight: 0 }];
          default:
            return baseStyle;
        }
      };

      return (
        <TouchableOpacity 
          style={getContainerStyle()}
          onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: look.outfitId } })}
          activeOpacity={0.8}
        >
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
          
          {deleteMode && (
            <TouchableOpacity
              style={styles.deleteLookButton}
              onPress={() => deleteLook(look.id)}
            >
              <Feather name="minus" size={16} color="#995454" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    };

    return (
      <>
        {/* Search Section with Add Button - positioned under tabs for looks tab */}
        <View style={styles.looksSearchContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your looks..."
              placeholderTextColor="#828282"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.buttonsGroup}>
            <TouchableOpacity 
              style={styles.addBoardButton} 
              onPress={() => setDeleteMode(!deleteMode)}
            >
              <Feather name={deleteMode ? "check" : "minus"} size={24} color="#4A6D51" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.addBoardButton} 
              onPress={() => router.push('/add-look')}
            >
              <Feather name="plus" size={24} color="#4A6D51" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.looksSectionTitleContainer}>
          <Text style={styles.sectionTitle}>Recent Looks</Text>
        </View>

        {/* Display profile looks if they exist */}
        {(userData?.looks || []).length > 0 ? (
          <View style={styles.looksGridContainer}>
            <FlatList
              data={filteredLooks}
              keyExtractor={(item, index) => item.id || index.toString()}
              renderItem={renderLookItem}
              numColumns={3}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            />
          </View>
        ) : (
          /* Empty state for looks */
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Add your first look to your profile!
            </Text>
          </View>
        )}
      </>
    );
  };

  // Function to delete a look from user's profile
  const deleteLook = async (lookId) => {
    if (!user?.uid) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      // Filter out the look to delete from the looks array
      const updatedLooks = (userData?.looks || []).filter(look => look.id !== lookId);
      
      await updateDoc(userRef, {
        looks: updatedLooks,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error deleting look:", error);
      Alert.alert("Error", "Failed to delete look");
    }
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* profile Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            {/* profile image and basic info */}
            <View style={styles.profileHeaderContainer}>
              <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
                {profilePhotoUri ? (
                  <Image source={{ uri: profilePhotoUri }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImageContainer}>
                    <Text style={styles.profileInitial}>
                      {(editingState.name?.charAt(0) || 'S').toUpperCase()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              
              <View style={styles.headerRightSection}>
                <View style={styles.usernameContainer}>
                  {isEditing ? (
                    <TextInput
                      style={[styles.username, styles.editInput]}
                      value={editingState.name}
                      onChangeText={(text) => setEditingState(prev => ({...prev, name: text}))}
                    />
                  ) : (
                    <Text style={styles.username}>{editingState.name}</Text>
                  )}
                </View>
                
                {/* profile stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{userData?.followers || 0}</Text>
                    <Text style={styles.statLabel}>Followers</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{userData?.following || 0}</Text>
                    <Text style={styles.statLabel}>Following</Text>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statNumber}>{userData?.monthlyViews || 0}</Text>
                    <Text style={styles.statLabel}>Views</Text>
                  </View>
                </View>
              </View>
            </View>
            
            {/* bio section */}
            <View style={styles.bioContainer}>
              {isEditing ? (
                <TextInput
                  style={[styles.bioInput, styles.editInput]}
                  placeholder="Tell us about your style..."
                  placeholderTextColor="#828282"
                  value={editingState.bio}
                  onChangeText={(text) => setEditingState(prev => ({...prev, bio: text}))}
                  multiline
                />
              ) : (
                <Text style={styles.bioText}>
                  {editingState.bio || 'Add a bio...'}
                </Text>
              )}
            </View>
            
            {/* action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={isEditing ? handleSave : () => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Save Profile' : 'Edit Profile'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.push('/settings')}
              >
                <Ionicons name="settings-outline" size={24} color="#4A6D51" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* boards/looks tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'boards' && styles.activeTab]}
            onPress={() => setActiveTab('boards')}
          >
            <Text style={[styles.tabText, activeTab === 'boards' && styles.activeTabText]}>Boards</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'looks' && styles.activeTab]}
            onPress={() => setActiveTab('looks')}
          >
            <Text style={[styles.tabText, activeTab === 'looks' && styles.activeTabText]}>Looks</Text>
          </TouchableOpacity>
        </View>

        {/* boards tab content */}
        {activeTab === 'boards' ? (
          <View style={styles.settingsSection}>
            {/* Search & add board bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search your saved pins..."
                  placeholderTextColor="#828282"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              {/* add new board button */}
              <TouchableOpacity 
                style={styles.addBoardButton} 
                onPress={showAddBoardDialog}
              >
                <Feather name="plus" size={24} color="#4A6D51" />
              </TouchableOpacity>
            </View>
            
            {/* section title */}
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Your Style Boards</Text>
            </View>

            {/* render boards grid */}
            {renderBoards()}
          </View>
        ) : (
          // LOOKS SECTION ADDED HERE
          renderLooks()
        )}
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
  profileHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerRightSection: {
    flex: 1,
    marginLeft: 15,
  },
  usernameContainer: {
    marginTop: 13,
    marginBottom: 5,
  },
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4A6D51',
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
  profileImageContainer: {
    height: 90,
    width: 90,
    borderRadius: 50, 
    backgroundColor: '#AFC6A3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    height: 94,
    width: 94,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInitial: {
    fontSize: 32, 
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bioContainer: {
    marginBottom: 15,
  },
  bioText: {
    fontSize: 14,
    color: '#828282',
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  statLabel: {
    fontSize: 12,
    color: '#828282',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  editButtonText: {
    color: '#4A6D51',
    fontWeight: 'bold',
  },
  settingsButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    width: 40,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 8,
    backgroundColor: '#fff',
  },
  bioInput: {
    height: 60,
    marginTop: 10,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
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
  addBoardButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    width: 40,
    height: 40,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  addBoardButtonText: {
    fontSize: 24,
    color: '#4A6D51',
    fontWeight: '500',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4A6D51',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#828282',
  },
  activeTabText: {
    color: '#4A6D51',
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
  editBoardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
    marginBottom: 5,
  },
  boardStats: {
    fontSize: 12,
    color: '#828282',
    marginTop: 5,
  },
  emptyGridItem: {
    width: '48%',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#828282',
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 16,
  },
  list: {
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
  looksSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  looksSectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  looksButtonContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  deleteLookButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#FFE5E5',
    borderColor: '#995454',
    borderWidth: 1,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  looksGridContainer: {
    flex: 1,
  },
  buttonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
});