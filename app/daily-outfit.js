import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import { generateImageFromPrompt } from '../services/openAI';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function DailyOutFit() {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    setImageData(null);

    try {
      const base64Image = await generateImageFromPrompt(
        "A fashion full body model wearing an outfit based on the current weather in Auckland, high fashion photography, photorealistic, 4K detail, make sure there is no background in the image"
      );
      setImageData(base64Image);
    } catch (err) {
      setError('Failed to generate image. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOutfit = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    const db = getFirestore();

    if (!user || !imageData) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'users', user.uid, 'savedOutfits'), {
        image: imageData,
        dateSaved: new Date()
      });
      Alert.alert('Saved', 'Outfit has been saved to your collection.');
    } catch (err) {
      Alert.alert('Error', 'Failed to save outfit.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today's Look</Text>

      <TouchableOpacity style={styles.loginButton} onPress={handleGenerateImage}>
        <Text style={styles.loginButtonText}>Generate Outfit</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={styles.loading} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {imageData && (
        <>
          <Image source={{ uri: imageData }} style={styles.image} resizeMode="contain" />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveOutfit} disabled={saving}>
            <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save Outfit'}</Text>
          </TouchableOpacity>
        </>
      )}
      {imageData && (
      <TouchableOpacity style={styles.saveButton} onPress={() => {
            setImageData(null);
            setError(null);
            setLoading(null);
     }}>
       <Text style={styles.saveButtonText}>Refresh page</Text>
      </TouchableOpacity>
    )}
    </View>
  );
}

// Style updates
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#828282',
    marginBottom: 40,
  },
  error: {
    color: 'red',
    marginTop: 10
  },
  loginButton: {
    backgroundColor: '#4A6D51',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#4A6D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#AFC6A3',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginTop: 15,
    elevation: 3,
    shadowColor: '#AFC6A3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  image: {
    width: 300,
    height: 300,
    marginTop: 20,
    borderRadius: 10,
  },
});
