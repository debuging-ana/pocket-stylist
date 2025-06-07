import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useAuth } from './AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const NotificationContext = createContext();

// Helper function to encode email for Firebase field names
const encodeEmail = (email) => {
  return email.replace(/\./g, '_dot_').replace(/@/g, '_at_');
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [hasUnreadMessages, setHasUnreadMessages] = useState({});
  const [totalHasUnread, setTotalHasUnread] = useState(false);

  useEffect(() => {
    const currentUser = user?.email || getAuth().currentUser?.email;
    
    if (!currentUser) {
      setHasUnreadMessages({});
      setTotalHasUnread(false);
      return;
    }

    // Listen for chats where user is a participant
    const chatsQuery = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser)
    );

    const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
      // Check if user is still authenticated before processing
      if (!currentUser || !user?.email) return;
      
      console.log('🔔 NotificationContext: Chat snapshot received', snapshot.docs.length, 'chats');
      const chatUnreadStatus = {};
      let hasAnyUnread = false;

      snapshot.docs.forEach((chatDoc) => {
        const chatData = chatDoc.data();
        const chatId = chatDoc.id;
        
        console.log('📊 Processing chat:', chatId);
        
        // Read from the flat encoded field
        const encodedCurrentUser = encodeEmail(currentUser);
        const flatFieldKey = `unreadCounts.${encodedCurrentUser}`;
        
        // Try to get unread count from flat field first (new format)
        let unreadMessages = chatData[flatFieldKey];
        
        // If flat field doesn't exist, try to read from old nested format as fallback
        if (unreadMessages === undefined && chatData.unreadCounts && typeof chatData.unreadCounts === 'object') {
          unreadMessages = chatData.unreadCounts[encodedCurrentUser];
          console.log('⚠️ Using fallback nested format');
        }
        
        // Default to 0 if still undefined
        unreadMessages = unreadMessages || 0;
        
        console.log('📬 Unread count for', currentUser, 'in chat', chatId, ':', unreadMessages);
        
        if (unreadMessages > 0) {
          // Find the other participant
          const otherParticipant = chatData.participants?.find(p => p !== currentUser);
          if (otherParticipant) {
            chatUnreadStatus[otherParticipant] = true;
            hasAnyUnread = true;
            console.log('🔴 Setting unread status for', otherParticipant, '= true');
          }
        } else {
          const otherParticipant = chatData.participants?.find(p => p !== currentUser);
          if (otherParticipant) {
            console.log('✅ No unread messages for', otherParticipant);
          }
        }
      });
      
      console.log('🎯 Final unread status:', chatUnreadStatus);
      console.log('📱 Total has unread:', hasAnyUnread);
      
      setHasUnreadMessages(chatUnreadStatus);
      setTotalHasUnread(hasAnyUnread);
    }, (error) => {
      // Check if user is still authenticated before handling error
      if (!currentUser || !user?.email) return;
      
      // Ignore permission-denied errors during logout
      if (error.code === 'permission-denied') {
        console.log('NotificationContext: Permission denied (likely during logout)');
        return;
      }
      
      console.error('NotificationContext snapshot error:', error);
    });

    return () => unsubscribe();
  }, [user]);

  // Mark messages as read for a specific chat
  const markChatAsRead = async (friendEmail) => {
    const currentUser = user?.email || getAuth().currentUser?.email;
    console.log('📖 markChatAsRead called for', friendEmail, 'by', currentUser);
    
    if (!currentUser || !friendEmail) {
      console.log('❌ Missing currentUser or friendEmail');
      return;
    }

    try {
      const chatId = [currentUser, friendEmail].sort().join('_').replace(/[^a-zA-Z0-9_]/g, '_');
      const chatRef = doc(db, 'chats', chatId);
      
      console.log('🔄 Marking chat as read:', chatId);
      
      const encodedCurrentUser = encodeEmail(currentUser);
      const updateField = `unreadCounts.${encodedCurrentUser}`;
      console.log('🔄 Setting field', updateField, 'to 0');
      
      await updateDoc(chatRef, {
        [updateField]: 0
      });
      
      console.log('✅ Chat marked as read successfully');
    } catch (error) {
      console.error('❌ Error marking chat as read:', error);
    }
  };

  const value = {
    hasUnreadMessages,
    totalHasUnread,
    markChatAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 