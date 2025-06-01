import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, TextInput, StatusBar, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ExplorePage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [likedImages, setLikedImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBoardSelection, setShowBoardSelection] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user, userData, addPinToBoard } = useAuth();

  const [images] = useState([
    { id: 1, uri: require('../assets/images/image1.jpeg'), category: ['All', 'Casual'] },
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

  /*
  handles the add to board button press for an image
  this function initiates the saving process
  how it works:
  1. stores the selected image in state so we know which image to save
  2. shows the board selection modal so user can choose where to save it
  */
  const handleAddToBoard = (image) => {
    setSelectedImage(image);
    setShowBoardSelection(true);
  };

  /*
    saves the selected image to a specific board
    how it works:
    1. finds the selected board in the users boards
    2. checks if the pin already exists prevents duplicates
    3. creates a pin object with required fields
    4. calls addPinToBoard from our authcontext to save to firestore
    5. shows success or error messages
  */
  const handleBoardSelect = async (boardId) => {
    // safety check - make sure we have an image & user data
    if (!selectedImage || !userData) return;

    try {
      const board = (userData?.boards || []).find(b => b.id === boardId);

      // Check if pin already exists in board
      const isDuplicate = board?.pins?.some(pin => pin.id === selectedImage.id.toString());
      if (isDuplicate) {
        Alert.alert("Duplicate Pin", "This pin is already in the board");
        return;
      }

      // create the pin object to save
      const pinToAdd = {
        id: selectedImage.id.toString(), // unique id for the pin
        imageUri: Image.resolveAssetSource(selectedImage.uri).uri,
        title: `Pin ${selectedImage.id}`,        
        ownerId: user.uid, // required by firestore security rules                       
        createdAt: new Date().toISOString() // timestamp for ordering pins       
      };

      // saves the pin to the board using our context function
      await addPinToBoard(boardId, pinToAdd);
      Alert.alert("Success", "Pin added to board!");
    } catch (error) {
      Alert.alert("Error", "Failed to add pin to board");
    } finally {
      setShowBoardSelection(false);
    }
  };

  // toggles like state for an image local only
  const toggleLike = (id) => {
    setLikedImages(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filteredImages = activeTab === 'All'
    ? images
    : images.filter(image => image.category.includes(activeTab));

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* header with search & category tabs */}
        <View style={styles.headerContainer}>
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
        {/* main image grid */}
        <View style={styles.imageGridContainer}>
          {filteredImages.map((image) => (
            <View key={image.id} style={styles.imageCard}>
              <Image
                source={image.uri}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.imageActions}>
                {/* add to board button - triggers the saving flow */}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleAddToBoard(image)}
                >
                  <Text style={styles.actionButtonText}>Add to Board</Text>
                  <Feather name="arrow-right" size={14} color="#4A6D51" style={{ marginLeft: 5 }} />
                </TouchableOpacity>
                {/* like button local only */}
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
        {/*
          board selection modal appears when user wants to save an image to a board
          how it works:
          1. appears when showBoardSelection is true
          2. lists all users boards from userData
          3. each board is clickable and triggers handleBoardSelect
        */}
        <Modal
          visible={showBoardSelection}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowBoardSelection(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Select Board</Text>
              {(userData?.boards || []).map(board => (
                <TouchableOpacity
                  key={board.id}
                  style={styles.boardItem}
                  onPress={() => handleBoardSelect(board.id)}
                >
                  <Text style={styles.boardName}>{board.title}</Text>
                  <Text style={styles.pinCount}>{board.pins?.length || 0} Pins</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowBoardSelection(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    paddingTop: 20,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 15,
    textAlign: 'center',
  },
  boardItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  boardName: {
    fontSize: 16,
    color: '#4A6D51',
    fontWeight: '600',
  },
  pinCount: {
    fontSize: 12,
    color: '#828282',
    marginTop: 4,
  },
  closeButton: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
  },
});

export default ExplorePage;