import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ScrollView, ActivityIndicator, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useWardrobe } from '../../context/wardrobeContext';
import { useNavigation } from 'expo-router';
import { useLayoutEffect } from 'react';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function OutfitDetailScreen() {
  const { id } = useLocalSearchParams();
  const { savedOutfits, deleteOutfit, updateOutfit } = useWardrobe();
  const navigation = useNavigation();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const outfit = savedOutfits.find((outfit) => outfit.id === id);

  // Initialize edited description when outfit is loaded
  useLayoutEffect(() => {
    if (outfit) {
      setEditedDescription(outfit.description || '');
    }
  }, [outfit]);

  const handleDelete = () => {
    Alert.alert(
      "Delete Outfit",
      "Are you sure you want to delete this outfit?",
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
              // Navigate immediately then delete in background
              router.push('/savedOutfits');
              await deleteOutfit(outfit.id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete outfit");
            }
          }
        }
      ]
    );
  };

  const handleSaveDescription = async () => {
    if (!outfit) return;
    
    setIsSaving(true);
    try {
      const updatedOutfit = {
        ...outfit,
        description: editedDescription.trim(),
      };
      
      await updateOutfit(updatedOutfit);
      setIsEditing(false);
      Alert.alert('Success', 'Description updated successfully');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update description');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // If no outfit found, redirect immediately
  if (!outfit) {
    router.push('/savedOutfits');
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Outfit Image Section */}
        <View style={styles.imageContainer}>
          {outfit.imageUri ? (
            <Image 
              source={{ uri: outfit.imageUri }} 
              style={styles.outfitImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <MaterialCommunityIcons name="tshirt-crew" size={80} color="#CCCCCC" />
              <Text style={styles.placeholderText}>No image available</Text>
            </View>
          )}
        </View>

        {/* Outfit Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.outfitName}>{outfit.name}</Text>
          
          <View style={styles.descriptionContainer}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionLabel}>Description</Text>
              {!isEditing && (
                <TouchableOpacity 
                  style={styles.editIconButton} 
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
                  multiline={true}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveDescription}
                />
                <View style={styles.editButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.cancelEditButton} 
                    onPress={() => {
                      setIsEditing(false);
                      setEditedDescription(outfit.description || '');
                    }}
                  >
                    <Text style={styles.cancelEditButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.saveDescriptionButton, isSaving && styles.disabledButton]} 
                    onPress={handleSaveDescription}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#4A6D51" />
                    ) : (
                      <Text style={styles.saveDescriptionButtonText}>Save</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={styles.description}>
                {outfit.description || 'No description provided.'}
              </Text>
            )}
          </View>

          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="tshirt-crew-outline" size={20} color="#4A6D51" />
              <Text style={styles.infoText}>
                {outfit.items?.length || 0} {outfit.items?.length === 1 ? 'item' : 'items'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar" size={20} color="#4A6D51" />
              <Text style={styles.infoText}>Created {formatDate(outfit.createdAt)}</Text>
            </View>
          </View>

          {/* Individual Items */}
          {outfit.items && outfit.items.length > 0 && (
            <View style={styles.itemsContainer}>
              <Text style={styles.sectionTitle}>Items in this Outfit</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.itemsScrollView}
              >
                {outfit.items.map((item, index) => (
                  <View key={`${item.id}-${index}`} style={styles.itemCard}>
                    <Image 
                      source={{ uri: item.imageUri }} 
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Delete Button */}
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={20} color="#995454" />
            <Text style={styles.deleteButtonText}>Delete Outfit</Text>
          </TouchableOpacity>

          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/savedOutfits')}
          >
            <Text style={styles.backButtonText}>Back to Saved Outfits</Text>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    color: '#828282',
    marginTop: 16,
    marginBottom: 20,
    textAlign: 'center',
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
  outfitImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  placeholderText: {
    marginTop: 12,
    fontSize: 16,
    color: '#CCCCCC',
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
  outfitName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 16,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  descriptionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
  },
  editIconButton: {
    marginLeft: 8,
  },
  descriptionInput: {
    height: 100,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cancelEditButton: {
    backgroundColor: '#FFE5E5',
    borderColor: '#995454',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  cancelEditButtonText: {
    color: '#995454',
    fontSize: 16,
    fontWeight: '600',
  },
  saveDescriptionButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  saveDescriptionButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    color: '#333333',
    lineHeight: 24,
  },
  infoContainer: {
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 16,
  },
  itemsContainer: {
    marginBottom: 24,
  },
  itemsScrollView: {
    padding: 10,
  },
  itemCard: {
    width: 70,
    height: 70,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 8,
  },
  itemImage: {
    width: '100%',
    height: '100%',
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
  backButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51',
    borderWidth: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#4A6D51',
    fontSize: 16,
    fontWeight: '600',
  },
}); 