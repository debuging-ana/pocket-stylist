import React, { 
  useState, 
  useEffect, 
  useRef } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform} from 'react-native';


import { db } from '../../firebaseConfig';

import { 
  useLocalSearchParams, 
  useRouter 
} from 'expo-router';

import { getAuth } from 'firebase/auth';


import { addDoc, collection, doc, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';


export default function Chat() {
  const { friendName } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const flatListRef = useRef(null);

  const currentUserUid = getAuth().currentUser?.uid;
  const chatId = [currentUserUid, friendUid].sort().join('_');

  useEffect(() => {
  const chatDocRef = doc(db, 'chats', chatId);
  setDoc(chatDocRef, {
    participants: [currentUser, friendName],
    lastUpdated: new Date()
  }, { merge: true });

  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('timestamp')
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const newMessages = snapshot.docs.map((doc) => doc.data());
    setMessages(newMessages);
  });

  return () => unsubscribe();
  }, [currentUser, friendName]);

  // Send message to Firestore
  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
        // Ensure the chat document exists
        const chatDocRef = doc(db, 'chats', chatId);
        await setDoc(chatDocRef, {
          participants: [currentUser, friendName],
          lastUpdated: new Date()
        }, { merge: true });

        // Add the message to the subcollection
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          text: message.trim(),
          sender: currentUser,
          receiver: friendName,
          timestamp: new Date()
        });

        setMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        alert('Something went wrong. Please try again later.');
      }
    }
  };



  // Render message bubble
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        {
          alignSelf: item.sender === currentUser ? 'flex-end' : 'flex-start',
          backgroundColor: item.sender === currentUser ? '#DCF8C6' : '#E8F0E2'
        }
      ]}
    >
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {item.timestamp?.toDate?.()?.toLocaleTimeString?.([], {
          hour: '2-digit',
          minute: '2-digit'
        }) || ''}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Chat with {friendName}</Text>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(_, index) => index.toString()}
        style={styles.messagesList}
        contentContainerStyle={{ paddingBottom: 10 }}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
        >
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },
  backButton: {
    marginBottom: 10
  },
  backButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500'
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  messagesList: {
    flex: 1
  },
  messageContainer: {
    maxWidth: '75%',
    padding: 10,
    borderRadius: 12,
    marginVertical: 5
  },
  messageText: {
    fontSize: 16
  },
  timestamp: {
    fontSize: 10,
    color: '#555',
    alignSelf: 'flex-end',
    marginTop: 4
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  textInput: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 25,
    marginRight: 10
  },
  sendButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 25
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});

