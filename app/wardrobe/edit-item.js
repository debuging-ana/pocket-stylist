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
    Alert 
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function EditItemScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { updateItem } = useWardrobe();
  
  // initialize state with the item's current values
  const [imageUri, setImageUri] = useState(params.imageUri || null);
  const [name, setName] = useState(params.name || '');
  const [category, setCategory] = useState(params.category || 'tops');

  const categories = [
    { id: 'tops', name: 'Tops', image: require('../../assets/images/polo-shirt.png') },
    { id: 'bottoms', name: 'Bottoms', image: require('../../assets/images/pants.png') },
    { id: 'jackets', name: 'Jackets', image: require('../../assets/images/jacket.png') },
    { id: 'accessories', name: 'Accessories', image: require('../../assets/images/necklace.png') },
    { id: 'shoes', name: 'Shoes', image: require('../../assets/images/running-shoe.png') },
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
    <View style={styles.container}>
      {/* image preview section */}
      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
           <MaterialCommunityIcons name="image" size={50} color="#7D7D7D" />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      {/* image selection button */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Change Image</Text>
        </TouchableOpacity>
      </View>

      {/* name input */}
      <TextInput
        style={styles.input}
        placeholder="Item name"
        placeholderTextColor="#8a8b8a"
        value={name}
        onChangeText={setName}
      />

      {/* category selection */}
      <Text style={styles.sectionTitle}>Select Category</Text>
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
            <Image 
              source={cat.image} 
              style={[
                styles.categoryImage,
                category === cat.id && styles.selectedCategoryImage
              ]} 
            />
            <Text style={[
              styles.categoryText, 
              category === cat.id && styles.selectedCategoryText
            ]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* save button */}
      <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#E8F0E2',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#7D7D7D',
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  imageButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#4A775A',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A775A',
    marginBottom: 10,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryButton: {
    width: '48%',
    padding: 15,
    borderRadius: 10,
    backgroundColor: 'white',
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCategory: {
    backgroundColor: '#4A775A',
  },
  categoryImage: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    marginRight: 10,
    tintColor: '#7D7D7D',
  },
  selectedCategoryImage: {
    tintColor: 'white',
  },
  categoryText: {
    marginLeft: 5,
    color: '#7D7D7D',
  },
  selectedCategoryText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#4A775A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});