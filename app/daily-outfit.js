import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { generateImageFromPrompt } from '../services/openAI';

export default function DailyOutFit() {
  const [imageData, setImageData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateImage = async () => {
    setLoading(true);
    setError(null);
    setImageData(null);

    try {
      const base64Image = await generateImageFromPrompt('Create complete outfit suggestions based on the current weather in Auckland and the user’s most common style, with the goal of inspiring daily clothing choices through an app. Each outfit should include shoes, a top (such as blouses or shirts), a bottom (such as pants, shorts, or skirts), additional layers (such as jackets or blazers), and optional accessories, always taking into account the weather conditions (rain, cold, heat, wind) and has to be realistic. The visual representation does not need to include a face—just the idea of a complete look styled like a fashion display.');
      setImageData(base64Image);
    } catch (err) {
      setError('Failed to generate image. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Today's Look</Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => handleGenerateImage()}
      >
        <Text style={styles.loginButtonText}>
          Generate Outfit
        </Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" style={styles.loading} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {imageData && (
        <Image
          source={{ uri: imageData }}
          style={styles.image}
          resizeMode="contain"
        />
      )}
    </View>
  );
}

//temporary 
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
  button: {
    backgroundColor: '#AFC6A3', 
    padding: 15,
    borderRadius: 25,
    width: '75%',
    alignItems: 'center',
    marginVertical: 10,
    elevation: 3, //for android shadows, test?
    shadowColor: '#828282', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  image: { width: 512, height: 512, marginTop: 20, borderRadius: 10, padding: 15 },
});