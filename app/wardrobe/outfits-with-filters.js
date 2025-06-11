import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig'; 
import { generateWithLlama } from '../../services/ollamaService'; 
import { useWardrobe } from '../../context/wardrobeContext'; // Added this import

export default function OutfitsWithFiltersScreen() {
  const [wardrobeItems, setWardrobeItems] = useState({});
  const [selectedItems, setSelectedItems] = useState({
    tops: [],
    bottoms: [],
    jackets: [],
    shoes: [],
    accessories: [],
  });
  const [userProfile, setUserProfile] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    gender: false,
    bodyType: false,
    lifestyle: false,
  });
  const [generatedOutfit, setGeneratedOutfit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [savingOutfit, setSavingOutfit] = useState(false);
  const [outfitName, setOutfitName] = useState('');
  const [outfitDescription, setOutfitDescription] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  
  const router = useRouter();
  const { selectedItems: selectedItemsParam, filters } = useLocalSearchParams();
  const { addOutfit } = useWardrobe(); // Added this line

  // Parse selected items and filters from URL params
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

    if (filters) {
      try {
        const parsedFilters = JSON.parse(decodeURIComponent(filters));
        setSelectedFilters(parsedFilters);
        console.log('Parsed filters:', parsedFilters);
      } catch (error) {
        console.error('Error parsing filters:', error);
      }
    }
  }, [selectedItemsParam, filters]);

  // Fetch user data and wardrobe items
  useEffect(() => {
    fetchUserDataAndWardrobe();
  }, []);

  const fetchUserDataAndWardrobe = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Please log in to access your wardrobe');
        return;
      }

      // Fetch user profile data
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        setUserProfile(userData);
        console.log('Fetched user profile:', userData);
      } else {
        console.log('No user profile found');
      }

      // Fetch wardrobe items
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
      console.error('Error fetching data:', error);
      Alert.alert('Error', 'Failed to fetch your data');
    } finally {
      setFetchingData(false);
    }
  };

  const createFilteredOutfitPrompt = (selectedItems, userProfile, selectedFilters) => {
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

    
    let userContextParts = [];
    let hasValidPreferences = false;
    
    if (selectedFilters.gender && userProfile?.gender) {
      userContextParts.push(`Gender: ${userProfile.gender}`);
      hasValidPreferences = true;
    }
    
    if (selectedFilters.bodyType && userProfile?.bodyType) {
      userContextParts.push(`Body Type: ${userProfile.bodyType}`);
      hasValidPreferences = true;
    }
    
    if (selectedFilters.lifestyle && userProfile?.lifestyle) {
      userContextParts.push(`Lifestyle: ${userProfile.lifestyle}`);
      hasValidPreferences = true;
    }

    // Add additional user preferences if available
    if (userProfile?.age) {
      userContextParts.push(`Age Range: ${userProfile.age}`);
      hasValidPreferences = true;
    }
    
    if (userProfile?.style) {
      userContextParts.push(`Preferred Style: ${userProfile.style}`);
      hasValidPreferences = true;
    }

    if (userProfile?.occasions && userProfile.occasions.length > 0) {
      userContextParts.push(`Preferred Occasions: ${userProfile.occasions.join(', ')}`);
      hasValidPreferences = true;
    }

    if (userProfile?.colors && userProfile.colors.length > 0) {
      userContextParts.push(`Favorite Colors: ${userProfile.colors.join(', ')}`);
      hasValidPreferences = true;
    }

    const userContext = userContextParts.join('\n');

    // Debug logging
    console.log('🔍 Debug - Selected Filters:', selectedFilters);
    console.log('🔍 Debug - User Profile:', userProfile);
    console.log('🔍 Debug - User Context Parts:', userContextParts);
    console.log('🔍 Debug - Has Valid Preferences:', hasValidPreferences);

    // Create enhanced prompt with user context - IMPROVED PROMPT
    const prompt = `You are a personal stylist creating a custom outfit recommendation.

USER PROFILE INFORMATION:
${hasValidPreferences ? userContext : "General styling preferences will be applied"}

AVAILABLE WARDROBE ITEMS TO CHOOSE FROM:
${availableItems.join('\n')}

STRICT REQUIREMENTS:
1. You MUST use ONLY items from the wardrobe list above
2. You MUST create exactly ONE complete outfit
3. You MUST follow this exact format: OutfitName | Top | Bottom | Shoes | Accessory | StyleTip
4. If no item exists for a category, write "None"
5. Never invent items not in the wardrobe list

AVAILABLE ITEMS BY CATEGORY:
- Tops: ${itemsByCategory.tops.length > 0 ? itemsByCategory.tops.join(', ') : 'None available'}
- Bottoms: ${itemsByCategory.bottoms.length > 0 ? itemsByCategory.bottoms.join(', ') : 'None available'}
- Shoes: ${itemsByCategory.shoes.length > 0 ? itemsByCategory.shoes.join(', ') : 'None available'}
- Accessories: ${itemsByCategory.accessories.length > 0 ? itemsByCategory.accessories.join(', ') : 'None available'}
- Jackets: ${itemsByCategory.jackets.length > 0 ? itemsByCategory.jackets.join(', ') : 'None available'}

PERSONALIZATION INSTRUCTIONS:
${selectedFilters.gender && userProfile?.gender ? `- Style appropriately for ${userProfile.gender}` : ''}
${selectedFilters.bodyType && userProfile?.bodyType ? `- Choose flattering combinations for ${userProfile.bodyType} body type` : ''}
${selectedFilters.lifestyle && userProfile?.lifestyle ? `- Select outfit suitable for ${userProfile.lifestyle} activities` : ''}
${userProfile?.style ? `- Align with ${userProfile.style} aesthetic` : ''}
${userProfile?.occasions?.length > 0 ? `- Consider these occasions: ${userProfile.occasions.join(', ')}` : ''}

EXAMPLE OUTPUT FORMAT:
Casual Chic | White T-Shirt | Blue Jeans | White Sneakers | None | Perfect everyday look for your active lifestyle

YOUR RESPONSE: Create ONE outfit using the exact format above, considering the user's profile.`;

    console.log('📝 Generated prompt:', prompt);
    return prompt;
  };

  // Generate outfit with filters
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
      const prompt = createFilteredOutfitPrompt(selectedItems, userProfile, selectedFilters);
      
      if (prompt.includes("No items selected")) {
        Alert.alert('Error', 'Please select at least one top and one bottom item');
        return;
      }
      
      console.log('📝 Sending filtered prompt to Ollama:', prompt);
      
      const response = await generateWithLlama(prompt, 45000);
      console.log('🤖 Ollama raw response:', response);
      
      if (!response || response.length < 10) {
        console.log('⚠️ Response too short, creating manual outfit...');
        const manualOutfit = createManualOutfit();
        setGeneratedOutfit(manualOutfit);
        Alert.alert('Info', 'Generated personalized outfit using your selected items and preferences.');
        return;
      }
      
      const outfit = parseOutfitResponse(response);
      console.log('✅ Parsed outfit:', outfit);
      
      if (!outfit) {
        console.log('❌ No outfit parsed successfully - creating manual outfit');
        const manualOutfit = createManualOutfit();
        setGeneratedOutfit(manualOutfit);
        Alert.alert('Info', 'Generated personalized outfit from your selected items.');
      } else {
        setGeneratedOutfit(outfit);
      }
      
    } catch (error) {
      console.error('❌ Error generating outfit:', error);
      
      const manualOutfit = createManualOutfit();
      setGeneratedOutfit(manualOutfit);
      
      if (error.message.includes('timeout') || error.message.includes('AbortError')) {
        Alert.alert('Timeout Error', 'Request timed out. Using your selected items to create a personalized outfit.');
      } else if (error.message.includes('Cannot connect')) {
        Alert.alert('Connection Error', 'Could not connect to AI service. Using your profile and selected items instead.');
      } else {
        Alert.alert('Generation Error', 'Using your profile and selected items to create a personalized outfit.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create a manual outfit with personalization
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

    // Create personalized styling tip based on user profile
    let stylingTip = 'A stylish combination from your selected items';
    
    if (userProfile) {
      if (selectedFilters.lifestyle && userProfile.lifestyle) {
        stylingTip = `Perfect for your ${userProfile.lifestyle} lifestyle`;
      } else if (selectedFilters.bodyType && userProfile.bodyType) {
        stylingTip = `Tailored to complement your ${userProfile.bodyType} body type`;
      } else if (selectedFilters.gender && userProfile.gender) {
        stylingTip = `Styled with your preferences in mind`;
      } else if (userProfile.style) {
        stylingTip = `Matches your ${userProfile.style} style preference`;
      }
    }
    
    return {
      id: Date.now(),
      name: 'Personalized AI Outfit',
      items: {
        top: tops.length > 0 ? tops[0].name : 'No top selected',
        bottom: bottoms.length > 0 ? bottoms[0].name : 'No bottom selected',
        shoes: shoes.length > 0 ? shoes[0].name : 'Any shoes',
        accessory: accessories.length > 0 ? accessories[0].name : 
                  jackets.length > 0 ? jackets[0].name : '',
        styling: stylingTip
      }
    };
  };

  // Parse the outfit response - IMPROVED PARSING
  const parseOutfitResponse = (response) => {
    console.log('🔍 Raw Ollama response:', response);
    
    // Clean up the response - remove common AI prefixes
    let cleanResponse = response
      .replace(/^.*?Here are.*?outfits?:?\s*/i, '')
      .replace(/^.*?I'd be happy.*?outfits?:?\s*/i, '')
      .replace(/^.*?outfit combinations.*?:\s*/i, '')
      .replace(/^.*?YOUR RESPONSE:\s*/i, '')
      .trim();
    
    console.log('🔍 Cleaned response:', cleanResponse);
    
    // Split into lines and look for the outfit format
    const lines = cleanResponse.split('\n').filter(line => line.trim().length > 0);
    
    // Look for the first valid outfit with pipe separators
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      console.log(`🔍 Processing line ${i}:`, line);
      
      if (line.includes('|')) {
        const parts = line.split('|').map(part => part.trim());
        console.log('🔍 Parsed parts:', parts);
        
        if (parts.length >= 4) {
          const outfit = {
            id: Date.now(),
            name: parts[0] || 'Personalized AI Outfit',
            items: {
              top: parts[1] && parts[1].toLowerCase() !== 'none' ? parts[1] : '',
              bottom: parts[2] && parts[2].toLowerCase() !== 'none' ? parts[2] : '',
              shoes: parts[3] && parts[3].toLowerCase() !== 'none' ? parts[3] : '',
              accessory: parts[4] && parts[4].toLowerCase() !== 'none' ? parts[4] : '',
              styling: parts[5] || 'A personalized combination based on your preferences'
            }
          };
          
          // Validate that we have at least a top and bottom
          if (outfit.items.top && outfit.items.bottom) {
            console.log('✅ Found valid outfit:', outfit);
            return outfit;
          } else {
            console.log('❌ Invalid outfit - missing top or bottom:', outfit);
          }
        }
      }
    }
    
    console.log('❌ No valid outfit format found in response');
    return null;
  };


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
    // Convert the generated outfit to the format expected by the wardrobe context
    const outfitItems = [];
    
    Object.entries(generatedOutfit.items).forEach(([type, itemName]) => {
      if (itemName && itemName !== 'Any shoes' && type !== 'styling') {
        const selectedItem = findSelectedItemByName(itemName);
        if (selectedItem) {
          
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

    const outfitData = {
      id: `outfit-${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      name: outfitName.trim(),
      description: outfitDescription.trim() || generatedOutfit.items.styling || 'Personalized AI Generated Outfit',
      items: outfitItems,
      selectedItems: selectedItems, 
      imageUri: null,
      isPersonalized: true,
      usedFilters: selectedFilters,
      userProfile: userProfile 
    };

    await addOutfit(outfitData); 
    
    // Hide the save form immediately after successful save
    setShowSaveForm(false);
    setOutfitName('');
    setOutfitDescription('');
    
    // Show simple success popup
    Alert.alert('Outfit Saved', 'Your personalized outfit has been saved successfully!');
    
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

  // Function to render active filters
  const renderActiveFilters = () => {
    const activeFilters = Object.entries(selectedFilters)
      .filter(([key, value]) => value)
      .map(([key, value]) => key);

    if (activeFilters.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <Text style={styles.activeFiltersTitle}>Active Personalization Filters</Text>
        <View style={styles.filtersRow}>
          {activeFilters.map((filter) => (
            <View key={filter} style={styles.activeFilterTag}>
              <MaterialIcons name="check-circle" size={16} color="#4A6D51" />
              <Text style={styles.activeFilterText}>
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </View>
          ))}
        </View>
        {userProfile && (
          <View style={styles.profileSummary}>
            <Text style={styles.profileSummaryTitle}>Your Profile Info</Text>
            {selectedFilters.gender && userProfile.gender && (
              <Text style={styles.profileItem}>• Gender: {userProfile.gender}</Text>
            )}
            {selectedFilters.bodyType && userProfile.bodyType && (
              <Text style={styles.profileItem}>• Body Type: {userProfile.bodyType}</Text>
            )}
            {selectedFilters.lifestyle && userProfile.lifestyle && (
              <Text style={styles.profileItem}>• Lifestyle: {userProfile.lifestyle}</Text>
            )}
            {userProfile.style && (
              <Text style={styles.profileItem}>• Style: {userProfile.style}</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  // Function to render selected items by category (same as before)
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
        <Text style={styles.selectedItemsTitle}>Selected Items for Personalized Generation</Text>
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

  // Render the generated outfit (same as before but with personalized label)
  const renderOutfit = () => {
    if (!generatedOutfit) return null;

    return (
      <View style={styles.outfitCard}>
        <View style={styles.outfitHeader}>
          <Text style={styles.outfitName}>{generatedOutfit.name}</Text>
          <View style={styles.personalizedBadge}>
            <MaterialIcons name="person" size={14} color="#4A6D51" />
            <Text style={styles.personalizedText}>Personalized</Text>
          </View>
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
          <Text style={styles.saveOutfitButtonText}>Save Personalized Outfit</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render save form (same as before)
  const renderSaveForm = () => {
    if (!showSaveForm) return null;

    return (
      <View style={styles.saveFormContainer}>
        <Text style={styles.saveFormTitle}>Save Your Personalized Outfit</Text>
        
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

  if (fetchingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A6D51" />
        <Text style={styles.loadingText}>Loading your profile and wardrobe...</Text>
      </View>
    );
  }

  const hasSelectedItems = Object.values(selectedItems).some(category => category.length > 0);

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
      <View style={styles.iconWrapper}>
        <MaterialIcons name="psychology" size={80} color="#7D7D7D" />
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Personalized AI Outfit Generator</Text>
        
        {/* Active Filters Display */}
        {renderActiveFilters()}

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
              <Text style={styles.generateButtonText}>Generate Personalized Outfit</Text>
            )}
          </TouchableOpacity>
        )}

        {/* Generated Outfit */}
        {generatedOutfit && (
          <View style={styles.outfitContainer}>
            <Text style={styles.outfitTitle}>Your Personalized Outfit</Text>
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
  activeFiltersContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#B8E6B8',
  },
  activeFiltersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 10,
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F0E2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilterText: {
    fontSize: 12,
    color: '#4A6D51',
    fontWeight: '500',
  },
  removeFilterButton: {
    marginLeft: 6,
    padding: 2,
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