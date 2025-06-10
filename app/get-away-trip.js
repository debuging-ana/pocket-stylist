import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Keyboard } from 'react-native';
import { generateImageFromPrompt } from '../services/deepAi';
import { Picker } from '@react-native-picker/picker';


const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola",
  "Argentina", "Australia", "Austria", "Bahamas", "Bangladesh",
  "Belgium", "Brazil", "Bulgaria", "Canada", "Chile", "China",
  "Colombia", "Croatia", "Czech Republic", "Denmark", "Egypt",
  "Finland", "France", "Germany", "Greece", "Hungary", "India",
  "Indonesia", "Ireland", "Israel", "Italy", "Japan", "Kenya",
  "Luxembourg", "Mexico", "Netherlands", "New Zealand", "Nigeria",
  "Norway", "Pakistan", "Peru", "Philippines", "Poland", "Portugal",
  "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "Slovakia",
  "South Africa", "South Korea", "Spain", "Sweden", "Switzerland",
  "Thailand", "Turkey", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Vietnam", "Zimbabwe"
];

export default function TravelBased() {
    const [imageData, setImageData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedCountry, setSelectedCountry] = useState("Afghanistan");

    const handleGenerateImage = async () => {
        Keyboard.dismiss();
        
        if(!selectedCountry){
            setError("Please select a country first");
            return;
        }

        setLoading(true);
        setError(null);
        setImageData(null);

        try {
            const prompt = `I'm planning a trip and I want help choosing an outfit to pack. Please suggest a travel-appropriate 
            look based on the destination country I'll visit, taking into account the local weather at the moment, culture, and typical
             dress code. The goal is to avoid overpacking and only bring what's essential and versatile. here is the country and places 
             that I'll be visiting ${selectedCountry}, what should I pack?`;
            const base64Image = await generateImageFromPrompt(prompt);
            setImageData(base64Image);
        } catch (err) {
            setError('Failed to generate image. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Travel-Based</Text>

            <Text style={styles.inputLabel}>
                Planning a getaway but don't want to overpack? Select a country and we'll check the weather and give you a smart packing list. It's that easy!
            </Text>

            <Picker
                selectedValue={selectedCountry}
                onValueChange={(itemValue) => setSelectedCountry(itemValue)}
                style={styles.picker}
            >
                {countries.map((country) => (
                    <Picker.Item key={country} label={country} value={country} />
                ))}
            </Picker>

            <TouchableOpacity testID='generate-outfit-button' 
                style={[
                    styles.generateOutfitButton,
                    (loading || !selectedCountry) && styles.generateOutfitButtonDisabled
                ]}
                onPress={handleGenerateImage} disabled={loading || !selectedCountry}>
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
                    setSelectedCountry('');
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
    picker: {
        flex: 1,
        height: 50,
        width: '100%',
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