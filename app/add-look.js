import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useWardrobe } from '../context/wardrobeContext';
import { useAuth } from '../context/AuthContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, updateDoc, arrayUnion, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const WINDOW_WIDTH = Dimensions.get('window').width;

export default function AddLookScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { savedOutfits } = useWardrobe();
  const { user, userData } = useAuth();
  const [loadingOutfits, setLoadingOutfits] = useState(new Set());

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Look to Profile',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => router.push('/userProfile')}
          style={{ marginLeft: 15 }}
        >
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, router]);

  // Check if an outfit is already in the user's profile looks
  const isOutfitInProfile = (outfitId) => {
    return (userData?.looks || []).some(look => look.outfitId === outfitId);
  };

  const addToProfile = async (outfit) => {
    if (!user?.uid) return;
    
    setLoadingOutfits(prev => new Set(prev).add(outfit.id));

    try {
      const userRef = doc(db, "users", user.uid);
      
      // Ensure the user document exists
      await setDoc(userRef, {}, { merge: true });
      
      // Create the look object to add to profile
      const profileLook = {
        id: `look-${outfit.id}-${Date.now()}`,
        outfitId: outfit.id,
        outfitName: outfit.name,
        outfitImageUri: outfit.imageUri,
        outfitDescription: outfit.description || '',
        addedAt: new Date().toISOString(),
        itemCount: outfit.items?.length || 0
      };

      // Add to user's looks array
      await updateDoc(userRef, {
        looks: arrayUnion(profileLook),
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error adding look to profile:', error);
      Alert.alert('Error', 'Failed to add look to profile. Please try again.');
    } finally {
      setLoadingOutfits(prev => {
        const newSet = new Set(prev);
        newSet.delete(outfit.id);
        return newSet;
      });
    }
  };

  const removeFromProfile = async (outfit) => {
    if (!user?.uid) return;
    
    setLoadingOutfits(prev => new Set(prev).add(outfit.id));

    try {
      const userRef = doc(db, "users", user.uid);
      
      // Filter out the look to remove from the looks array
      const updatedLooks = (userData?.looks || []).filter(look => look.outfitId !== outfit.id);
      
      await updateDoc(userRef, {
        looks: updatedLooks,
        lastUpdated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error removing look from profile:', error);
      Alert.alert('Error', 'Failed to remove look from profile. Please try again.');
    } finally {
      setLoadingOutfits(prev => {
        const newSet = new Set(prev);
        newSet.delete(outfit.id);
        return newSet;
      });
    }
  };

  const handleButtonPress = (outfit) => {
    if (isOutfitInProfile(outfit.id)) {
      removeFromProfile(outfit);
    } else {
      addToProfile(outfit);
    }
  };

  const renderOutfitCard = ({ item: outfit }) => (
    <TouchableOpacity
      style={styles.outfitContainer}
      onPress={() => router.push({ pathname: '/outfit/[id]', params: { id: outfit.id } })}
      activeOpacity={0.8}
    >
      {outfit.imageUri ? (
        <Image 
          source={{ uri: outfit.imageUri }} 
          style={styles.outfitImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholderImage}>
          <MaterialCommunityIcons name="tshirt-crew" size={40} color="#CCCCCC" />
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.addButton,
          loadingOutfits.has(outfit.id) && styles.addButtonDisabled
        ]}
        onPress={() => handleButtonPress(outfit)}
        disabled={loadingOutfits.has(outfit.id)}
      >
        {loadingOutfits.has(outfit.id) ? (
          <ActivityIndicator size="small" color="#4A6D51" />
        ) : (
          <Feather 
            name={isOutfitInProfile(outfit.id) ? "minus" : "plus"} 
            size={20} 
            color="#4A6D51" 
          />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.pageTitle}>Add Look to Profile</Text>
        
        <Text style={styles.subtitle}>
          Choose an outfit from your saved collection to showcase on your profile
        </Text>

        {savedOutfits.length > 0 ? (
          <FlatList
            data={savedOutfits}
            keyExtractor={(item) => item.id}
            renderItem={renderOutfitCard}
            numColumns={3}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="package" size={48} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No Saved Outfits</Text>
            <Text style={styles.emptyText}>
              You need to create and save some outfits first before you can add them to your profile.
            </Text>
            <TouchableOpacity
              style={styles.createOutfitButton}
              onPress={() => router.push('/wardrobe/add-outfit')}
            >
              <Text style={styles.createOutfitButtonText}>Create Your First Outfit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#828282',
    marginBottom: 20,
    lineHeight: 22,
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  outfitContainer: {
    flex: 1,
    margin: 5,
    maxWidth: (WINDOW_WIDTH - 60) / 3,
    padding: 4,
    alignItems: 'center',
    height: 128,
    position: 'relative',
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
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  createOutfitButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 15,
  },
  createOutfitButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 16,
  },
}); 