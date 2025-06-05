import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { useNavigation } from 'expo-router';
import { useLayoutEffect, useState } from 'react';
import WardrobeBackButton from './components/WardrobeBackButton';
import { Feather } from '@expo/vector-icons';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { wardrobeItems, deleteItem, updateItem } = useWardrobe();
  const navigation = useNavigation();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const item = wardrobeItems.find((item) => item.id === id);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => <WardrobeBackButton />,
    });
  }, [navigation]);

  // Initialize edited description when item is loaded
  useLayoutEffect(() => {
    if (item) {
      setEditedDescription(item.description || '');
    }
  }, [item]);

  const handleSaveDescription = async () => {
    if (!item) return;
    
    setIsSaving(true);
    try {
      const updatedItem = {
        ...item,
        description: editedDescription.trim(),
      };
      
      await updateItem(updatedItem);
      setIsEditing(false);
      Alert.alert('Success', 'Description updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteItem(item.id);
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete item");
            }
          }
        }
      ]
    );
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Item not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.imageUri }} 
            style={styles.image}
            resizeMode="cover"
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.category}>Category: {item.category}</Text>
          
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionLabel}>Description</Text>
              {!isEditing && (
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => setIsEditing(true)}
                >
                  <Feather name="edit-2" size={20} color="#4A6D51" />
                </TouchableOpacity>
              )}
            </View>
            
            {isEditing ? (
              <View>
                <TextInput
                  style={styles.descriptionInput}
                  value={editedDescription}
                  onChangeText={setEditedDescription}
                  placeholder="Add a description..."
                  placeholderTextColor="#828282"
                  multiline={false}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    handleSaveDescription();
                  }}
                />
              </View>
            ) : (
              <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
                {item.description || 'No description provided.'}
              </Text>
            )}
          </View>

          {/* Delete Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={20} color="#995454" />
            <Text style={styles.deleteButtonText}>Delete Item</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  content: {
    padding: 20,
  },
  imageContainer: {
    width: '100%',
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE5E5',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#995454',
    gap: 8,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: '#995454',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});