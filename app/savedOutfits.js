import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { useWardrobe } from '../context/wardrobeContext';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const WINDOW_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = (WINDOW_WIDTH - 60) / 3; // 3 columns with padding

export default function SavedOutfits() {
  const { savedOutfits, loading, deleteOutfit } = useWardrobe();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  // Filter outfits based on search query (keep newest first)
  const filteredOutfits = useMemo(
    () => savedOutfits
      .filter(outfit => outfit.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        // Sort by creation date, newest first
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB - dateA;
      }),
    [savedOutfits, searchQuery]
  );

  const handleOutfitPress = (outfitId) => {
    router.push(`/outfit/${outfitId}`);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.outfitContainer}
      onPress={() => handleOutfitPress(item.id)}
      activeOpacity={0.8}
    >
      {item.imageUri ? (
        <Image 
          source={{ uri: item.imageUri }} 
          style={styles.outfitImage} 
          resizeMode="cover"
          onLoad={() => console.log('Image loaded successfully for outfit:', item.name)}
          onError={(error) => console.log('Image failed to load for outfit:', item.name, error.nativeEvent.error)}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <MaterialCommunityIcons name="tshirt-crew" size={40} color="#CCCCCC" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6D51" />
        <Text style={styles.loadingText}>Loading outfits...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saved Outfits</Text>
      
      {/* Search Bar */}
      <View style={styles.searchInputContainer}>
        <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search your outfits..."
          placeholderTextColor="#828282"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {savedOutfits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="tshirt-crew-outline" size={80} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Saved Outfits</Text>
          <Text style={styles.emptyText}>
            Create your first outfit in the Wardrobe tab!
          </Text>
        </View>
      ) : filteredOutfits.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="magnify" size={80} color="#CCCCCC" />
          <Text style={styles.emptyTitle}>No Matching Outfits</Text>
          <Text style={styles.emptyText}>
            Try adjusting your search terms
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredOutfits}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          numColumns={3}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9F9F4',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#828282',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    margin: 20,
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 20,
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
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#4A6D51',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    lineHeight: 24,
  },
  list: {
    padding: 20,
  },
  outfitContainer: {
    flex: 1,
    margin: 5,
    maxWidth: (WINDOW_WIDTH - 60) / 3,
    padding: 4,
    alignItems: 'center',
    height: 128,
  },
  outfitImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#4A6D51',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6D51',
  },
});
