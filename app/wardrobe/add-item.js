// the add item screen - where users can add new clothing items to their digital wardrobe
import { useNavigation } from 'expo-router';
import { useLayoutEffect, useEffect } from 'react';
import WardrobeBackButton from './components/WardrobeBackButton';
import { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
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
  ActivityIndicator,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { REMOVE_BG_API_KEY } from '@env';

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
    return <MaterialCommunityIcons name="sunglasses" size={size} color="#4A6D51" />;
  }
  if (normalized.includes('shoe')) {
    return <MaterialCommunityIcons name="shoe-formal" size={size} color="#4A6D51" />;
  }

  // default icon
  return <MaterialCommunityIcons name="folder" size={size} color="#4A6D51" />;
};

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useWardrobe(); 
  const [imageUri, setImageUri] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tops'); // default
  const [description, setDescription] = useState('');
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [isProcessingBackground, setIsProcessingBackground] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);

  // configure custom back button in header
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

  const removeBackground = async (uri) => {
    setIsProcessingBackground(true);
    try {
      // First convert the image to base64 for iOS compatibility
      const base64Image = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Sending image to Remove.bg API...');
      
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': REMOVE_BG_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_file_b64: base64Image,
          size: 'regular',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API request failed: ${response.status}`);
      }

      // Get the response as an array buffer (works better in React Native)
      const arrayBuffer = await response.arrayBuffer();
      
      // Convert array buffer to base64
      const bytes = new Uint8Array(arrayBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Data = btoa(binary);

      // Save the processed image
      const fileName = `processed_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log('Background removed successfully!');
      setImageUri(fileUri);
      // Reset image loading state after successful processing
      setImageLoading(false);

    } catch (error) {
      console.error('Background removal error:', error);
      Alert.alert(
        'Error',
        'Failed to remove background. Please try again with a different image.'
      );
    } finally {
      setIsProcessingBackground(false);
    }
  };

  const handleImageSelection = async (shouldRemoveBackground = false) => {
    setImageLoading(true);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo access to select images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        console.log('Selected image:', result.assets[0].uri);
        if (shouldRemoveBackground) {
          await removeBackground(result.assets[0].uri);
        } else {
          setImageUri(result.assets[0].uri);
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select image');
    } finally {
      setImageLoading(false);
      setShowImageOptions(false);
    }
  };

  // saves the new item to Firebase through the wardrobe context
  const saveItem = async () => {
    if (!imageUri) {
      Alert.alert('Image Required', 'Please upload an image to proceed');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your item');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const newItem = {
        id: Date.now().toString(), // temporary ID (Firebase will generate its own)
        name,
        category,
        imageUri,
        description,
      };
      
      // handles Firebase storage upload & Firestore document creation
      await addItem(newItem);
      
      Alert.alert('Success!', 'Your item has been added to the wardrobe', [
        {
          text: 'OK',
          onPress: () => {
            resetForm(); // Reset form after successful save
            router.push('/wardrobe');
          }
        }
      ]);
    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save item. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = useCallback(() => {
    setImageUri(null);
    setName('');
    setCategory('tops');
    setDescription('');
    setImageLoading(false);
    setIsProcessingBackground(false);
  }, []);

  // Reset form only when coming from a successful save (not on every focus)
  // useFocusEffect(
  //   useCallback(() => {
  //     resetForm();
  //   }, [resetForm])
  // );

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* image upload card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Item Photo</Text>
            
            {/* image preview section */}
            <View style={styles.imageContainer}>
              {imageUri ? (
                <Image 
                  source={{ uri: imageUri }} 
                  style={styles.image}
                  onLoadStart={() => {
                    // Only set loading if not already processing background
                    if (!isProcessingBackground) {
                      setImageLoading(true);
                    }
                  }}
                  onLoadEnd={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="image" size={50} color="#AFC6A3" />
                  <Text style={styles.placeholderText}>No image selected</Text>
                </View>
              )}
              {(imageLoading || isProcessingBackground) && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#4A6D51" />
                  {isProcessingBackground && (
                    <Text style={styles.processingText}>Removing background...</Text>
                  )}
                </View>
              )}
            </View>

            {/* image selection button */}
            <TouchableOpacity 
              style={[styles.imageButton, (imageLoading || isProcessingBackground) && styles.disabledButton]} 
              onPress={() => setShowImageOptions(true)}
              disabled={imageLoading || isProcessingBackground}
            >
              <Feather name="image" size={18} color="#4A6D51" style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          {/* item details card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            
            {/* name input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Give your item a name (e.g. vintage denim)"
                placeholderTextColor="#828282"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* description input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                placeholder="Add a description (optional)"
                placeholderTextColor="#828282"
                value={description}
                onChangeText={setDescription}
                multiline={false}
                returnKeyType="done"
              />
            </View>

            {/* category selection */}
            <View style={[styles.inputContainer, { marginBottom: 0 }]}>
              <Text style={styles.inputLabel}>Category</Text>
              <View style={styles.categoryContainer}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.selectedCategory,
                    ]}
                    onPress={() => setCategory(cat.id)}
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
          </View>

          {/* save button */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={saveItem} 
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}> 
              {isLoading ? 'Saving...' : 'Save Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Image Options Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageOptions}
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Choose Option</Text>
            
            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => handleImageSelection(false)}
            >
              <Text style={styles.modalButtonText}>Upload Original Image</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.modalButton}
              onPress={() => handleImageSelection(true)}
            >
              <Text style={styles.modalButtonText}>Remove Background</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    padding: 12,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#4A6D51',
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
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    backgroundColor: '#FFFFFF',
    marginBottom: 6.5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  selectedCategory: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
  },
  categoryIcon: {
    marginRight: 10,
  },
  categoryText: {
    color: '#4A6D51',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#4A6D51',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    padding: 15,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  descriptionInput: {
    height: 50,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#CADBC1',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  processingText: {
    marginTop: 10,
    color: '#4A6D51',
    fontSize: 14,
    fontWeight: '500',
  },
});