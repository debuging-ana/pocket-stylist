import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert,
  SafeAreaView 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function CameraScreen() {
  const [capturedImage, setCapturedImage] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const cameraRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission, requestPermission]);

  const takePictureWithCamera = async () => {
    if (!cameraRef.current) return;

    try {
      console.log('Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        aspect: [1, 1], // Square aspect ratio
        skipProcessing: false,
      });
      
      if (photo) {
        console.log('Photo taken:', photo.uri);
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to take picture');
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const saveImageToGallery = async () => {
    if (!capturedImage) {
      console.log('No captured image to save');
      return;
    }

    console.log('Starting save process for image:', capturedImage);

    try {
      // Request media library permissions
      console.log('Requesting media library permissions...');
      const { status } = await MediaLibrary.requestPermissionsAsync(true);
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        console.log('Permission denied');
        Alert.alert('Permission needed', 'Please grant photo library permissions to save images.');
        return;
      }

      console.log('Attempting to save image to library...');
      // Save to gallery
      const asset = await MediaLibrary.saveToLibraryAsync(capturedImage);
      console.log('Image saved successfully! Asset:', asset);
      
      Alert.alert(
        'Image Saved', 
        'Your photo has been saved to your Photos',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Clearing captured image and navigating to add-item');
              setCapturedImage(null);
              router.push('/wardrobe/add-item');
            }
          }
        ]
      );
    } catch (error) {
      console.error('Detailed error saving image:', error);
      Alert.alert('Error', `Failed to save image to gallery: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {capturedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: capturedImage }} style={styles.capturedImage} />
          </View>
        ) : (
          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <View style={styles.cameraWrapper}>
                <CameraView 
                  style={styles.camera}
                  facing={facing}
                  ref={cameraRef}
                />
              </View>
            ) : (
              <View style={styles.permissionContainer}>
                <MaterialIcons name="camera-alt" size={80} color="#CCCCCC" />
                <Text style={styles.permissionText}>Camera permission needed</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={styles.controls}>
        {capturedImage ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={retakePicture}>
              <Feather name="rotate-ccw" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Retake</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={saveImageToGallery}>
              <Feather name="save" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={[styles.cameraButton, !permission?.granted && styles.disabledButton]} 
            onPress={takePictureWithCamera}
            disabled={!permission?.granted}
          >
            <Feather name="camera" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AFC6A3',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
  },
  imageContainer: {
    width: '100%',
    height: '102%',
    position: 'relative',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#000000',
    marginTop: 9,
    marginBottom: -40,
  },
  capturedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  clearButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
    height: '70%',
    marginTop: 20,
    marginBottom: -40,
  },
  cameraWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    width: '100%',
    height: '70%',
    marginTop: 20,
    marginBottom: -40,
  },
  permissionText: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    marginTop: 16,
  },
  permissionButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: '#4A6D51',
  },
  permissionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
  },
  cameraButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A6D51',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginTop: 0,
    marginBottom: -20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 0,
    marginBottom: -20,
  },
  actionButton: {
    width: '45%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A6D51',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    marginBottom: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: '#4A6D51',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
});