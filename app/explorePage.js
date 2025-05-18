/*
 Fashion Browse Screen - the main exploration feed for fashion content/pins
 features:
 - browse fashion images by category (casual, streetwear etc.)
 - like/ save favourite items (does not save to userProfile yet tho!)
 - search for users (i didnt do this one)
 - responsive image grid layout
 - edit user profile quick access 
 - julz
*/

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const FashionBrowseScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [likedImages, setLikedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  //fashion content/pins.. need to add more
  const [images, setImages] = useState([
    { id: 1, uri: require('../assets/images/image1.jpeg'), category: ['All', 'Casual']},
    { id: 2, uri: require('../assets/images/image2.jpeg'), category: ['All', 'Casual'] },
    { id: 3, uri: require('../assets/images/image3.jpeg'), category: ['All', 'Streetwear'] },
    { id: 4, uri: require('../assets/images/image4.jpeg'), category: ['All', 'Streetwear'] },
    { id: 5, uri: require('../assets/images/image5.jpeg'), category: ['All', 'Casual'] },
    { id: 6, uri: require('../assets/images/image6.jpeg'), category: ['All', 'Casual'] },
    { id: 7, uri: require('../assets/images/image7.jpeg'), category: ['All', 'Formal'] },
    { id: 8, uri: require('../assets/images/image8.jpeg'), category: ['All', 'Streetwear'] },
    { id: 9, uri: require('../assets/images/image9.jpeg'), category: ['All', 'Streetwear'] },
    { id: 10, uri: require('../assets/images/image10.jpeg'), category: ['All', 'Streetwear'] },
    { id: 11, uri: require('../assets/images/image11.jpeg'), category: ['All', 'Formal'] },
    { id: 12, uri: require('../assets/images/image12.jpeg'), category: ['All', 'Formal'] },
  ]);

  //toggles like status for image, adds or removes the image id from likedImages array
  const toggleLike = (id) => {
    if (likedImages.includes(id)) {
      setLikedImages(likedImages.filter(imageId => imageId !== id));
    } else {
      setLikedImages([...likedImages, id]);
    }
  };

  //filters images based on active tab selection, shows all images for 'All' or filters by category
  const filteredImages = activeTab === 'All' 
  ? images 
  : images.filter(image => image.category.includes(activeTab));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          {/* Search Bar */}
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#7D7D7D" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for users..."
              placeholderTextColor="#828282"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Navigation Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.tabContainer}
          >
            {['All', 'Casual', 'Streetwear', 'Formal', 'Sporty'].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Image Grid */}
        <View style={styles.imageGridContainer}>
          {filteredImages.map((image) => (
            <View key={image.id} style={styles.imageCard}>
              <Image 
                source={image.uri} 
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {/* Will connect to userProfile.js boards later */}}
                >
                  <Text style={styles.actionButtonText}>Add to Board</Text>
                  <Feather name="arrow-right" size={14} color="#4A6D51" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.heartButton}
                  onPress={() => toggleLike(image.id)}
                >
                  <Ionicons
                    name={likedImages.includes(image.id) ? "heart" : "heart-outline"}
                    size={24}
                    color={likedImages.includes(image.id) ? "#995454" : "#DFBDBD"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20, // Added more top padding to account for removed header
    paddingBottom: 0,
    backgroundColor: '#F9F9F4',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 10,
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
  tabContainer: {
    paddingVertical: 15,
    paddingHorizontal: 0,
    marginBottom: 3,
    backgroundColor: '#F9F9F4',
  },
  tab: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 7,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#4A6D51',
  },
  tabText: {
    fontSize: 16,
    color: '#828282',
  },
  activeTabText: {
    color: '#4A6D51',
    fontWeight: 'bold',
  },
  imageGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  imageCard: {
    width: '48%',
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 170, 
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  actionButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 12,
  },
  heartButton: {
    padding: 5,
  },
});

export default FashionBrowseScreen;