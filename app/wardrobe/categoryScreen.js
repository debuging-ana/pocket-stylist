/*
  this is a reusable component for all clothing category screens - DRY
 It shows items from one specific category (like tops, bottoms, etc.)
*/
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
import { Feather } from '@expo/vector-icons';

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
    "This action can't be undone. Do you want to delete this item?",
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

// Updated to navigate to item detail page
const handleEdit = (item) => {
  router.push({
    pathname: '/wardrobe/[id]',
    params: { id: item.id }
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
            <Text style={styles.itemName}>{item.name}</Text>
            <Image source={{ uri: item.imageUri }} style={styles.itemImage} />
            
            {/* Action Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => handleEdit(item)}
              >
                <Feather name="edit-2" size={18} color="#4A6D51" />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => handleDelete(item.id)}
              >
                <Feather name="trash-2" size={18} color="#995454" />
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
  backgroundColor: '#F9F9F4',
},
title: {
  fontSize: 24,
  fontWeight: 'bold',
  color: '#4A6D51',
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
  width: '48%',
  height: 280,
},
itemName: {
  marginBottom: 8,
  color: '#4A6D51',
  textAlign: 'center',
  fontSize: 14,
  height: 20,
  fontWeight: '500',
},
itemImage: {
  width: '100%',
  height: 180,
  borderRadius: 5,
  resizeMode: 'cover',
  marginBottom: 10,
},
buttonsContainer: {
  flexDirection: 'row',
  gap: 8,
  marginTop: 'auto',
  justifyContent: 'center',
  width: '100%',
},
editButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#CADBC1',
  width: 100,
  height: 40,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#4A6D51',
},
deleteButton: {
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FFE5E5',
  width: 40,
  height: 40,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#995454',
},
editButtonText: {
  color: '#4A6D51',
  fontSize: 14,
  fontWeight: '600',
  marginLeft: 4,
},
deleteButtonText: {
  color: '#995454',
  fontSize: 12,
  fontWeight: '600',
},
});