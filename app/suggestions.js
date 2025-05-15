import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function SuggestionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setSuggestions([
        {
          id: 1,
          title: "Today's Look",
          tag: "Weather-Based",
          icon: "sunny-outline",
          iconColor: "#FFFFFF",
          description: "Perfect outfit suggestions based on today's weather and your style preferences",
          backgroundColor: "#D2E5C4",
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
          backgroundColor: "#E5DAE0",
          accentColor: "#AF7E88",
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
          backgroundColor: "#BDD4E7",
          accentColor: "#5A7DA3",
          route: "/occasion-styles",
          buttonText: "Browse Occasions"
        },
        {
          id: 4,
          title: "Made for You",
          tag: "Personalized",
          icon: "person-outline",
          iconColor: "#FFFFFF",
          description: "Custom style recommendations based on your preferences, style, and wardrobe items",
          backgroundColor: "#FFC0CB",
          accentColor: "#AF7E88",
          route: "/personalized-styles",
          buttonText: "See Recommendations"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="refresh" size={40} color="#828282" />
            <Text style={styles.loadingText}>Loading suggestions...</Text>
          </View>
        ) : (
          <>
            <Text style={styles.pageTitle}>Style Suggestions</Text>
            <Text style={styles.pageDescription}>
              Discover style suggestions tailored to your preferences, wardrobe, and occasions
            </Text>
            
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
          </>
        )}
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
    paddingTop: 30,
    paddingBottom: 30,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 10,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#828282',
  },
  pageDescription: {
    fontSize: 16,
    color: '#828282',
    marginBottom: 25,
    lineHeight: 22,
  },
  suggestionsContainer: {
    width: '100%',
  },
  suggestionCard: {
    width: '100%',
    height: 180,
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
});