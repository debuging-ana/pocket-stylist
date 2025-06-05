import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
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

const WINDOW_WIDTH = Dimensions.get('window').width;
const GRID_SIZE = (WINDOW_WIDTH - 40) / 2; // 2 columns with 20px padding on each side

export default function AddOutfitScreen() {
  const router = useRouter();
  const { wardrobeItems } = useWardrobe();
  const [selectedItems, setSelectedItems] = useState({
    tops: [],
    bottoms: [],
    jackets: [],
    shoes: [],
    accessories: [],
  });
  const [step, setStep] = useState('selection'); // 'selection' or 'preview'
  const [outfitLayout, setOutfitLayout] = useState([]);

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

  // Function to handle dropping an item into the outfit layout
  const addToOutfitLayout = useCallback((item) => {
    setOutfitLayout(current => [...current, { ...item, position: current.length }]);
  }, []);

  // Render draggable item component
  const DraggableItem = ({ item }) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);
    const isDropZone = useSharedValue(false);

    const panGesture = Gesture.Pan()
      .onBegin(() => {
        scale.value = withSpring(1.1);
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
        
        // Check if over drop zone
        const isOverDropZone = event.absoluteY > 300 && event.absoluteY < 600;
        if (isOverDropZone !== isDropZone.value) {
          isDropZone.value = isOverDropZone;
          scale.value = withSpring(isOverDropZone ? 1.2 : 1.1);
        }
      })
      .onEnd(() => {
        if (isDropZone.value) {
          runOnJS(addToOutfitLayout)(item);
        }
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        isDropZone.value = false;
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
        <Animated.View style={[styles.previewItemCard, animatedStyle]}>
          <Image
            source={{ uri: item.imageUri }}
            style={styles.previewItemImage}
          />
          <Text style={styles.previewItemName} numberOfLines={1}>
            {item.name}
          </Text>
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

  const renderPreviewScreen = () => {
    // Flatten all selected items into a single array
    const allSelectedItems = Object.values(selectedItems)
      .flat()
      .filter(item => item);

    return (
      <GestureHandlerRootView style={styles.previewContainer}>
        <View style={styles.previewContent}>
          <Text style={styles.previewTitle}>Selected Items</Text>
          
          <View style={styles.selectedItemsContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.selectedItemsScroll}
            >
              {allSelectedItems.map(item => (
                <DraggableItem key={item.id} item={item} />
              ))}
            </ScrollView>
          </View>

          <View style={styles.outfitLayoutContainer}>
            <Text style={styles.layoutTitle}>Arrange Your Outfit</Text>
            <View style={styles.dropZone}>
              {outfitLayout.length === 0 ? (
                <Text style={styles.dropZoneText}>
                  Drag and drop items here to arrange your outfit
                </Text>
              ) : (
                <View style={styles.outfitGrid}>
                  {outfitLayout.map((item, index) => (
                    <View key={`${item.id}-${index}`} style={styles.gridItem}>
                      <Image
                        source={{ uri: item.imageUri }}
                        style={styles.gridItemImage}
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.previewButtonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => setStep('selection')}
          >
            <Text style={styles.editButtonText}>Edit Selection</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={() => {
              // TODO: Save the outfit with the layout
              router.push('/wardrobe');
            }}
          >
            <Text style={styles.saveButtonText}>Save Outfit</Text>
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
                Select at least one item to create your outfit
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
                  styles.nextButton,
                  !hasMinimumSelection() && styles.disabledButton
                ]}
                onPress={() => setStep('preview')}
                disabled={!hasMinimumSelection()}
              >
                <Text style={styles.nextButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          renderPreviewScreen()
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
  nextButton: {
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  // Updated preview screen styles
  previewContainer: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  previewContent: {
    flex: 1,
    padding: 20,
  },
  previewTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 20,
  },
  selectedItemsContainer: {
    marginBottom: 20,
  },
  selectedItemsScroll: {
    paddingRight: 20, // Add extra padding at the end for better scrolling
  },
  previewItemCard: {
    width: 150,
    height: 180,
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  previewItemImage: {
    width: 134,
    height: 134,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  previewItemName: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  previewButtonsContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  editButton: {
    backgroundColor: '#CADBC1',
    borderWidth: 1,
    borderColor: '#4A6D51',
  },
  saveButton: {
    backgroundColor: '#4A6D51',
  },
  editButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outfitLayoutContainer: {
    marginTop: 20,
  },
  layoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 12,
  },
  dropZone: {
    height: 300,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4A6D51',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  dropZoneText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 16,
  },
  outfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    width: '100%',
  },
  gridItem: {
    width: GRID_SIZE - 16,
    height: GRID_SIZE - 16,
    margin: 8,
    borderRadius: 8,
    overflow: 'hidden',
  }, 
  gridItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
}); 