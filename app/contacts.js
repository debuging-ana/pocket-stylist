import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, TextInput, FlatList, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { getAuth } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import NotificationBadge from '../components/NotificationBadge';
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing } from '../utils/responsive';

export default function ContactsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { hasUnreadMessages } = useNotifications();
  const [contacts, setContacts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);

  // Fetch user profile picture
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;
      
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setProfilePhotoUri(userData.profilePhotoUri || null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Don't show this error to user as it's not critical
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    // Check if user is authenticated first
    if (!user?.uid || !user?.email) {
      console.log('User not properly authenticated, skipping contacts fetch');
      setContacts([]);
      return;
    }

    const currentUser = user.email;

    // Get chats where user is a participant - removed orderBy to avoid index requirement
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      // Double-check authentication before processing
      if (!user?.uid || !user?.email) {
        console.log('User authentication lost during contacts fetch');
        return;
      }

      try {
        const chats = snapshot.docs.map(doc => {
          const data = doc.data();
          // Find the other participant (not current user)
          const otherParticipant = data.participants?.find(p => p !== currentUser);
          
          return {
            id: doc.id,
            email: otherParticipant || 'Unknown',
            lastMessage: data.lastMessage || 'No messages yet',
            lastUpdated: data.lastUpdated,
            lastMessageSender: data.lastMessageSender
          };
        });
        
        // Get user names for each email with better error handling
        const chatsWithNames = await Promise.all(
          chats.map(async (chat) => {
            if (chat.email === 'Unknown') return { ...chat, name: 'Unknown' };
            
            try {
              // Query users collection to find user by email
              const usersRef = collection(db, 'users');
              const userQuery = query(usersRef, where('email', '==', chat.email));
              const userSnapshot = await getDocs(userQuery);
              
              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
                return { ...chat, name: fullName || chat.email.split('@')[0] };
              } else {
                // Fallback to email username if user not found
                return { ...chat, name: chat.email.split('@')[0] };
              }
            } catch (error) {
              console.log('Error fetching user name for:', chat.email, error.code || error.message);
              // Don't log full error to avoid console spam
              return { ...chat, name: chat.email.split('@')[0] };
            }
          })
        );
        
        // Filter out any contacts without valid names and sort by lastUpdated in JavaScript
        const validContacts = chatsWithNames
          .filter(chat => chat.name && chat.name !== 'Unknown')
          .sort((a, b) => {
            if (!a.lastUpdated && !b.lastUpdated) return 0;
            if (!a.lastUpdated) return 1;
            if (!b.lastUpdated) return -1;
            
            const aTime = a.lastUpdated.toDate ? a.lastUpdated.toDate() : new Date(a.lastUpdated);
            const bTime = b.lastUpdated.toDate ? b.lastUpdated.toDate() : new Date(b.lastUpdated);
            
            return bTime.getTime() - aTime.getTime(); // Sort newest first
          });
          
        setContacts(validContacts);
      } catch (error) {
        console.log('Error processing contacts data:', error.code || error.message);
        // Set empty contacts on error but don't spam console
        setContacts([]);
      }
    }, (error) => {
      console.log('Error fetching contacts:', error.code || error.message);
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for contacts - user may need to re-authenticate');
      }
      setContacts([]);
    });

    return () => unsubscribe();
  }, [user]);

  // Function to search for users in Firestore
  const searchUsers = async (term) => {
    if (term.trim() === '' || !user?.uid) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const usersRef = collection(db, 'users');
      
      // Search by firstName
      const firstNameQuery = query(
        usersRef,
        where('firstName', '>=', term),
        where('firstName', '<=', term + '\uf8ff')
      );
      
      // Search by email
      const emailQuery = query(
        usersRef,
        where('email', '>=', term),
        where('email', '<=', term + '\uf8ff')
      );

      const [firstNameSnapshot, emailSnapshot] = await Promise.all([
        getDocs(firstNameQuery),
        getDocs(emailQuery)
      ]);

      const currentUserEmail = user.email;
      const userMap = new Map();

      // Combine results from both queries
      [...firstNameSnapshot.docs, ...emailSnapshot.docs].forEach((doc) => {
        const userData = doc.data();
        if (userData.email !== currentUserEmail) {
          userMap.set(doc.id, {
            id: doc.id,
            firstName: userData.firstName || 'Unknown',
            lastName: userData.lastName || '',
            email: userData.email,
          });
        }
      });

      setSearchResults(Array.from(userMap.values()));
    } catch (error) {
      console.log("Error searching users:", error.code || error.message);
      // Handle permission errors gracefully
      if (error.code === 'permission-denied') {
        console.log('Permission denied for user search - check authentication');
      }
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Trigger search when the user types in the input field
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchTerm);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleUserSelect = (user) => {
    try {
      // Navigate to the chat page when a user is selected
      router.push({
        pathname: '/chat/[friendName]',
        params: { friendName: user.email }, // Use email as identifier
      });
      setShowSearch(false);
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error navigating to chat:', error);
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const renderUserItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.searchResultItem} 
      onPress={() => handleUserSelect(item)}
    >
      <View style={styles.userIconContainer}>
        <Text style={styles.userInitial}>
          {(item.firstName.charAt(0) + (item.lastName.charAt(0) || '')).toUpperCase()}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {item.firstName} {item.lastName}
        </Text>
      </View>
      <Feather name="plus-circle" size={20} color="#4A6D51" />
    </TouchableOpacity>
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
                <Text style={styles.greeting}>Contacts</Text>
                <Text style={styles.username}>{user?.email?.split('@')[0] || 'Stylist'}</Text>
              </View>
              <TouchableOpacity 
                style={styles.profileButton}
                onPress={() => router.push('/profile')}
              >
                <View style={styles.profileImageContainer}>
                  {profilePhotoUri ? (
                    <Image 
                      source={{ uri: profilePhotoUri }} 
                      style={styles.profileImage}
                    />
                  ) : (
                    <Text style={styles.profileInitial}>
                      {(user?.email?.charAt(0) || 'S').toUpperCase()}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          {/* Search Section */}
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for friends..."
              placeholderTextColor="#828282"
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                setShowSearch(text.length > 0);
              }}
              onFocus={() => setShowSearch(searchTerm.length > 0)}
              autoCapitalize="none"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity 
                onPress={() => {
                  setSearchTerm('');
                  setShowSearch(false);
                }}
                style={styles.clearButton}
              >
                <Feather name="x" size={18} color="#828282" />
              </TouchableOpacity>
            )}
          </View>

          {/* Search Results */}
          {showSearch && (
            <View style={styles.searchResultsContainer}>
              {searchLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              ) : searchTerm.trim() === '' ? null : searchResults.length === 0 ? (
                <View style={styles.noSearchResults}>
                  <Text style={styles.noResultsText}>No users found</Text>
                  <Text style={styles.noResultsSubtext}>Try searching with a different term</Text>
                </View>
              ) : (
                <FlatList
                  data={searchResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderUserItem}
                  showsVerticalScrollIndicator={false}
                  style={styles.searchResultsList}
                  nestedScrollEnabled={true}
                />
              )}
            </View>
          )}

          {/* Recent Conversations Section - Only show if not searching */}
          {!showSearch && (
            <>
              <View style={styles.sectionTitleContainer}>
                <Text style={styles.sectionTitle}>Recent Conversations</Text>
              </View>

              {contacts.length > 0 ? (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.conversationsList}>
                  {contacts.map((contact) => (
                    <TouchableOpacity 
                      key={contact.id}
                      style={styles.settingCard}
                      onPress={() => router.push({
                        pathname: '/chat/[friendName]', 
                        params: { friendName: contact.email }
                      })}
                    >
                      <View style={[styles.settingIconContainer, { backgroundColor: '#E8F0E2' }]}>
                        <Text style={styles.contactInitial}>
                          {contact.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </Text>
                        <NotificationBadge hasUnread={hasUnreadMessages[contact.email]} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingName}>{contact.name}</Text>
                        <Text style={styles.lastMessage} numberOfLines={1}>
                          {contact.lastMessageSender === (user?.email || getAuth().currentUser?.email) 
                            ? `You: ${contact.lastMessage}` 
                            : contact.lastMessage}
                        </Text>
                        <Text style={styles.lastSeen}>
                          {formatLastSeen(contact.lastUpdated)}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={20} color="#CCCCCC" />
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyStateContainer}>
                  <View style={styles.emptyState}>
                    <Feather name="message-circle" size={64} color="#CCCCCC" />
                    <Text style={styles.emptyStateText}>No conversations yet</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Search for friends above to start chatting
                    </Text>
                  </View>
                </View>
              )}
            </>
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
    paddingBottom: 0,
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
    flex: 1,
    padding: scaleSpacing(20),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(12),
    marginBottom: scaleSpacing(20),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: scaleSpacing(8),
  },
  searchInput: {
    flex: 1,
    height: scaleHeight(24),
    padding: 0,
    color: '#4A6D51',
    fontSize: scaleFontSize(16),
  },
  clearButton: {
    padding: scaleSpacing(5),
    marginLeft: scaleSpacing(5),
  },
  loadingContainer: {
    padding: scaleSpacing(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  noSearchResults: {
    padding: scaleSpacing(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#828282',
    marginBottom: scaleSpacing(5),
  },
  noResultsSubtext: {
    fontSize: scaleFontSize(14),
    color: '#828282',
    textAlign: 'center',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scaleSpacing(15),
  },
  sectionTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: '600',
    color: '#4A6D51',
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    marginBottom: scaleSpacing(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  settingIconContainer: {
    height: scaleSize(45),
    width: scaleSize(45),
    borderRadius: scaleSize(22.5),
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInitial: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  settingInfo: {
    flex: 1,
    marginLeft: scaleSpacing(15),
  },
  settingName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: scaleSpacing(4),
  },
  lastMessage: {
    fontSize: scaleFontSize(13),
    color: '#828282',
    marginBottom: scaleSpacing(2),
  },
  lastSeen: {
    fontSize: scaleFontSize(12),
    color: '#828282',
  },
  conversationsList: {
    flex: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: scaleSpacing(60),
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: scaleFontSize(20),
    fontWeight: 'bold',
    color: '#828282',
    marginTop: scaleSpacing(20),
    marginBottom: scaleSpacing(10),
  },
  emptyStateSubtext: {
    fontSize: scaleFontSize(16),
    color: '#828282',
    textAlign: 'center',
    lineHeight: scaleHeight(22),
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scaleSpacing(12),
    borderRadius: scaleSize(15),
    marginBottom: scaleSpacing(10),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  userIconContainer: {
    height: scaleSize(45),
    width: scaleSize(45),
    borderRadius: scaleSize(22.5),
    backgroundColor: '#E8F0E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scaleSpacing(15),
  },
  userInitial: {
    fontSize: scaleFontSize(16),
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: scaleSpacing(4),
  },
  userEmail: {
    fontSize: scaleFontSize(14),
    color: '#828282',
  },
  searchResultsList: {
    flex: 1,
  },
  searchResultsContainer: {
    flex: 1,
    maxHeight: '100%',
  },
});