import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Dimensions, TextInput } from 'react-native';
import { useWardrobe } from '../context/wardrobeContext';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing, deviceWidth, getGridItemWidth } from '../utils/responsive';

const WINDOW_WIDTH = deviceWidth;
const ITEM_WIDTH = getGridItemWidth(60, 20); // 3 columns with responsive padding

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

  const renderItem = ({ item, index }) => {
    // Calculate column position (0 = left, 1 = middle, 2 = right)
    const columnIndex = index % 3;
    
    // Apply different margins based on column position
    const getContainerStyle = () => {
      const baseStyle = styles.outfitContainer;
      switch (columnIndex) {
        case 0: // First column (left) - fixed left position
          return [baseStyle, { marginLeft: 0, marginRight: 0 }];
        case 1: // Middle column - perfectly centered with fixed margins
          return [baseStyle, { marginLeft: 5, marginRight: 5 }];
        case 2: // Right column - fixed right position
          return [baseStyle, { marginLeft: 0, marginRight: 0 }];
        default:
          return baseStyle;
      }
    };

    return (
      <TouchableOpacity 
        style={getContainerStyle()}
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
  };

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
    marginTop: scaleSpacing(12),
    fontSize: scaleFontSize(16),
    color: '#828282',
  },
  title: {
    fontSize: scaleFontSize(26),
    fontWeight: 'bold',
    color: '#4A6D51',
    margin: scaleSpacing(20),
    marginBottom: 0,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(12),
    marginTop: scaleSpacing(20),
    marginLeft: scaleSpacing(20),
    marginRight: scaleSpacing(20),
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scaleSpacing(40),
  },
  emptyTitle: {
    fontSize: scaleFontSize(22),
    fontWeight: '600',
    color: '#4A6D51',
    marginTop: scaleSpacing(20),
    marginBottom: scaleSpacing(8),
  },
  emptyText: {
    fontSize: scaleFontSize(16),
    color: '#828282',
    textAlign: 'center',
    lineHeight: scaleHeight(24),
  },
  list: {
    padding: scaleSpacing(20),
    paddingTop: 0,
  },
  outfitContainer: {
    flex: 1,
    maxWidth: getGridItemWidth(60, 20),
    width: getGridItemWidth(60, 20),
    padding: scaleSpacing(4),
    alignItems: 'center',
    height: scaleHeight(128),
    marginBottom: scaleSpacing(1),
  },
  outfitImage: {
    width: scaleSize(120),
    height: scaleSize(120),
    borderRadius: scaleSize(8),
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
    width: scaleSize(120),
    height: scaleSize(120),
    backgroundColor: '#F5F5F5',
    borderRadius: scaleSize(8),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
