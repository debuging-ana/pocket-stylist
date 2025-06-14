/*
this is the edit screen - (similar to add-item) allows users to modify existing wardrobe items
pre-fills with existing data & updates via firebase
*/
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import WardrobeBackButton from './components/WardrobeBackButton'; 
import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator // for loading indicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// utility function to render category icons based on item category (matches wardrobe.js)
const getCategoryIcon = (category, size = 22) => {
  const normalized = category.toLowerCase();

  // return appropriate icon/component based on category
  if (normalized.includes('top')) {
    return <MaterialCommunityIcons name="tshirt-crew" size={size} color="#4A6D51" />;
  }
  if (normalized.includes('bottom')) {
    return (
      <Image 
        source={require('../../assets/images/pants.png')}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );
  }
  if (normalized.includes('jacket')) {
    return (
      <Image 
        source={require('../../assets/images/jacket.png')}
        style={{ width: size, height: size, resizeMode: 'contain' }}
      />
    );
  }
  if (normalized.includes('accessories')) {
    return <MaterialCommunityIcons name="necklace" size={size} color="#4A6D51" />;
  }
  if (normalized.includes('shoe')) {
    return <MaterialCommunityIcons name="shoe-formal" size={size} color="#4A6D51" />;
  }

  // default icon
  return <MaterialCommunityIcons name="folder" size={size} color="#4A6D51" />;
};

export default function EditItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateItem, wardrobeItems } = useWardrobe();
  const navigation = useNavigation();
  // initialize state with the item's current values
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(params.category || 'tops');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null); // added for error handling
  const [itemData, setItemData] = useState(null);
  const [description, setDescription] = useState('');

  // initialize with full item data
  useEffect(() => {
    if (params.id) {
      const item = wardrobeItems.find((i) => i.id === params.id);
      if (item) {
        setItemData(item);
        setName(item.name || '');
        setCategory(item.category || 'tops');
        setImageUri(item.imageUri || null);
        setDescription(item.description || '');
      }
    }
  }, [params, wardrobeItems]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <WardrobeBackButton />,
    });
  }, [navigation]);

  // category options now using the centralized icon function
  const categories = [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'jackets', name: 'Jackets' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'shoes', name: 'Shoes' },
  ];

  // updated image picker function with new Media Type format & better error handling
  const pickImage = async () => {
    try {
      // check camera roll permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo access to select images');
        return;
      }

      // launch image picker 
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images', // updated from deprecated format (warnings)
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.[0]?.uri) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  // handle saving the updated item to firebase through wardrobe context
  const saveChanges = async () => {
    if (!imageUri) {
      Alert.alert('Image required', 'Please upload an image to proceed');
      return;
    }
    if (!name.trim()) {
      Alert.alert('New Name required', 'Please enter a new name for your item');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedItem = {
        ...itemData,
        name,
        category,
        imageUri,
        description: description.trim(),
      };
      
      await updateItem(updatedItem);
      Alert.alert('Success!', 'Your changes have been saved');
      router.push('/wardrobe');
    } catch (error) {
      setError('Failed to save changes');
      console.error('Update error:', error);
      Alert.alert('Error', 'Could not save your changes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!itemData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found.</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* error message display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Item Photo</Text>
            {/* image preview section */}
            <View style={styles.imageContainer}>
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.image}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="image" size={50} color="#AFC6A3" />
                  <Text style={styles.placeholderText}>No image selected</Text>
                </View>
              )}
            </View>

            {/* image selection button with loading state */}
            <TouchableOpacity 
              style={styles.imageButton} 
              onPress={pickImage}
            >
              <Feather name="image" size={18} color="white" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Change Image</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            {/* name input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Rename it to match your style.."
                placeholderTextColor="#8a8b8a"
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            {/* category selection */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.selectedCategory,
                      isLoading && styles.disabledButton
                    ]}
                    onPress={() => !isLoading && setCategory(cat.id)}
                    disabled={isLoading}
                  >
                    <View style={styles.categoryIcon}>
                      {getCategoryIcon(cat.id, 30)}
                    </View>
                    <Text style={[
                      styles.categoryText, 
                      category === cat.id && styles.selectedCategoryText
                    ]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description Input */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Add a description for your item..."
                placeholderTextColor="#828282"
                value={description}
                onChangeText={setDescription}
                multiline={true}
                numberOfLines={4}
              />
            </View>
          </View>

          {/* save button with loading state */}
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.disabledButton]} 
            onPress={saveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.saveButtonText}>Save Changes</Text>
                <Feather name="check" size={18} color="white" style={{ marginLeft: 5 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 15,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative', // Needed for absolute positioning of loading overlay
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#828282',
    fontSize: 14,
  },
  imageButton: {
    flexDirection: 'row',
    backgroundColor: '#AFC6A3',
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#4A6D51',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 15,
    color: '#4A6D51',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#F8F8F8',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#AFC6A3',
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryText: {
    color: '#7D7D7D',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#AFC6A3',
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 8,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
  },
});