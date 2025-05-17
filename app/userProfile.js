/*
  User Profile Screen - Displays user information, boards, and allows editing
  Key Features:
   - View/edit profile info (name, bio)
   - Create/manage style boards
   - Search saved pins
   - Profile stats (followers, views)
   - julz

  note: still need to integrate w firebase
*/
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import Entypo from '@expo/vector-icons/Entypo';

export default function UserProfileScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.email?.split('@')[0] || 'Stylist',
    bio: '',
    followers: 0,
    following: 0,
    monthlyViews: 0,
    boards: [
      { id: '1', title: 'My First Board', pins: 0, updated: 'Just now', isSecret: false },
    ],
  });
  const [newBoardTitle, setNewBoardTitle] = useState(''); // stores new board name during creation

  // component for displaying profile picture placeholder, shows user's initial if no image available
  // also have not implemented ability to upload image yet!
  const ProfilePlaceholder = () => (
    <View style={styles.profileImageContainer}>
      <Text style={styles.profileInitial}>{(profileData.name?.charAt(0) || 'S').toUpperCase()}</Text>
    </View>
  );

  // saves profile changes & exits the edit mode
  const handleSave = () => {
    setIsEditing(false);
    // will save to firebase later
  };

  // creates new style board
  const addBoard = () => {
    if (newBoardTitle.trim() === '') return;
    
    const newBoard = {
      id: Date.now().toString(), // unique id
      title: newBoardTitle,
      pins: 0,
      updated: 'Just now',
      isSecret: false,
    };
    
    // update state with new board
    setProfileData({
      ...profileData,
      boards: [...profileData.boards, newBoard],
    });
    
    setNewBoardTitle('');
  };

  return (
    <>
      {/* Status bar styling */}
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.greeting}>Profile</Text>
                {isEditing ? (
                  <TextInput
                    style={[styles.username, styles.editInput]}
                    value={profileData.name}
                    onChangeText={(text) => setProfileData({ ...profileData, name: text })}
                  />
                ) : (
                  <Text style={styles.username}>{profileData.name}</Text>
                )}
              </View>
              {/* Profile picture button - links to profile editor */}
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <ProfilePlaceholder />
              </TouchableOpacity>
            </View>

            {/* Bio Section */}
            {isEditing ? (
              <TextInput
                style={[styles.bioInput, styles.editInput]}
                placeholder="Tell us about your style..."
                placeholderTextColor="#828282"
                value={profileData.bio}
                onChangeText={(text) => setProfileData({ ...profileData, bio: text })}
                multiline
              />
            ) : (
              <Text style={styles.bioText}>
                {profileData.bio || 'user bio ...'}
              </Text>
            )}

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profileData.followers}</Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profileData.following}</Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{profileData.monthlyViews}</Text>
                <Text style={styles.statLabel}>Views</Text>
              </View>
            </View>
            
            {/* Edit/Save Button */}
            <TouchableOpacity 
              style={styles.editButton}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? 'Save Profile' : 'Edit Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Section */}
        <View style={styles.headerContainer}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#AFC6A3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search your saved pins..."
              placeholderTextColor="#828282"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Boards Section */}
        <View style={[styles.headerContainer, { marginTop: 15 }]}>
          <View style={styles.headerCard}>
            <View style={styles.boardsHeader}>
              <Text style={styles.sectionTitle}>Your Style Boards</Text>
            </View>

            {/* Board creation input (p.s its only visible in edit mode) */}
            {isEditing && (
              <View style={styles.addBoardContainer}>
                <TextInput
                  style={styles.boardInput}
                  placeholder="New board name..."
                  placeholderTextColor="#828282"
                  value={newBoardTitle}
                  onChangeText={setNewBoardTitle}
                />
                <TouchableOpacity style={styles.addButton} onPress={addBoard}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Boards List - displays in 2 colums*/}
            <FlatList
              data={profileData.boards}
              scrollEnabled={false}
              keyExtractor={(item) => item.id}
              numColumns={2} // makes it a grid
              columnWrapperStyle={styles.columnWrapper} 
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.gridItem}>
                  <View style={styles.gridImagePlaceholder}>
                    <Entypo name="pin" size={30} color="#DFBDBD" />
                  </View>
                  <View style={styles.gridTextContainer}>
                    {isEditing ? (
                      <TextInput
                        style={styles.editBoardTitle}
                        value={item.title}
                        onChangeText={(text) => {
                        const updatedBoards = profileData.boards.map(board => board.id === item.id ? { ...board, title: text } : board
                        );
                      setProfileData({ ...profileData, boards: updatedBoards });
                    }}
                  />
                ) : (
                    <Text style={styles.boardTitle} numberOfLines={1}>
                      {item.title || 'Untitled Board'}
                    </Text>
                  )}
                  <Text style={styles.boardStats}>
                    {item.pins} {item.pins === 1 ? 'Pin' : 'Pins'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
            <View style={styles.emptyGridContainer}>
              <Text style={styles.emptyText}> No boards yet. Tap 'Edit Profile' to create your first style board! </Text>
            </View>
          }
        />
      </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  // Original styles
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

  // New styles for editable profile
  bioText: {
    fontSize: 14,
    color: '#828282',
    marginTop: 10,
    fontStyle: 'italic',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 15,
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
  editButton: {
    backgroundColor: '#AFC6A3',
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: 'bold',
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
  boardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  boardItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  boardInfo: {
    flexDirection: 'column',
  },
  boardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#4A6D51',
  },
  editBoardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    padding: 5,
    color: '#4A6D51',
  },
  boardStats: {
    fontSize: 12,
    color: '#828282',
  },
  addBoardContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  boardInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#AFC6A3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    color: '#828282',
    fontStyle: 'italic',
  },
  gridItem: {
  flex: 1,
  margin: 8,
  backgroundColor: 'white',
  borderRadius: 12,
  padding: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.1,
  shadowRadius: 2,
  elevation: 1,
  maxWidth: '46%', // Ensures only 2 items per row
},
columnWrapper: {
  justifyContent: 'space-between',
},
gridImagePlaceholder: {
  width: '100%',
  height: 100,
  backgroundColor: '#F9F9F4',
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 8,
},
gridPlaceholderText: {
  fontSize: 30,
},
gridTextContainer: {
  paddingHorizontal: 4,
},
emptyGridContainer: {
  width: '100%',
  padding: 20,
},
});