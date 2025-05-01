//image picker for profile photos

import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const ProfilePictureUploader = ({ imageUri, onPress, loading }) => {
  return (
    <View style={styles.container}>
      {/* Profile image with fallback to placeholder */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <MaterialIcons name="person" size={40} color="#ccc" />
        </View>
      )}
      
      {/* Edit button overlay */}
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={onPress}
        disabled={loading}
      >
        <MaterialIcons 
          name={loading ? 'refresh' : 'edit'} 
          size={24} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    marginVertical: 20,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#2196F3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfilePictureUploader;