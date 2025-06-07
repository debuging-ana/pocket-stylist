import React, { 
  useState, 
  useEffect, 
  useRef,
  useLayoutEffect } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar} from 'react-native';

import { db } from '../../firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

import { 
  useLocalSearchParams, 
  useRouter,
  useNavigation 
} from 'expo-router';

import { getAuth } from 'firebase/auth';
import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, serverTimestamp, where, getDoc, deleteField } from 'firebase/firestore';

import { Feather } from '@expo/vector-icons';

// Helper function to encode email for Firebase field names
const encodeEmail = (email) => {
  return email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
};

export default function Chat() {
  const { friendName } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuth();
  const { markChatAsRead } = useNotifications();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const flatListRef = useRef(null);

  const currentUser = user?.email || getAuth().currentUser?.email;
  const currentUserUid = user?.uid || getAuth().currentUser?.uid;
  
  // Create a consistent chat ID using sorted user identifiers
  const chatId = [currentUser, friendName].sort().join('_').replace(/[^a-zA-Z0-9_]/g, '_');

  // Set up navigation header with back button
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.push('/contacts')}
          style={{ marginLeft: 15 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router]);

  useEffect(() => {
    if (!currentUser || !friendName) return;

    // Ensure the chat document exists
    const chatDocRef = doc(db, 'chats', chatId);
    setDoc(chatDocRef, {
      participants: [currentUser, friendName],
      lastUpdated: serverTimestamp(),
      // Initialize unread counts if they don't exist
      [`unreadCounts.${encodeEmail(currentUser)}`]: 0,
      [`unreadCounts.${encodeEmail(friendName)}`]: 0
    }, { merge: true }).then(() => {
      // Mark chat as read after ensuring document exists
      console.log('🏠 Chat document ensured, marking as read');
      try {
        markChatAsRead(friendName);
      } catch (readError) {
        console.log('Error marking chat as read:', readError);
      }
    }).catch((error) => {
      console.log('Error setting up chat document:', error);
      // Handle specific errors
      if (error.code === 'permission-denied') {
        console.log('Permission denied for chat creation');
      } else if (error.code === 'unauthenticated') {
        console.log('User not authenticated for chat creation');
      } else {
        console.log('Unknown error setting up chat:', error.message);
      }
    });

    // Listen for messages
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const newMessages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setMessages(newMessages);
        
        // Mark chat as read whenever new messages arrive (while viewing)
        if (newMessages.length > 0) {
          try {
            markChatAsRead(friendName);
          } catch (readError) {
            console.log('Error marking chat as read on new messages:', readError);
          }
        }
        
        // Scroll to bottom when new messages arrive
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      },
      (error) => {
        console.log('Chat snapshot listener error:', error);
        
        // Handle specific Firebase errors
        if (error.code === 'permission-denied') {
          console.log('Permission denied for chat access');
          // You might want to show a user-friendly message here
        } else if (error.code === 'unavailable') {
          console.log('Firebase service temporarily unavailable');
        } else if (error.code === 'unauthenticated') {
          console.log('User not authenticated for chat');
          // Redirect to login or handle authentication
        } else {
          console.log('Unknown chat error:', error.message);
        }
        
        // Set empty messages array on error to prevent crashes
        setMessages([]);
      }
    );

    return () => unsubscribe();
  }, [currentUser, friendName, chatId]);

  // Send message to Firestore
  const handleSendMessage = async () => {
    if (message.trim() && currentUser) {
      try {
        const chatDocRef = doc(db, 'chats', chatId);
        
        // First get current unread count for the receiver
        const chatDoc = await getDoc(chatDocRef);
        const encodedFriendName = encodeEmail(friendName);
        const currentUnreadCount = chatDoc.exists() 
          ? (chatDoc.data()[`unreadCounts.${encodedFriendName}`] || 0)
          : 0;

        // Update chat document with incremented unread count
        const encodedCurrentUser = encodeEmail(currentUser);
        const updateData = {
          participants: [currentUser, friendName],
          lastUpdated: serverTimestamp(),
          lastMessage: message.trim(),
          lastMessageSender: currentUser,
          [`unreadCounts.${encodedFriendName}`]: currentUnreadCount + 1,
          [`unreadCounts.${encodedCurrentUser}`]: 0, // Sender always has 0 unread
          // Clean up old nested unreadCounts object if it exists
          unreadCounts: deleteField()
        };

        await setDoc(chatDocRef, updateData, { merge: true });

        // Add the message to the subcollection
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          text: message.trim(),
          sender: currentUser,
          receiver: friendName,
          timestamp: serverTimestamp(),
          senderUid: currentUserUid,
          read: false
        });

        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Something went wrong. Please try again later.');
      }
    }
  };

  // Render message bubble
  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender === currentUser;
    const messageTime = item.timestamp?.toDate?.()?.toLocaleTimeString?.([], {
      hour: '2-digit',
      minute: '2-digit'
    }) || '';

    return (
      <View style={[styles.messageRow, { 
        justifyContent: isMyMessage ? 'flex-end' : 'flex-start' 
      }]}>
        {!isMyMessage && (
          <View style={styles.senderAvatar}>
            <Text style={styles.senderAvatarText}>
              {item.sender?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        )}
        
        <View style={[styles.messageContainer, {
          backgroundColor: isMyMessage ? '#4A6D51' : '#FFFFFF',
          marginLeft: isMyMessage ? 50 : 10,
          marginRight: isMyMessage ? 10 : 50,
          borderTopLeftRadius: isMyMessage ? 20 : 5,
          borderTopRightRadius: isMyMessage ? 5 : 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }]}>
          <Text style={[styles.messageText, { 
            color: isMyMessage ? '#FFFFFF' : '#333333' 
          }]}>
            {item.text}
          </Text>
          
          <View style={styles.messageFooter}>
            <Text style={[styles.timestamp, { 
              color: isMyMessage ? 'rgba(255,255,255,0.7)' : '#828282' 
            }]}>
              {messageTime}
            </Text>
            
            {isMyMessage && (
              <View style={styles.messageStatus}>
                <Feather name="check-circle" size={12} color="rgba(255,255,255,0.7)" />
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 85 : 0}
      >
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.header}>
              <View style={styles.headerCenter}>
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {friendName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.headerInfo}>
                  <Text style={styles.headerTitle}>
                    {friendName.split('@')[0]}
                  </Text>
                  <Text style={styles.headerSubtitle}>Online • Last seen recently</Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.menuButton}>
                <Feather name="more-vertical" size={24} color="#4A6D51" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          {/* Messages List */}
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item, index) => {
              // Create a unique key using multiple fallback strategies
              if (item.id) {
                return item.id;
              }
              if (item.timestamp) {
                // Use timestamp + sender + index for uniqueness
                const timestampStr = item.timestamp.seconds ? 
                  item.timestamp.seconds.toString() : 
                  item.timestamp.toString();
                return `${timestampStr}_${item.sender}_${index}`;
              }
              // Final fallback using sender, text hash, and index (no Date.now())
              const textHash = item.text ? item.text.length : 0;
              return `${item.sender || 'unknown'}_${textHash}_${index}`;
            }}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
            inverted={false}
            keyboardShouldPersistTaps="handled"
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
            }}
          />
        </View>

        {/* Input Container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#828282"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={1000}
              onFocus={() => {
                // Scroll to bottom when input is focused
                setTimeout(() => {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }, 300);
              }}
            />
            
            <TouchableOpacity style={styles.attachButton}>
              <Feather name="paperclip" size={20} color="#828282" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={[styles.sendButton]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            activeOpacity={0.8}
          >
            <Feather 
              name="send" 
              size={20} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E8F0E2',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  headerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#828282',
    marginTop: 2,
  },
  menuButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#F9F9F4',
  },
  messagesContainer: {
    paddingVertical: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 0,
  },
  senderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F0E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 6,
  },
  senderAvatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  messageContainer: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  messageStatus: {
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#F9F9F4',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 12,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    maxHeight: 120,
    paddingVertical: 8,
  },
  attachButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A6D51',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A6D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});

