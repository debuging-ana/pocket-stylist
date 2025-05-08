/*
not done
*/
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, ScrollView } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WardrobeScreen() {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Tops');
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, //this allows users to crop or edit their chosen image before saving
      aspect: [4, 3], //standard aspect ration of image
      quality: 1, //high quality
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const takePhoto = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }
    return null;
  };

  const addItem = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      const newItem = {
        id: Math.random().toString(), //generates random string id for item
        name: 'New Item..',
        category: 'Category..',
        image: { uri: imageUri }
      };
      setItems([...items, newItem]); //updates the state by appending the new item
    }
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const startEdit = (item) => {
    setEditingItem(item);
    setNewName(item.name);
    setNewCategory(item.category);
  };

  const saveEdit = async () => {
    setItems(items.map(item => 
      item.id === editingItem.id 
        ? { ...item, name: newName, category: newCategory }
        : item
    ));
    setEditingItem(null);
  };

  const updateImage = async (itemId) => {
    const imageUri = await pickImage();
    if (imageUri) {
      setItems(items.map(item => 
        item.id === itemId 
          ? { ...item, image: { uri: imageUri } }
          : item
      ));
    }
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <View style={styles.iconWrapper}>
        <MaterialCommunityIcons name="hanger" size={100} color="#7D7D7D" />
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.header}>My Wardrobe</Text>
        
        {/* Categories Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="tshirt-crew" size={40} color="#7D7D7D" />
              </View>
              <Text style={styles.buttonText}>Tops</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="human-male" size={40} color="#7D7D7D" /> 
              </View>
              <Text style={styles.buttonText}>Bottoms</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.row}>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="tshirt-crew-outline" size={40} color="#7D7D7D" />
              </View>
              <Text style={styles.buttonText}>Jackets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="necklace" size={40} color="#7D7D7D" />
              </View>
              <Text style={styles.buttonText}>Accessories</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.row}>
            <TouchableOpacity style={styles.gridItem}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="shoe-formal" size={40} color="#7D7D7D" />
              </View>
              <Text style={styles.buttonText}>Shoes</Text>
            </TouchableOpacity>
            
            {/* empty grid item to maintain layout */}
            <View style={styles.emptyGridItem}></View>
          </View>
        </View>
        
        {/* Editing Form */}
        {editingItem && (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              value={newName}
              onChangeText={setNewName}
              placeholder="Item name"
            />
            <TextInput
              style={styles.input}
              value={newCategory}
              onChangeText={setNewCategory}
              placeholder="Category"
            />
            <View style={styles.editButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setEditingItem(null)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* wardrobe items list */}
        <FlatList
          data={items}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <TouchableOpacity onPress={() => updateImage(item.id)}>
                <Image source={item.image} style={styles.itemImage} />
                <Text style={styles.changePhotoText}>Tap to change photo</Text>
              </TouchableOpacity>
              <View style={styles.itemDetails}>
                <Text>{item.name}</Text>
                <Text>{item.category}</Text>
              </View>
              <View style={styles.itemButtons}>
                <TouchableOpacity style={styles.editButton} onPress={() => startEdit(item)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
        
        {/* add item button */}
        <TouchableOpacity style={styles.addButton} onPress={addItem}>
          <Text style={styles.buttonText}>Add New Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: '#E8F0E2',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    paddingTop: 20,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white', 
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 40,
    marginTop: 0,
    zIndex: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A775A',
  },
  gridContainer: {
    padding: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  gridItem: {
    backgroundColor: 'white',
    borderRadius: 30,
    width: '48%', 
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyGridItem: {
    width: '48%',
  },
  iconContainer: {
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '400',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
  },
  itemButtons: {
    flexDirection: 'row',
  },
  editForm: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#AFC6A3',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  changePhotoText: {
    fontSize: 10,
    color: '#4A775A',
    textAlign: 'center',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#AFC6A3',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal:30,
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 40,
    marginRight:40,
  },
  editButton: {
    backgroundColor: '#828282',
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
  },
  deleteButton: {
    backgroundColor: '#ff6b6b',
    borderRadius: 5,
    padding: 8,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#AFC6A3',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#828282',
    borderRadius: 5,
    padding: 10,
    flex: 1,
    marginLeft: 5,
    alignItems: 'center',
  },
});