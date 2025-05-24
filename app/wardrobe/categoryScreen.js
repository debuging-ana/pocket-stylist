/*
  this is a reusable component for all clothing category screens - DRY
 It shows items from one specific category (like tops, bottoms, etc.)
*/
import React from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    Image,
    TouchableOpacity,
    Alert 
} from 'react-native';
import { useWardrobe } from '../../context/wardrobeContext';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function CategoryScreen({ category }) {
  const router = useRouter();
  // gets both the items & the functions we need from context
  const { wardrobeItems, deleteItem } = useWardrobe();

  // filter to only show items from this category
  const categoryItems = wardrobeItems.filter(item => item.category === category);

  // format the category name 
  const formattedCategory = category.charAt(0).toUpperCase() + category.slice(1);

  // function to handle deleting an item with confirmation dialog
  const handleDelete = (itemId) => {
    Alert.alert(
      "Delete Item",
      "This action can’t be undone. Do you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          onPress: () => {
            deleteItem(itemId);
            Alert.alert("Success", "Item deleted successfully");
          }
        }
      ]
    );
  };

  // navigates to edit screen
  const handleEdit = (item) => {
    router.push({
      pathname: '/wardrobe/edit-item',
      params: { 
        id: item.id,
        name: item.name,
        category: item.category,
        imageUri: item.imageUri
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My {formattedCategory}</Text>

      {categoryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {category} added yet</Text>
          <Text style={styles.emptySubText}>Add some from the wardrobe screen!</Text>
        </View>
      ) : (
        <FlatList
          data={categoryItems}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemContainer}>
              <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
              <Text style={styles.itemName}>{item.name}</Text>
              
              {/* action buttons container */}
              <View style={styles.buttonsContainer}>
                {/* Edit button */}
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEdit(item)}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="white" />
                </TouchableOpacity>
                
                {/* delete button */}
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDelete(item.id)}
                >
                  <MaterialCommunityIcons name="trash-can" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#E8F0E2',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A775A',
    marginVertical: 10,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#7D7D7D',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#AAAAAA',
  },
  listContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    position: 'relative', // needed for absolute positioning of buttons
  },
  itemImage: {
    width: 150,
    height: 150,
    borderRadius: 5,
  },
  itemName: {
    marginTop: 5,
    color: '#4A775A',
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#4A775A',
    padding: 8,
    borderRadius: 5,
    marginRight: 5,
  },
  deleteButton: {
    backgroundColor: '#FF5252',
    padding: 8,
    borderRadius: 5,
  },
});