import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useIsFocused } from '@react-navigation/native';

export default function SavedOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // Refresh on screen focus

  const auth = getAuth();
  const db = getFirestore();

  const fetchSavedOutfits = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      setLoading(true);
      const savedRef = collection(db, 'users', user.uid, 'savedOutfits');
      const snapshot = await getDocs(savedRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOutfits(data);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch saved outfits.');
    } finally {
      setLoading(false);
    }
  };

  const deleteOutfit = async (id) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'savedOutfits', id));
      fetchSavedOutfits(); // Refresh after deletion
    } catch (err) {
      Alert.alert('Error', 'Failed to delete outfit.');
    }
  };

  useEffect(() => {
    if (isFocused) fetchSavedOutfits();
  }, [isFocused]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      <TouchableOpacity style={styles.deleteButton} onPress={() => deleteOutfit(item.id)}>
        <Text style={styles.deleteButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Outfits</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : outfits.length === 0 ? (
        <Text style={styles.emptyText}>You have no saved outfits yet.</Text>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

// 💄 Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 20
  },
  emptyText: {
    color: '#888',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50
  },
  list: {
    paddingBottom: 20
  },
  card: {
    marginBottom: 20,
    backgroundColor: '#F0F0F0',
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10
  },
  deleteButton: {
    marginTop: 10,
    backgroundColor: '#AA4E4E',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold'
  }
});
