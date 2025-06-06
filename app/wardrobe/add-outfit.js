import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system';

const WINDOW_WIDTH = Dimensions.get('window').width;
const DROP_ZONE_SIZE = WINDOW_WIDTH - 40;
const ITEM_SIZE = 60;

export default function AddOutfitScreen() {
  const router = useRouter();
  const { wardrobeItems, addOutfit } = useWardrobe();
  const [selectedItems, setSelectedItems] = useState({
    tops: [],
    bottoms: [],
    jackets: [],
    shoes: [],
    accessories: [],
  });
  const [step, setStep] = useState('selection'); // 'selection' or 'arrangement'
  const [outfitLayout, setOutfitLayout] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Ref for capturing the drop zone
  const dropZoneRef = useRef();

  // Group items by category
  const itemsByCategory = wardrobeItems.reduce((acc, item) => {
    const category = item.category.toLowerCase();
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  const hasMinimumSelection = () => {
    // Check if at least one category has items selected
    return Object.values(selectedItems).some(items => items.length > 0);
  };

  const toggleItemSelection = (category, item) => {
    setSelectedItems(prev => ({
      ...prev,
      [category]: prev[category].includes(item)
        ? prev[category].filter(i => i.id !== item.id)
        : [...prev[category], item]
    }));
  };

  // Function to add item to outfit layout
  const addToOutfitLayout = useCallback((item, x, y) => {
    const relativeX = Math.max(0, Math.min(x - ITEM_SIZE/2, DROP_ZONE_SIZE - ITEM_SIZE));
    const relativeY = Math.max(0, Math.min(y - ITEM_SIZE/2, DROP_ZONE_SIZE - ITEM_SIZE));
    
    setOutfitLayout(current => [
      ...current, 
      { 
        ...item, 
        id: `${item.id}-${Date.now()}`, // Unique ID for multiple instances
        x: relativeX,
        y: relativeY,
        scale: 1.0
      }
    ]);
  }, []);

  // Function to update item in layout
  const updateItemInLayout = useCallback((itemId, updates) => {
    setOutfitLayout(current => 
      current.map(item => 
        item.id === itemId 
          ? { ...item, ...updates }
          : item
      )
    );
  }, []);

  // Function to remove item from layout
  const removeFromOutfitLayout = useCallback((itemId) => {
    setOutfitLayout(current => current.filter(item => item.id !== itemId));
    setSelectedItemId(null);
  }, []);

  // Function to capture the outfit arrangement as an image
  const captureOutfitImage = async () => {
    try {
      if (!dropZoneRef.current) {
        throw new Error('Drop zone ref not available');
      }

      // Hide buttons during capture
      setIsCapturing(true);
      
      // Wait a brief moment for the state change to take effect
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the drop zone as an image with permanent storage
      const uri = await captureRef(dropZoneRef, {
        format: 'png',
        quality: 1.0,
        result: 'base64',
      });

      // Convert base64 to a file URI in the document directory for persistence
      const filename = `outfit_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Show buttons again
      setIsCapturing(false);

      return fileUri;
    } catch (error) {
      console.error('Error capturing outfit image:', error);
      setIsCapturing(false); // Make sure to reset state on error
      throw error;
    }
  };

  // Function to save the complete outfit
  const saveOutfit = async () => {
    if (outfitLayout.length === 0) {
      alert('Please add at least one item to your outfit before saving.');
      return;
    }

    if (!outfitName.trim()) {
      alert('Please enter a name for your outfit before saving.');
      return;
    }

    setIsSaving(true);
    try {
      console.log('Starting outfit save process...');
      console.log('Current outfit layout:', outfitLayout);
      
      // Capture the outfit arrangement as an image
      console.log('Capturing outfit image...');
      const outfitImageUri = await captureOutfitImage();
      console.log('Outfit image captured:', outfitImageUri);
      
      // Create outfit data
      const outfitData = {
        id: `outfit-${Date.now()}`,
        name: outfitName.trim(),
        description: outfitDescription.trim(),
        items: outfitLayout,
        selectedItems: selectedItems,
        imageUri: outfitImageUri,
        createdAt: new Date(),
      };

      console.log('Outfit data prepared:', outfitData);

      // Validate addOutfit function exists
      if (!addOutfit) {
        throw new Error('addOutfit function not available from wardrobe context');
      }

      // Save to wardrobe context
      console.log('Saving outfit to Firestore...');
      await addOutfit(outfitData);
      
      console.log('Outfit saved successfully to Firestore!');
      
      // Show success message
      alert('Outfit saved successfully! 🎉\nYou can view it in the Saved Outfits tab.');
      
      // Navigate back to wardrobe with a slight delay to ensure the alert is shown
      setTimeout(() => {
        router.push('/wardrobe');
      }, 500);
      
    } catch (error) {
      console.error('Error saving outfit:', error);
      console.error('Error details:', error.message);
      alert(`Failed to save outfit: ${error.message}\nPlease try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  // Draggable item component for the selected items row
  const DraggableItem = ({ item }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    const panGesture = Gesture.Pan()
      .onBegin(() => {
        scale.value = withSpring(1.1);
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event) => {
        // Check if dropped in the drop zone area (approximate)
        const dropZoneTop = 250; // Approximate position from top
        const dropZoneBottom = dropZoneTop + DROP_ZONE_SIZE;
        
        if (event.absoluteY > dropZoneTop && event.absoluteY < dropZoneBottom) {
          const relativeY = event.absoluteY - dropZoneTop;
          runOnJS(addToOutfitLayout)(item, event.absoluteX - 20, relativeY);
        }
        
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
      });

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.draggableItem, animatedStyle]}>
          <Image
            source={{ uri: item.imageUri }}
            style={styles.draggableItemImage}
          />
        </Animated.View>
      </GestureDetector>
    );
  };

  const renderCategorySection = (category, items) => {
    if (!items || items.length === 0) return null;
    
    return (
      <View style={styles.categorySection} key={category}>
        <Text style={styles.categoryTitle}>
          {category.charAt(0).toUpperCase() + category.slice(1)}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.itemsRow}>
            {items.map(item => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemCard,
                  selectedItems[category].includes(item) && styles.selectedItemCard
                ]}
                onPress={() => toggleItemSelection(category, item)}
              >
                <Image
                  source={{ uri: item.imageUri }}
                  style={styles.itemImage}
                />
                {selectedItems[category].includes(item) && (
                  <View style={styles.selectedOverlay}>
                    <Feather name="check-circle" size={24} color="#4A6D51" />
                  </View>
                )}
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };

  // Component for items dropped in the white box
  const DroppedItem = ({ item }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(item.scale || 1);
    const savedScale = useSharedValue(item.scale || 1);
    const isSelected = selectedItemId === item.id;

    // Pan gesture for moving items
    const panGesture = Gesture.Pan()
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd(() => {
        const newX = Math.max(0, Math.min(item.x + translateX.value, DROP_ZONE_SIZE - (ITEM_SIZE * scale.value)));
        const newY = Math.max(0, Math.min(item.y + translateY.value, DROP_ZONE_SIZE - (ITEM_SIZE * scale.value)));
        
        runOnJS(updateItemInLayout)(item.id, { x: newX, y: newY });
        
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      });

    // Tap gesture for selection
    const tapGesture = Gesture.Tap()
      .onEnd(() => {
        runOnJS(setSelectedItemId)(isSelected ? null : item.id);
      });

    // Resize handle component
    const ResizeHandle = () => {
      const resizeGesture = Gesture.Pan()
        .onBegin(() => {
          savedScale.value = scale.value;
        })
        .onUpdate((event) => {
          const scaleChange = (event.translationX + event.translationY) * 0.005;
          const newScale = Math.max(0.5, Math.min(2.5, savedScale.value + scaleChange));
          scale.value = newScale;
        })
        .onEnd(() => {
          runOnJS(updateItemInLayout)(item.id, { scale: scale.value });
          savedScale.value = scale.value;
        });

      return (
        <GestureDetector gesture={resizeGesture}>
          <View style={styles.resizeHandle}>
            <MaterialCommunityIcons name="resize-bottom-right" size={12} color="#FFFFFF" />
          </View>
        </GestureDetector>
      );
    };

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    }));

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.droppedItem,
            {
              left: item.x,
              top: item.y,
            },
            animatedStyle
          ]}
        >
          <GestureDetector gesture={tapGesture}>
            <View style={StyleSheet.absoluteFill}>
              <Image
                source={{ uri: item.imageUri }}
                style={styles.droppedItemImage}
              />
            </View>
          </GestureDetector>
          
          {isSelected && !isCapturing && (
            <>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeFromOutfitLayout(item.id)}
              >
                <Feather name="x" size={12} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.resizeHandleContainer}>
                <ResizeHandle />
              </View>
            </>
          )}
        </Animated.View>
      </GestureDetector>
    );
  };

  // Render the arrangement screen
  const renderArrangementScreen = () => {
    const allSelectedItems = Object.values(selectedItems)
      .flat()
      .filter(item => item);

    return (
      <GestureHandlerRootView style={styles.container}>
        <ScrollView 
          style={styles.arrangementScrollView}
          contentContainerStyle={styles.arrangementContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.header}>Arrange Your Outfit</Text>
          
          {/* Outfit Name Input */}
          <View style={styles.nameInputContainer}>
            <Text style={styles.inputLabel}>Outfit Name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Enter outfit name"
              placeholderTextColor="#828282"
              value={outfitName}
              onChangeText={setOutfitName}
              maxLength={50}
            />
          </View>
          
          {/* Outfit Description Input */}
          <View style={styles.nameInputContainer}>
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.nameInput, styles.descriptionInput]}
              placeholder="Enter outfit description (optional)"
              placeholderTextColor="#828282"
              value={outfitDescription}
              onChangeText={setOutfitDescription}
              maxLength={200}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          
          {/* Selected items row */}
          <View style={styles.selectedItemsContainer}>
            <Text style={styles.sectionTitle}>Selected Items</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.selectedItemsScroll}
            >
              {allSelectedItems.map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>

          {/* Drop zone */}
          <View style={styles.dropZoneContainer}>
            <Text style={styles.sectionTitle}>Drag items here to arrange</Text>
            <View style={styles.dropZoneBorder}>
              <View 
                ref={dropZoneRef}
                style={styles.dropZoneCapture}
                collapsable={false}
              >
                {outfitLayout.length === 0 ? (
                  <Text style={styles.dropZoneText}>
                    Drag and drop items here to create your outfit
                  </Text>
                ) : (
                  <View style={styles.outfitCanvas}>
                    {outfitLayout.map((item) => (
                      <DroppedItem key={item.id} item={item} />
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom buttons */}
        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => setStep('selection')}
          >
            <Text style={styles.cancelButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button, 
              styles.saveButton,
              (!outfitName.trim() || isSaving) && styles.disabledButton
            ]}
            onPress={saveOutfit}
            disabled={!outfitName.trim() || isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save Outfit'}
            </Text>
          </TouchableOpacity>
        </View>
      </GestureHandlerRootView>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {step === 'selection' ? (
          <>
            <ScrollView style={styles.scrollView}>
              <Text style={styles.header}>Create New Outfit</Text>
              <Text style={styles.subtitle}>
                Select items to create your outfit
              </Text>
              
              {renderCategorySection('tops', itemsByCategory.tops)}
              {renderCategorySection('bottoms', itemsByCategory.bottoms)}
              {renderCategorySection('jackets', itemsByCategory.jackets)}
              {renderCategorySection('shoes', itemsByCategory.shoes)}
              {renderCategorySection('accessories', itemsByCategory.accessories)}
            </ScrollView>

            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => router.push('/wardrobe')}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.saveButton,
                  !hasMinimumSelection() && styles.disabledButton
                ]}
                onPress={() => setStep('arrangement')}
                disabled={!hasMinimumSelection()}
              >
                <Text style={styles.saveButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderArrangementScreen()
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#828282',
    marginBottom: 20,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 12,
  },
  itemsRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  itemCard: {
    width: 120,
    height: 150,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  selectedItemCard: {
    borderColor: '#4A6D51',
    borderWidth: 2,
  },
  itemImage: {
    width: 104,
    height: 104,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  bottomButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#CADBC1',
    borderWidth: 1,
    borderColor: '#4A6D51',
  },
  saveButton: {
    backgroundColor: '#4A6D51',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  draggableItem: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  draggableItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  droppedItem: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  droppedItemImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  resizeHandle: {
    backgroundColor: '#4A6D51',
    borderRadius: 12,
    padding: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  resizeHandleContainer: {
    position: 'absolute',
    bottom: -8,
    left: -8,
  },
  arrangementScrollView: {
    flex: 1,
  },
  arrangementContent: {
    padding: 20,
    paddingBottom: 20,
  },
  selectedItemsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 12,
  },
  selectedItemsScroll: {
    paddingVertical: 8,
  },
  dropZoneContainer: {
    marginBottom: 20,
  },
  dropZoneBorder: {
    width: DROP_ZONE_SIZE,
    height: DROP_ZONE_SIZE,
    borderWidth: 3,
    borderColor: '#4A6D51',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneCapture: {
    width: DROP_ZONE_SIZE - 6,
    height: DROP_ZONE_SIZE - 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropZoneText: {
    color: '#828282',
    textAlign: 'center',
    fontSize: 16,
  },
  outfitCanvas: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  nameInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 8,
  },
  nameInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  descriptionInput: {
    height: 80,
  },
}); 