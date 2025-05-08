// the add item screen - where users can add new clothing items to their digital wardrobe
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
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useWardrobe();
  const [imageUri, setImageUri] = useState(null); //stores te image URI
  const [name, setName] = useState('');
  const [category, setCategory] = useState('tops'); //default

  //category options with their corresponding icons
  const categories = [
    { id: 'tops', name: 'Tops', image: require('../../assets/images/polo-shirt.png') },
    { id: 'bottoms', name: 'Bottoms', image: require('../../assets/images/pants.png') },
    { id: 'jackets', name: 'Jackets', image: require('../../assets/images/jacket.png') },
    { id: 'accessories', name: 'Accessories', image: require('../../assets/images/necklace.png') },
    { id: 'shoes', name: 'Shoes', image: require('../../assets/images/running-shoe.png') },
  ];

  //to handle selecting an image from user's gallery/photos
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, //no videos
      allowsEditing: true,
      aspect: [4, 3], //standard aspect ratio
      quality: 1, //high qual
    });

    //if user didnt cancel the picker and actually selects an image:
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

    //had camera option here but kept having troubles with it so just deleted it

  //handles saving the new item to user wardrobe
  const saveItem = () => {
    if (!imageUri) {
      Alert.alert('Image missing – upload to proceed');
      return;
    }
    if (!name.trim()) {
      Alert.alert('Please enter a name');
      return;
    }
    
    const newItem = {
      id: Date.now().toString(),
      name,
      category,
      imageUri,
    };
    
    addItem(newItem);
    Alert.alert('Styled & Filed!', 'Your item is in the wardrobe');
    router.push('/wardrobe');
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

      {/* image selection buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* name input */}
      <TextInput
        style={styles.input}
        placeholder="Give your outfit a name! (e.g. vintage denim)"
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
      <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
        <Text style={styles.saveButtonText}>Save to Wardrobe</Text>
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
    overflow: 'hidden', //to keep child images within border radius
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
  placeholderImage: {
    width: 60,
    height: 60,
    opacity: 0.5,
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