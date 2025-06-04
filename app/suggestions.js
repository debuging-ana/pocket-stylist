import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { generateWithLlama } from '../services/ollamaService';
import { ActivityIndicator } from 'react-native';

export default function SuggestionsPage() {
  const router = useRouter();
  const [testStatus, setTestStatus] = useState({
    loading: false,
    result: '',
    showResult: false
  });
  const suggestions = [
    {
      id: 1,
      title: "Today's Look",
      tag: "Weather-Based",
      icon: "sunny-outline",
      iconColor: "#FFFFFF",
      description: "Perfect outfit suggestions based on today's weather and your style preferences",
      backgroundColor: "#CDD7E4",
      accentColor: "#4A6D51",
      route: "/daily-outfit",
      buttonText: "View Outfit"
    },
    {
      id: 2,
      title: "Event Ready",
      tag: "Special Event",
      icon: "calendar-outline",
      iconColor: "#FFFFFF",
      description: "Outfit ideas perfect for your upcoming events and occasions",
      backgroundColor: "#CADBC1",
      accentColor: "#4A6D51",
      route: "/occasion-outfits",
      buttonText: "Explore"
    },
    {
      id: 3,
      title: "Styling by Occasion",
      tag: "Occasion-Based",
      icon: "briefcase-outline",
      iconColor: "#FFFFFF",
      description: "Find the perfect look for any occasion, from office meetings to weekend brunches",
      backgroundColor: "#E3D3C6",
      accentColor: "#4A6D51",
      route: "/occasion-styles",
      buttonText: "Browse Occasions"
    },
    {
      id: 4,
      title: "Made for You",
      tag: "Personalized",
      icon: "person-outline",
      iconColor: "#FFFFFF",
      description: "Custom style recommendations based on your preferences.",
      backgroundColor: "#DFBDBD",
      accentColor: "#4A6D51",
      route: "/made-for-you",
      buttonText: "Generate now!"
    }
  ];

  //temporary!
  const runOllamaTest = async () => {
    setTestStatus(prev => ({ ...prev, loading: true, showResult: true }));
    
    try {
      const prompt = "As a fashion assistant, suggest one outfit idea for a college student's business casual presentation. Include 3 specific clothing items.";
      const response = await generateWithLlama(prompt);
      setTestStatus(prev => ({ ...prev, loading: false, result: response || "No response received" }));
    } catch (error) {
      console.error("Ollama Error:", error);
      setTestStatus(prev => ({ ...prev, loading: false, result: "Failed to connect to Ollama. Make sure it's running and check your network connection." }));
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Test Button */}
        <TouchableOpacity 
          style={styles.testButton}
          onPress={runOllamaTest}
          disabled={testStatus.loading}
        >
          {testStatus.loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.testButtonText}>Test Ollama Integration</Text>
          )}
        </TouchableOpacity>

        {/* Test Result Display */}
        {testStatus.showResult && (
          <View style={styles.testResultContainer}>
            <Text style={styles.testResultTitle}>Ollama Test Result:</Text>
            <Text style={styles.testResultText}>
              {testStatus.result}
            </Text>
          </View>
        )}

        {/* Suggestions Cards */}
        <View style={styles.suggestionsContainer}>
          {suggestions.map(suggestion => (
            <TouchableOpacity 
              key={suggestion.id} 
              style={[styles.suggestionCard, { backgroundColor: suggestion.backgroundColor }]}
              onPress={() => router.push(suggestion.route)}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name={suggestion.icon} size={20} color={suggestion.iconColor} />
                  <Text style={styles.cardTag}>{suggestion.tag}</Text>
                </View>
                <Text style={styles.cardTitle}>{suggestion.title}</Text>
                <Text style={styles.cardDescription}>{suggestion.description}</Text>
                <View style={styles.cardButton}>
                  <Text style={styles.cardButtonText}>{suggestion.buttonText}</Text>
                  <Feather name="arrow-right" size={14} color={suggestion.accentColor} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tip Card */}
        <TouchableOpacity style={styles.tipCard} onPress={() => router.push('/tips')}>
          <View style={styles.tipIconContainer}>
            <Ionicons name="bulb-outline" size={24} color="#FFFFFF" />
          </View>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Style Tip</Text>
            <Text style={styles.tipText}>
              Try mixing textures within the same color family for a sophisticated monochromatic look
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color="#CCCCCC" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  content: {
    padding: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionCard: {
    width: '100%',
    height: 170,
    borderRadius: 20,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTag: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 5,
    fontWeight: '500',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
    fontSize: 13,
    marginRight: 5,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#4A6D51',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 3,
  },
  tipText: {
    fontSize: 13,
    color: '#828282',
  },
  testButton: {
    backgroundColor: '#4A6D51',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  testResultContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  testResultTitle: {
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 8
  },
  testResultText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20
  },
});