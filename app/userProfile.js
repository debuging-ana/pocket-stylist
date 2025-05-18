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
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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
    { id: '2', title: 'Favorites', pins: 0, updated: 'Just now', isSecret: false, isFavorite: true },
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
          {/* Instagram-style layout */}
          <View style={styles.profileHeaderContainer}>
            {/* Profile Picture on the left */}
            <TouchableOpacity 
              style={styles.profileButton}
              onPress={() => router.push('/profile')}
            >
              <ProfilePlaceholder />
            </TouchableOpacity>
            
            {/* Stats and username on the right */}
            <View style={styles.headerRightSection}>
              {/* Username at top */}
              <View style={styles.usernameContainer}>
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
              
              {/* Stats in a row */}
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
            </View>
          </View>
          
          {/* Bio Section below profile header */}
          <View style={styles.bioContainer}>
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
          </View>
          
          {/* Edit/Save Button and Settings Button */}
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
              <Ionicons name="settings-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Section */}
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

      {/* Boards Section */}
      <View style={styles.settingsSection}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Your Style Boards</Text>
        </View>

        {/* Board creation input (only visible in edit mode) */}
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

        {/* Boards displayed in grid layout similar to wardrobe */}
        <View style={styles.categoriesContainer}>
          {profileData.boards.length > 0 ? (
            <>
              {/* Display boards in rows of 2 */}
              {Array(Math.ceil(profileData.boards.length / 2)).fill().map((_, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.row}>
                  {profileData.boards.slice(rowIndex * 2, rowIndex * 2 + 2).map((board) => (
                    <TouchableOpacity 
                      key={board.id} 
                      style={styles.categoryCard}
                      onPress={() => router.push(`/boards/${board.id}`)}
                    >
                      <View style={styles.categoryIconContainer}>
                        {board.isFavorite ? 
                          <MaterialCommunityIcons name="heart" size={30} color="#DFBDBD" /> : 
                          <Entypo name="pin" size={30} color="#DFBDBD" />
                        }
                      </View>
                      {isEditing ? (
                        <TextInput
                          style={styles.editBoardTitle}
                          value={board.title}
                          onChangeText={(text) => {
                            const updatedBoards = profileData.boards.map(b => 
                              b.id === board.id ? { ...b, title: text } : b
                            );
                            setProfileData({ ...profileData, boards: updatedBoards });
                          }}
                        />
                      ) : (
                        <Text style={styles.categoryName} numberOfLines={1}>
                          {board.title}
                        </Text>
                      )}
                      <Text style={styles.boardStats}>
                        {board.pins} {board.pins === 1 ? 'Pin' : 'Pins'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  
                  {/* Add empty grid item if odd number of boards */}
                  {rowIndex * 2 + 1 >= profileData.boards.length && profileData.boards.length % 2 !== 0 && (
                    <View style={styles.emptyGridItem}></View>
                  )}
                </View>
              ))}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No boards yet. Tap 'Edit Profile' to create your first style board!
              </Text>
            </View>
          )}
        </View>
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
// Center profile picture container
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
// New container for buttons
buttonContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10, // Space between buttons
},
editButton: {
  backgroundColor: '#AFC6A3',
  paddingVertical: 10,
  borderRadius: 12,
  alignItems: 'center',
  flex: 1, // Takes available space
},
editButtonText: {
  color: 'white',
  fontWeight: 'bold',
},
// New settings button
settingsButton: {
  backgroundColor: '#AFC6A3',
  width: 40, // Square button with the same height as edit button
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
centeredInput: {
  textAlign: 'center',
  width: '80%', // Not full width to keep it centered nicely
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
addBoardContainer: {
  flexDirection: 'row',
  marginBottom: 15,
  alignItems: 'center',
},
boardInput: {
  flex: 1,
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 12,
  padding: 12,
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
  backgroundColor: '#F9F9F4',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
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
});