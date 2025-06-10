import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert, TextInput } from 'react-native';
import { generateImageFromPrompt } from '../services/openAI';

export default function DailyOutFit() {
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [myOutfitDetails, setMyOutfitDetails] = useState('');

    const handleGenerateImage = async () => {
        if(!myOutfitDetails){
            setError("Please fill all inputs");
            return;
        }

        setLoading(true);
        setError(null);
        setImageData(null);

        try {
            const prompt = "A fashion full body model wearing an outfit based on the current weather in Auckland, high fashion photography, photorealistic, 4K detail, make sure there is no background in the image";
            const base64Image = await generateImageFromPrompt(`${prompt} and using these requirements ${myOutfitDetails}`);
            setImageData(base64Image);
        } catch (err) {
            setError('Failed to generate image. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Personalised Outfits</Text>

            <Text style={styles.inputLabel}>Let your imagination run wild! Your style, your rules!</Text>
            <TextInput testID='my-outfit-details' style={styles.input} value={myOutfitDetails} onChangeText={setMyOutfitDetails} editable multiline numberOfLines={4} maxLength={80} />

            <TouchableOpacity testID='generate-outfit-button' 
            style={[
                styles.generateOutfitButton,
                (loading || !myOutfitDetails.trim()) && styles.generateOutfitButtonDisabled
            ]}
            onPress={handleGenerateImage} disabled={loading || !myOutfitDetails.trim()}>
                <Text style={styles.generateOutfitButtonText}>Generate Outfit</Text>
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" style={styles.loading} />}
            {error && <Text style={styles.error}>{error}</Text>}

            {imageData && (
                <>
                    <Image source={{ uri: imageData }} style={styles.image} resizeMode="contain" />
                </>
            )}
             {imageData && (
                        <TouchableOpacity style={styles.saveButton} onPress={() => {
                        setImageData(null);
                        setMyOutfitDetails('');
                        setError(null);
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
    inputLabel: {
        fontSize: 14,
        textAlign: 'left',
        color: '#4A6D51',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        marginBottom: 20,
    },
    input: {
        backgroundColor: '#F9F9F4',
        borderRadius: 15,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        width: 400,
        height: 80,
        marginBottom: 10,
    },
    error: {
        color: 'red',
        marginTop: 10
    },
    generateOutfitButton: {
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
    generateOutfitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    generateOutfitButtonDisabled: {
        backgroundColor: '#cccccc',
        opacity: 0.6,
        shadowColor: 'transparent',
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