// the add item screen - where users can add new clothing items to their digital wardrobe
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
import { useRouter } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Feather from '@expo/vector-icons/Feather';

export default function AddItemScreen() {
  const router = useRouter();
  const { addItem } = useWardrobe();
  const [imageUri, setImageUri] = useState(null); //stores the image URI
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
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Item Details</Text>
            {/* name input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Give your item a name (e.g. vintage denim)"
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
            </View>
          </View>

          {/* save button */}
          <TouchableOpacity style={styles.saveButton} onPress={saveItem}>
            <Text style={styles.saveButtonText}>Save to Wardrobe</Text>
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
    backgroundColor: '#DBE9D1',
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