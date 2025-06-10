import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function SuggestionsPage() {
  const router = useRouter();
  const suggestions = [
    {
      id: 1,
      title: "Weather-based",
      tag: "Weather-Based",
      icon: "sunny-outline",
      iconColor: "#FFFFFF",
      description: "Perfect outfit suggestions based on today's weather and your style preferences",
      backgroundColor: "#CDD7E4",
      borderColor: "#536C8C",
      accentColor: "#4A6D51",
      route: "/daily-outfit",
      buttonText: "View Outfit"
    },
    {
      id: 2,
      title: "What to pack?",
      tag: "Get Away",
      icon: "calendar-outline",
      iconColor: "#FFFFFF",
      description: "Outfit ideas to avoid overpack or forget essentials.",
      backgroundColor: "#CADBC1",
      borderColor: "#4A6D51",
      accentColor: "#4A6D51",
      route: "/get-away-trip",
      buttonText: "Make your list!"
    },
    {
      id: 3,
      title: "Styling by Occasion",
      tag: "Occasion-Based",
      icon: "briefcase-outline",
      iconColor: "#FFFFFF",
      description: "Find the perfect look for any occasion, from office meetings to weekend brunches",
      backgroundColor: "#E3D3C6",
      borderColor: "#8B6E57",
      accentColor: "#4A6D51",
      route: "/occasion-styles",
      buttonText: "Browse Occasions"
    },
    {
      id: 4,
      title: "Personalised Outfits",
      tag: "Personalized",
      icon: "person-outline",
      iconColor: "#FFFFFF",
      description: "Custom style recommendations based on your preferences.",
      backgroundColor: "#DFBDBD",
      borderColor: "#995454",
      accentColor: "#4A6D51",
      route: "/made-for-you",
      buttonText: "Generate now!"
    },
    {
      id: 5,
      title: "Event Ready",
      tag: "Special Event",
      icon: "calendar-outline",
      iconColor: "#FFFFFF",
      description: "Outfit ideas perfect for your upcoming events and occasions",
      backgroundColor: "#CADBC1",
      borderColor: "#4A6D51",
      accentColor: "#4A6D51",
      route: "/events",
      buttonText: "Explore"
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Suggestions Cards */}
        <View style={styles.suggestionsContainer}>
          {suggestions.map(suggestion => (
            <TouchableOpacity 
              key={suggestion.id} 
              style={[
                styles.suggestionCard, 
                { 
                  backgroundColor: suggestion.backgroundColor,
                  borderColor: suggestion.borderColor,
                  borderWidth: 1,
                }
              ]}
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
  testButton: {
    backgroundColor: '#4A6D51',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  testResultContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  testResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 8,
  },
  testResultText: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
});