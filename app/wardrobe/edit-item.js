/*
 this is the edit screen - similar to add-item but with data pre-filled
 & uses the updateItem function instead of addItem
*/
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
    StatusBar 
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
  const { updateItem } = useWardrobe();
  
  // initialize state with the item's current values
  const [imageUri, setImageUri] = useState(params.imageUri || null);
  const [name, setName] = useState(params.name || '');
  const [category, setCategory] = useState(params.category || 'tops');

  // category options now using the centralized icon function
  const categories = [
    { id: 'tops', name: 'Tops' },
    { id: 'bottoms', name: 'Bottoms' },
    { id: 'jackets', name: 'Jackets' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'shoes', name: 'Shoes' },
  ];

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  // handle saving the updated item
  const saveChanges = () => {
    if (!imageUri) {
      Alert.alert('Image missing. Upload to proceed');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Please enter a name');
      return;
    }
    
    const updatedItem = {
      id: params.id, // keep the same ID
      name,
      category,
      imageUri,
    };
    
    updateItem(updatedItem);
    Alert.alert('Changes Saved!', 'Your item has been updated');
    router.back(); 
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Item Photo</Text>
            {/* image preview section */}
            <View style={styles.imageContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialCommunityIcons name="image" size={50} color="#AFC6A3" />
                  <Text style={styles.placeholderText}>No image selected</Text>
                </View>
              )}
            </View>

            {/* image selection button */}
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
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
                placeholder="Item name"
                placeholderTextColor="#8a8b8a"
                value={name}
                onChangeText={setName}
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
          <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
            <Text style={styles.saveButtonText}>Save Changes</Text>
            <Feather name="check" size={18} color="white" style={{ marginLeft: 5 }} />
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
});