import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { collection, addDoc, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebaseConfig';  // Import your Firebase config
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAuth } from 'firebase/auth';

export default function Chat() {
  const { friendName } = useLocalSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const currentUser = getAuth().currentUser?.displayName;  // Get current user's display name

  // Fetch messages when the component mounts
  useEffect(() => {
    const q = query(
      collection(db, 'messages'),
      where('sender', 'in', [currentUser, friendName]),  // Messages sent by the current user or friend
      where('receiver', 'in', [currentUser, friendName]),  // Messages received by the current user or friend
      orderBy('timestamp')  // Order messages by timestamp
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map((doc) => doc.data());
      setMessages(newMessages);
    });

    return () => unsubscribe();  // Unsubscribe from Firestore listener when component unmounts
  }, [currentUser, friendName]);

  // Send message to Firestore
  const handleSendMessage = async () => {
    if (message.trim()) {
      try {
      // Firestore write operation or any other API call
      console.log('Sending message:', { text: message, sender: currentUser, receiver: friendName });
      await addDoc(collection(db, 'messages'), {
        text: message,
        sender: currentUser, 
        receiver: friendName,
        timestamp: new Date(),
      });
      } catch (error) {
      console.error('Error sending message:', error);
      alert('Something went wrong. Please try again later.');
      }
    }
  };

  // Render each message in the chat
  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        { backgroundColor: item.sender === currentUser ? '#A9D1A9' : '#E8F0E2' },  // Different color based on sender
      ]}
    >
      <Text style={styles.message}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Chat with {friendName}</Text>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        style={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}  // Update the message as user types
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  messagesList: {
    flex: 1,
    marginBottom: 20,
  },
  messageContainer: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
  message: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 20,
  },
  sendButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

