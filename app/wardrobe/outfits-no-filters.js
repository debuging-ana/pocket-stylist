import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; 
import { generateWithLlama } from '../../services/ollamaService'; 

export default function OutfitsNoFiltersScreen() {
  const [wardrobeItems, setWardrobeItems] = useState({});
  const [selectedItems, setSelectedItems] = useState({
    tops: [],
    bottoms: [],
    jackets: [],
    shoes: [],
    accessories: [],
  });
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingWardrobe, setFetchingWardrobe] = useState(true);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  const router = useRouter();
  const { selectedItems: selectedItemsParam } = useLocalSearchParams();

  // Parse selected items from URL params
  useEffect(() => {
    if (selectedItemsParam) {
      try {
        const parsedItems = JSON.parse(decodeURIComponent(selectedItemsParam));
        setSelectedItems(parsedItems);
        console.log('Parsed selected items:', parsedItems);
      } catch (error) {
        console.error('Error parsing selected items:', error);
      }
    }
  }, [selectedItemsParam]);

  // Fetch wardrobe items from Firebase
  useEffect(() => {
    fetchWardrobeItems();
  }, []);

  const fetchWardrobeItems = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to access your wardrobe');
        return;
      }

      const wardrobeRef = collection(db, 'users', user.uid, 'wardrobe');
      const querySnapshot = await getDocs(wardrobeRef);
      
      const items = {
        tops: [],
        bottoms: [],
        jackets: [],
        accessories: [],
        shoes: []
      };

      querySnapshot.forEach((doc) => {
        const item = { id: doc.id, ...doc.data() };
        const category = item.category.toLowerCase();
        if (items[category]) {
          items[category].push(item);
        }
      });

      setWardrobeItems(items);
      console.log('Fetched wardrobe items:', items);
    } catch (error) {
      console.error('Error fetching wardrobe:', error);
      Alert.alert('Error', 'Failed to fetch wardrobe items');
    } finally {
      setFetchingWardrobe(false);
    }
  };

  const createOutfitPrompt = (selectedItems) => {
  const availableItems = [];
  const itemsByCategory = {
    tops: [],
    bottoms: [],
    shoes: [],
    accessories: [],
    jackets: []
  };
  
  // Organize items by category and create the available items list
  Object.entries(selectedItems).forEach(([category, categoryItems]) => {
    categoryItems.forEach(item => {
      availableItems.push(`${item.name} (${category})`);
      itemsByCategory[category].push(item.name);
    });
  });

  if (availableItems.length === 0) {
    return "No items selected";
  }

  // Create a more structured and restrictive prompt
  const prompt = `STRICT RULES: You must ONLY use items from this exact list. DO NOT add any items not listed below.

AVAILABLE ITEMS:
${availableItems.join('\n')}

MANDATORY REQUIREMENTS:
1. Use ONLY items from the list above
2. Never invent or add items not provided
3. If a category has no items, leave it empty or write "None"
4. Format must be: Outfit Name | Top | Bottom | Shoes | Accessory | Style Tip

CATEGORY RESTRICTIONS:
- Tops available: ${itemsByCategory.tops.length > 0 ? itemsByCategory.tops.join(', ') : 'NONE - leave empty'}
- Bottoms available: ${itemsByCategory.bottoms.length > 0 ? itemsByCategory.bottoms.join(', ') : 'NONE - leave empty'}
- Shoes available: ${itemsByCategory.shoes.length > 0 ? itemsByCategory.shoes.join(', ') : 'NONE - write "None"'}
- Accessories available: ${itemsByCategory.accessories.length > 0 ? itemsByCategory.accessories.join(', ') : 'NONE - write "None"'}
- Jackets available: ${itemsByCategory.jackets.length > 0 ? itemsByCategory.jackets.join(', ') : 'NONE - write "None"'}

EXAMPLE FORMAT:
Smart Casual | White Button Shirt | Black Trousers | None | None | Perfect for office

YOUR TASK: Create an outfit using ONLY the items listed above. If shoes or accessories are not available, write "None" for those fields.`;

  return prompt;
};

  // Generate a single outfit using Ollama with selected items only
// Replace the generateOutfit function with this improved version
const generateOutfit = async () => {
  // Enhanced validation - check for required items
  const tops = selectedItems.tops || [];
  const bottoms = selectedItems.bottoms || [];
  
  if (tops.length === 0 || bottoms.length === 0) {
    Alert.alert(
      'Incomplete Selection', 
      'Please select at least one top and one bottom to generate an outfit.',
      [{ text: 'OK' }]
    );
    return;
  }

  setLoading(true);
  setGeneratedOutfit(null);
  setShowSaveForm(false);
  
  try {
    const prompt = createOutfitPrompt(selectedItems);
    
    if (prompt.includes("Insufficient items")) {
      Alert.alert('Error', 'Please select at least one top and one bottom item');
      return;
    }
    
    console.log('📝 Sending prompt to Ollama:', prompt);
    
    const response = await generateWithLlama(prompt, 45000); // Reduced timeout
    console.log('🤖 Ollama raw response:', response);
    
    if (!response || response.length < 10) {
      console.log('⚠️ Response too short, creating manual outfit...');
      const manualOutfit = createManualOutfit();
      setGeneratedOutfit(manualOutfit);
      Alert.alert('Info', 'Generated outfit using your selected items. For better AI suggestions, check your Ollama connection.');
      return;
    }
    
    const outfit = parseOutfitResponse(response);
    console.log('✅ Parsed outfit:', outfit);
    
    if (!outfit) {
      console.log('❌ No outfit parsed successfully - creating manual outfit');
      const manualOutfit = createManualOutfit();
      setGeneratedOutfit(manualOutfit);
      Alert.alert('Info', 'Generated outfit from your selected items. AI parsing may need improvement.');
    } else {
      setGeneratedOutfit(outfit);
    }
    
  } catch (error) {
    console.error('❌ Error generating outfit:', error);
    
    const manualOutfit = createManualOutfit();
    setGeneratedOutfit(manualOutfit);
    
    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      Alert.alert('Timeout Error', 'Ollama request timed out. Using your selected items to create an outfit.');
    } else if (error.message.includes('Cannot connect')) {
      Alert.alert('Connection Error', 'Could not connect to Ollama. Using your selected items instead.');
    } else {
      Alert.alert('Generation Error', 'Using your selected items to create an outfit combination.');
    }
  } finally {
    setLoading(false);
  }
};

  // Create a manual outfit when AI fails - using only selected items
  const createManualOutfit = () => {
    const tops = selectedItems.tops || [];
    const bottoms = selectedItems.bottoms || [];
    const shoes = selectedItems.shoes || [];
    const accessories = selectedItems.accessories || [];
    const jackets = selectedItems.jackets || [];
    
    if (tops.length === 0 && bottoms.length === 0) {
      return {
        id: Date.now(),
        name: 'Select More Items',
        items: {
          top: 'Please select tops',
          bottom: 'Please select bottoms',
          shoes: 'Please select shoes',
          accessory: '',
          styling: 'Go back and select items from your wardrobe to create complete outfits'
        }
      };
    }
    
    return {
      id: Date.now(),
      name: 'AI Generated Outfit',
      items: {
        top: tops.length > 0 ? tops[0].name : 'No top selected',
        bottom: bottoms.length > 0 ? bottoms[0].name : 'No bottom selected',
        shoes: shoes.length > 0 ? shoes[0].name : 'Any shoes',
        accessory: accessories.length > 0 ? accessories[0].name : 
                  jackets.length > 0 ? jackets[0].name : '',
        styling: 'A stylish combination from your selected items'
      }
    };
  };

  // Parse the outfit response (modified to return single outfit)
  const parseOutfitResponse = (response) => {
    console.log('Raw Ollama response:', response);
    
    let cleanResponse = response
      .replace(/^.*?Here are.*?outfits?:?\s*/i, '')
      .replace(/^.*?I'd be happy.*?outfits?:?\s*/i, '')
      .replace(/^.*?outfit combinations.*?:\s*/i, '');
    
    const lines = cleanResponse.split('\n').filter(line => line.trim().length > 0);
    
    // Look for the first valid outfit
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      console.log(`Processing line ${i}:`, line);
      
      if (line.includes('|')) {
        const parts = line.split('|').map(part => part.trim());
        console.log('Parsed parts:', parts);
        
        if (parts.length >= 4) {
          const outfit = {
            id: Date.now(),
            name: parts[0] || 'AI Generated Outfit',
            items: {
              top: parts[1] || '',
              bottom: parts[2] || '',
              shoes: parts[3] || '',
              accessory: parts[4] || '',
              styling: parts[5] || 'A stylish combination'
            }
          };
          
          if (outfit.items.top && outfit.items.bottom) {
            console.log('Found valid outfit:', outfit);
            return outfit;
          }
        }
      }
    }
    
    return null;
  };

  // Find selected item by name
  // Improved item finding function
const findSelectedItemByName = (itemName) => {
  if (!itemName || itemName.trim() === '') return null;
  
  const searchName = itemName.toLowerCase().trim();
  
  for (const [category, items] of Object.entries(selectedItems)) {
    if (!items || !Array.isArray(items)) continue;
    
    // First try exact match
    let found = items.find(item => 
      item.name.toLowerCase().trim() === searchName
    );
    
    if (found) return found;
    
    // Then try partial match
    found = items.find(item => 
      item.name.toLowerCase().includes(searchName) ||
      searchName.includes(item.name.toLowerCase())
    );
    
    if (found) return found;
  }
  
  return null;
};

  // Save outfit to Firebase
  const saveOutfitToFirebase = async () => {
    if (!outfitName.trim()) {
      Alert.alert('Error', 'Please enter an outfit name');
      return;
    }

    if (!generatedOutfit) {
      Alert.alert('Error', 'No outfit to save');
      return;
    }

    setSavingOutfit(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to save outfits');
        return;
      }

      // Convert the generated outfit to the format expected by Firebase
      const outfitItems = [];
      
      // Add each item from the generated outfit to the items array
      Object.entries(generatedOutfit.items).forEach(([type, itemName]) => {
        if (itemName && itemName !== 'Any shoes' && type !== 'styling') {
          const selectedItem = findSelectedItemByName(itemName);
          if (selectedItem) {
            // Create a positioned item similar to the AddOutfitScreen format
            const positionedItem = {
              ...selectedItem,
              id: `${selectedItem.id}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              x: Math.random() * 200, // Random positioning
              y: Math.random() * 200,
              scale: 1.0
            };
            outfitItems.push(positionedItem);
          }
        }
      });

      // Create the outfit document
      const outfitData = {
        id: `outfit-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
        name: outfitName.trim(),
        description: outfitDescription.trim() || generatedOutfit.items.styling || 'AI Generated Outfit',
        items: outfitItems,
        createdAt: serverTimestamp(),
        // Note: imageUri would be null since we're not capturing a visual arrangement
        imageUri: null
      };

      // Save to Firebase
      const outfitsRef = collection(db, 'users', user.uid, 'outfits');
      await addDoc(outfitsRef, outfitData);
      
      Alert.alert(
        'Success', 
        'Outfit saved successfully!',
        [
          {
            text: 'View Saved Outfits',
            onPress: () => router.push('/savedOutfits')
          },
          {
            text: 'Generate Another',
            onPress: () => {
              setShowSaveForm(false);
              setOutfitName('');
              setOutfitDescription('');
              setGeneratedOutfit(null);
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Error saving outfit:', error);
      Alert.alert('Error', 'Failed to save outfit. Please try again.');
    } finally {
      setSavingOutfit(false);
    }
  };

  // Show save form
  const handleSaveOutfit = () => {
    setOutfitName(generatedOutfit?.name || '');
    setOutfitDescription(generatedOutfit?.items?.styling || '');
    setShowSaveForm(true);
  };

  // Function to render selected items by category
  const renderSelectedItems = () => {
    const allSelectedItems = Object.entries(selectedItems)
      .filter(([category, items]) => items.length > 0)
      .map(([category, items]) => ({ category, items }));

    if (allSelectedItems.length === 0) {
      return (
        <View style={styles.noItemsContainer}>
          <MaterialIcons name="info-outline" size={24} color="#7D7D7D" />
          <Text style={styles.noItemsText}>No items selected. Go back to select items from your wardrobe.</Text>
        </View>
      );
    }

    return (
      <View style={styles.selectedItemsContainer}>
        <Text style={styles.selectedItemsTitle}>Selected Items for Outfit Generation</Text>
        {allSelectedItems.map(({ category, items }) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.itemsRow}>
                {items.map((item) => (
                  <View key={item.id} style={styles.selectedItemCard}>
                    <Image
                      source={{ uri: item.imageUri }}
                      style={styles.selectedItemImage}
                    />
                    <Text style={styles.selectedItemName} numberOfLines={2}>
                      {item.name}
                    </Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        ))}
      </View>
    );
  };

  // Render the generated outfit
  const renderOutfit = () => {
    if (!generatedOutfit) return null;

    return (
      <View style={styles.outfitCard}>
        <View style={styles.outfitHeader}>
          <Text style={styles.outfitName}>{generatedOutfit.name}</Text>
        </View>
        
        <View style={styles.outfitItems}>
          {Object.entries(generatedOutfit.items).map(([type, itemName]) => {
            if (!itemName || itemName === 'Any shoes' || type === 'styling') return null;
            
            const selectedItem = findSelectedItemByName(itemName);
            
            return (
              <View key={type} style={styles.outfitItem}>
                <Text style={styles.itemType}>{type.toUpperCase()}</Text>
                <Text style={styles.itemName}>{itemName}</Text>
                {selectedItem && selectedItem.imageUri && (
                  <Image 
                    source={{ uri: selectedItem.imageUri }} 
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                )}
              </View>
            );
          })}
        </View>
        
        {generatedOutfit.items.styling && (
          <View style={styles.stylingTip}>
            <MaterialIcons name="lightbulb-outline" size={16} color="#4A6D51" />
            <Text style={styles.stylingText}>{generatedOutfit.items.styling}</Text>
          </View>
        )}

        {/* Save Outfit Button */}
        <TouchableOpacity 
          style={styles.saveOutfitButton}
          onPress={handleSaveOutfit}
        >
          <MaterialIcons name="favorite-border" size={20} color="white" />
          <Text style={styles.saveOutfitButtonText}>Save Outfit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render save form
  const renderSaveForm = () => {
    if (!showSaveForm) return null;

    return (
      <View style={styles.saveFormContainer}>
        <Text style={styles.saveFormTitle}>Save Your Outfit</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Outfit Name</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter outfit name"
            placeholderTextColor="#999"
            value={outfitName}
            onChangeText={setOutfitName}
            maxLength={50}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Enter outfit description"
            placeholderTextColor="#999"
            value={outfitDescription}
            onChangeText={setOutfitDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.saveFormButtons}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowSaveForm(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.confirmSaveButton, savingOutfit && styles.disabledButton]}
            onPress={saveOutfitToFirebase}
            disabled={savingOutfit}
          >
            {savingOutfit ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.confirmSaveButtonText}>Save</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (fetchingWardrobe) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6D51" />
        <Text style={styles.loadingText}>Loading your wardrobe...</Text>
      </View>
    );
  }

  const hasSelectedItems = Object.values(selectedItems).some(category => category.length > 0);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="auto-awesome" size={80} color="#7D7D7D" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>AI Outfit Generator</Text>
        
        {/* Selected Items Display */}
        {renderSelectedItems()}

        {/* Generate Button - only show if items are selected */}
        {hasSelectedItems && (
          <TouchableOpacity 
            style={[styles.generateButton, loading && styles.disabledButton]} 
            onPress={generateOutfit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Outfit from Selected Items</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Generated Outfit */}
        {generatedOutfit && (
          <View style={styles.outfitContainer}>
            <Text style={styles.outfitTitle}>Your Generated Outfit</Text>
            {renderOutfit()}
          </View>
        )}

        {/* Save Form */}
        {renderSaveForm()}

        {/* Back to Selection Button */}
        {!hasSelectedItems && (
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={20} color="white" />
            <Text style={styles.backButtonText}>Go Back to Select Items</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F0E2',
  },
  scrollContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E8F0E2',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7D7D7D',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    paddingTop: 20,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7D7D7D',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedItemsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 15,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  itemsRow: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  selectedItemCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 8,
    marginRight: 10,
    width: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  selectedItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginBottom: 5,
  },
  selectedItemName: {
    fontSize: 10,
    color: '#333',
    textAlign: 'center',
    lineHeight: 12,
  },
  noItemsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  noItemsText: {
    fontSize: 14,
    color: '#7D7D7D',
    textAlign: 'center',
    marginTop: 10,
  },
  generateButton: {
    backgroundColor: '#4A6D51',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#A0A0A0',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#4A6D51',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 30,
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  outfitContainer: {
    marginTop: 20,
  },
  outfitTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  outfitCard: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  outfitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    flex: 1,
  },
  outfitItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  outfitItem: {
    width: '48%',
    marginBottom: 10,
  },
  itemType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7D7D7D',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  itemImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
  },
  stylingTip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E8F0E2',
    borderRadius: 8,
  },
  stylingText: {
    fontSize: 12,
    color: '#4A6D51',
    marginLeft: 5,
    flex: 1,
  },
  saveOutfitButton: {
    backgroundColor: '#4A6D51',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginTop: 15,
  },
  saveOutfitButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  saveFormContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  saveFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  saveFormButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E0E0',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  confirmSaveButton: {
    flex: 1,
    backgroundColor: '#4A6D51',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
    alignItems: 'center',
  },
  confirmSaveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});