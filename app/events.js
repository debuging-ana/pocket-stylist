import { View, Text, FlatList, Pressable, Modal, TextInput, Alert, ScrollView, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { generateWithLlama } from '../services/ollamaService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, db } from '../firebaseConfig';
import { collection, doc, setDoc, onSnapshot, query, Timestamp, writeBatch } from 'firebase/firestore';
import { logger } from 'react-native-logs';
import * as Location from 'expo-location';
import { getWeather } from '../services/weatherService';

//initialize logger for debugging purposes
const log = logger.createLogger();

//helper function to map weather conditions to appropriate icons
const getWeatherIcon = (condition) => {
  switch(condition) {
    case 'sunny': return 'sunny';
    case 'rainy': return 'rainy';
    case 'cloudy': return 'cloudy';
    case 'snowy': return 'snow';
    case 'stormy': return 'thunderstorm';
    case 'windy': return 'flag';
    default: return 'partly-sunny';
  }
};

export default function EventsScreen() {
  //state for managing events list
  const [events, setEvents] = useState([]);
  
  //modal visibility states
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  //outfit suggestion states
  const [outfitSuggestions, setOutfitSuggestions] = useState([]);
  
  //date/time picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  //loading states
  const [loadingOutfitId, setLoadingOutfitId] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  //user data states
  const [lastSelected, setLastSelected] = useState(null);
  const [userProfile, setUserProfile] = useState({ gender: 'person' });
  
  //new event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: new Date(),
    time: new Date(),
    type: 'casual',
  });
  
  //form validation errors
  const [errors, setErrors] = useState({
    title: false,
    date: false
  });
  
  //data source states
  const [outfitSource, setOutfitSource] = useState(null);
  const [wardrobeItems, setWardrobeItems] = useState([]);
  
  //weather data state with default values
  const [weatherData, setWeatherData] = useState({
    condition: 'moderate',
    temperature: 20
  });

  //main useEffect for data fetching
  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    //wardrobe listener with error handling
    const wardrobeRef = collection(db, "users", auth.currentUser.uid, "wardrobe");
    const unsubscribeWardrobe = onSnapshot(
      wardrobeRef,
      (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setWardrobeItems(items);
      },
      (error) => {
        if (error.code === 'permission-denied' && !auth.currentUser) {
          console.log("Ignoring wardrobe permission error");
        } else {
          console.error("Wardrobe error:", error);
        }
      }
    );

    //events listener with error handling
    const eventsRef = collection(db, "users", auth.currentUser.uid, "events");
    const q = query(eventsRef);
    const unsubscribeEvents = onSnapshot(
      q,
      (snapshot) => {
        const userEvents = [];
        const seenIds = new Set();

        snapshot.forEach((doc) => {
          if (seenIds.has(doc.id)) return;
          seenIds.add(doc.id);

          const eventData = doc.data();
          userEvents.push({
            id: doc.id,
            title: eventData.title,
            date: eventData.date?.toDate() || new Date(),
            type: eventData.type,
            outfit: eventData.outfit || null
          });
        });
        setEvents(userEvents);
      },
      (error) => {
        if (error.code === 'permission-denied' && !auth.currentUser) {
          console.log("Ignoring events permission error");
        } else {
          console.error("Events error:", error);
        }
      }
    );

    //user profile listener with error handling
    const userRef = doc(db, "users", auth.currentUser.uid);
    const unsubscribeUser = onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          setUserProfile({
            gender: doc.data().gender || 'person'
          });
        }
      },
      (error) => {
        if (error.code === 'permission-denied' && !auth.currentUser) {
          console.log("Ignoring user permission error");
        } else {
          console.error("User error:", error);
        }
      }
    );

    //cleanup function to unsubscribe all listeners
    return () => {
      unsubscribeWardrobe();
      unsubscribeEvents();
      unsubscribeUser();
    };
  }, [auth.currentUser?.uid]);

  //form validation function
  const validateEvent = () => {
    const currentDate = new Date();
    const eventDate = new Date(newEvent.date);
    eventDate.setHours(newEvent.time.getHours(), newEvent.time.getMinutes());

    //check for required fields & valid dates
    const newErrors = {
      title: newEvent.title.trim() === '',
      date: eventDate <= currentDate
    };
    setErrors(newErrors);
    return !newErrors.title && !newErrors.date;
  };

  //function to add a new event
  const addEvent = async () => {
    //to prevent multiple submissions
    if (isLoading) return;
    setIsLoading(true);

    //validate form before proceeding
    if (!validateEvent() || !auth.currentUser) {
      Alert.alert('Validation Error', 'Please enter a title and select a future date');
      setIsLoading(false);
      return;
    }

    //combine date and time into single datetime object
    const eventDateTime = new Date(newEvent.date);
    eventDateTime.setHours(newEvent.time.getHours());
    eventDateTime.setMinutes(newEvent.time.getMinutes());

    try {
      //use Firestore batch write for atomic operations
      const batch = writeBatch(db);
      const eventRef = doc(collection(db, "users", auth.currentUser.uid, "events"));

      //add event data to batch
      batch.set(eventRef, {
        title: newEvent.title,
        date: Timestamp.fromDate(eventDateTime),
        type: newEvent.type,
        createdAt: Timestamp.now()
      });

      //commit the batch
      await batch.commit();
      setShowModal(false);
      resetEventForm();
    } catch (error) {
      console.error("Error adding event: ", error);
      Alert.alert("Error", "Failed to add event");
    } finally {
      setIsLoading(false);
    }
  };

  //reset form to initial state
  const resetEventForm = () => {
    setNewEvent({
      title: '',
      date: new Date(),
      time: new Date(),
      type: 'casual',
    });
    setErrors({
      title: false,
      date: false
    });
  };

  //function to regenerate outfit suggestions
  const regenerateSuggestions = async () => {
    if (!selectedEvent) return;
    setRegenerating(true);
    await getOutfitSuggestions(selectedEvent);
    setRegenerating(false);
  };

  //main function to get outfit suggestions using AI
  const getOutfitSuggestions = useCallback(async (event) => {
    setSelectedEvent(event);
    setOutfitSuggestions([]);
    setOutfitSource(null);

    //early return if no wardrobe items available
    if (!wardrobeItems.length) {
      console.log("No wardrobe items available");
      return;
    }

    //starts performance tracking
    const startTime = Date.now();
    log.info("Starting Ollama generation...");

    // attempt to get user location
    let location;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      //handles location permission denial
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Enable location access for weather-based suggestions',
          [
            {
              text: 'Settings',
              onPress: () => Linking.openSettings()
            },
            { text: 'Cancel' }
          ]
        );
        throw new Error('Permission denied');
      }

      //gets current position with high accuracy
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
    } catch (error) {
      console.log("Location error:", error);
      //fallback to default location (AUT)
      location = {
        coords: {
          latitude: -36.8536,
          longitude: 174.7665
        }
      };
    }

    //fetches weather data based on location
    try {
      const weather = await getWeather(location.coords.latitude, location.coords.longitude, event.date);
      setWeatherData({
        condition: weather.condition.toLowerCase(),
        temperature: Math.round(weather.temperature)
      });
    } catch (error) {
      console.log("Weather error:", error);
    }

    //helper function to select a random wardrobe item
    const getFeaturedWardrobeItem = () => {
      let availableItems = wardrobeItems;
      // avoid suggesting the same item consecutively
      if (wardrobeItems.length > 1 && lastSelected) {
        availableItems = wardrobeItems.filter(item => item.id !== lastSelected.id);
      }
      return availableItems[Math.floor(Math.random() * availableItems.length)];
    };

    //select featured item & prepare its description
    const featuredItem = getFeaturedWardrobeItem();
    const itemDescription = featuredItem ? 
      `${featuredItem.category}: ${featuredItem.name} (${featuredItem.colors})` : 
      null;

    //function to validate AI response completeness
    const isCompleteResponse = (response) => {
      return response && 
             response.length > 50 &&
             response.includes(featuredItem.name) &&
             (response.includes('°C') || response.includes('weather'));
    };

    //construct prompt for ollama AI, why is prompting so hard
    const prompt = `Suggest a complete outfit for a ${userProfile.gender} attending a ${event.type} event in ${weatherData.condition} weather (${weatherData.temperature}°C). 
    Featured item: ${itemDescription}.
    Respond in one paragraph with:
    - 2 to 3 clothing items including the featured item
    - Weather appropriateness note
    - Formality consideration
    End with "---" when done.`;

    log.info("Sending prompt to Ollama:", prompt);
    
    try {
      let response;
      let attempts = 0;
      const maxAttempts = 3;

      //retry logic for incomplete responses
      while (attempts < maxAttempts) {
        const attemptStart = Date.now();
        response = (await generateWithLlama(prompt)).trim();
        const attemptDuration = Date.now() - attemptStart;
        
        log.info(`Attempt ${attempts + 1} took ${attemptDuration}ms`);
        
        if (isCompleteResponse(response)) break;
        attempts++;
        log.info(`Attempt ${attempts} - Incomplete response, retrying...`);
      }

      //log total generation time
      const totalTime = Date.now() - startTime;
      log.info(`Ollama generation completed in ${totalTime}ms`);

      //throws error if response still incomplete after retries
      if (!isCompleteResponse(response)) {
        throw new Error("Incomplete response after retries");
      }

      response = response.split("---")[0].trim();
      log.info("Ollama response:", response);

      //create suggestion object
      const suggestion = {
        name: `${event.type} Outfit with ${featuredItem.name}`,
        description: response
      };
      
      //update state with new suggestion
      setOutfitSuggestions([suggestion]);
      setOutfitSource("AI");
      setLastSelected(featuredItem);

    } catch (error) {
      console.error("Generation error:", error);
      //fallback suggestion when ollama AI fails
      const fallbackOutfit = {
        name: `${userProfile.gender === 'male' ? 'Men\'s' : 'Women\'s'} ${event.type} Outfit`,
        description: `A great look for ${event.type} events: Wear your ${featuredItem.name} with ${
          userProfile.gender === 'male' ? 'dark trousers and a blazer' : 'a skirt and cardigan'
        }. Suitable for ${weatherData.condition} weather at ${weatherData.temperature}°C.`
      };
      setOutfitSuggestions([fallbackOutfit]);
      setOutfitSource("Fallback");
    }
  }, [wardrobeItems, weatherData, userProfile.gender]);

  //function to confirm & save selected outfit
  const confirmOutfit = async (outfit) => {
    // early return if no user or event selected
    if (!auth.currentUser || !selectedEvent) return;

    //prevent duplicate submissions
    if (loadingOutfitId === outfit.name) return;
    
    setLoadingOutfitId(outfit.name);

    try {
      //saves outfit to Firestore
      const eventRef = doc(db, "users", auth.currentUser.uid, "events", selectedEvent.id);
      await setDoc(eventRef, { outfit }, { merge: true });
      Alert.alert('Outfit Planned', `You'll wear ${outfit.name} for ${selectedEvent.title}`);
      
      //schedule reminder notification
      setTimeout(() => {
        Alert.alert(
          "⚠️ Outfit Reminder ⚠️", 
          `Remember your planned outfit for ${selectedEvent.title}: ${outfit.name}`,
          [{ text: "OK" }]
        );
      }, 10000);
      
      //to reset selected event
      setSelectedEvent(null);
    } catch (error) {
      console.error("Error saving outfit: ", error);
      Alert.alert("Error", "Failed to save outfit");
    } finally {
      setLoadingOutfitId(null);
    }
  };

  //helper function to format dates for display
  const formatDateTime = (date) => {
    if (!date || !(date instanceof Date)) return '';
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  //this is main component render
  return (
    <View style={styles.container}>
      {/* header with title & add button */}
      <View style={styles.header}>
        <Text style={styles.title}>My Events</Text>
        <Pressable 
          style={styles.addButton}
          onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* events list */}
      <FlatList
        data={events.sort((a, b) => a.date - b.date)}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={50} color="#4A6D51" />
            <Text style={styles.emptyText}>No events planned yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDetails}>
              {formatDateTime(item.date)} • {item.type}
            </Text>
            {item.outfit ? (
              <Text style={styles.outfitText}>
                <FontAwesome name="check-square-o" size={16} color="#4A6D51" /> Planned: {item.outfit.name}</Text>
              ) : (
              <Pressable 
                style={styles.suggestButton}
                onPress={() => getOutfitSuggestions(item)}>
                <Text style={styles.buttonText}>Get Outfit Ideas</Text>
              </Pressable>
            )}
          </View>
        )}
      />

      {/* add event modal */}
      <Modal visible={showModal} animationType="slide">
        <ScrollView contentContainerStyle={styles.modalScrollContainer}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color="#4A6D51" />
              </Pressable>
              <Text style={styles.modalTitle}>New Event</Text>
              <View style={{ width: 24 }} />
            </View>

            {/* event title input */}
            <TextInput
              style={[styles.input, errors.title && styles.errorInput]}
              placeholder="Event name"
              placeholderTextColor="#828282"
              value={newEvent.title}
              onChangeText={text => setNewEvent({...newEvent, title: text})}
            />
            {errors.title && <Text style={styles.errorText}>Please enter a title</Text>}

            {/* date picker */}
            <Pressable 
              style={[styles.dateInput, errors.date && styles.errorInput]}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateInputText}>
                {newEvent.date.toLocaleDateString()}
              </Text>
              <Ionicons name="calendar" size={20} color="#4A6D51" />
            </Pressable>
            {errors.date && <Text style={styles.errorText}>Please select a future date</Text>}

            {/* time picker */}
            <Pressable 
              style={styles.dateInput}
              onPress={() => setShowTimePicker(true)}>
              <Text style={styles.dateInputText}>
                {newEvent.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Text>
              <Ionicons name="time" size={20} color="#4A6D51" />
            </Pressable>

            {/* event type selector */}
            <View style={styles.typeContainer}>
              {['casual', 'formal', 'business', 'party'].map(type => (
                <Pressable
                  key={type}
                  style={[
                    styles.typeButton,
                    newEvent.type === type && styles.selectedTypeButton
                  ]}
                  onPress={() => setNewEvent({...newEvent, type})}>
                  <Text style={newEvent.type === type ? styles.selectedTypeText : styles.typeText}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* submit button */}
            <Pressable 
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={addEvent}
              disabled={isLoading}>
              <Text style={styles.buttonText}>
                {isLoading ? 'Adding...' : 'Add Event'}
              </Text>
            </Pressable>

            {/* date picker component */}
            {showDatePicker && (
              <DateTimePicker
                value={newEvent.date}
                mode="date"
                display="inline"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setNewEvent({...newEvent, date});
                }}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            )}

            {/* time picker component */}
            {showTimePicker && (
              <View style={styles.timePickerContainer}>
                <DateTimePicker
                  value={newEvent.time}
                  mode="time"
                  onChange={(event, time) => {
                    setShowTimePicker(false);
                    if (time) setNewEvent({...newEvent, time});
                  }}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </Modal>

      {/* outfit suggestion modal */}
      {selectedEvent && (
        <Modal visible={!!selectedEvent} animationType="slide">
          <ScrollView contentContainerStyle={styles.modalScrollContainer}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Pressable onPress={() => setSelectedEvent(null)}>
                  <Ionicons name="close" size={24} color="#4A6D51" />
                </Pressable>
                <Text style={styles.modalTitle}>Outfit Ideas for {selectedEvent.title}</Text>
                <View style={{ width: 24 }} />
              </View>

              {/* weather display */}
              <View style={styles.weatherHeader}>
                <Ionicons name={getWeatherIcon(weatherData.condition)} size={24} color="#4A6D51" />
                <Text style={styles.weatherText}>
                  {weatherData.condition} • {weatherData.temperature}°C
                </Text>
              </View>

              {/* outfit suggestions list */}
              {Array.isArray(outfitSuggestions) && outfitSuggestions.length > 0 ? (
                outfitSuggestions.map((outfit, index) => (
                  <View key={index} style={styles.outfitCard}>
                    <Text style={styles.outfitName}>{outfit.name}</Text>
                    {/* indicate if suggestion is AI-generated or fallback */}
                    {outfitSource && (
                      <Text style={[
                        styles.outfitSource,
                        { color: outfitSource === "AI" ? "#4A6D51" : "#FF6B6B" }
                      ]}>
                        {outfitSource === "AI" 
                          ? "AI-generated suggestions" 
                          : "Showing fallback suggestions"}
                      </Text>
                    )}
                    
                    {/* outfit description */}
                    <Text style={styles.outfitDescription}>
                      {outfit.description}
                    </Text>
                    
                    {/* select outfit button */}
                    <View style={{ marginTop: 10 }}> 
                      <Pressable 
                        style={styles.selectButton}
                        onPress={() => confirmOutfit(outfit)} 
                        disabled={loadingOutfitId === outfit.name}>
                          <Text style={styles.selectButtonText}>
                            {loadingOutfitId === outfit.name ? 'Saving...' : 'Select This Outfit'}
                          </Text>
                      </Pressable>
                    </View>
                    {/* regenerate button with AI */}
                    <Pressable 
                      style={styles.regenerateButton}
                      onPress={regenerateSuggestions}
                      disabled={regenerating}>
                        {regenerating ? (
                          <ActivityIndicator color="#FFFFFF" />
                        ) : (
                          <Text style={styles.buttonText}>Generate with Ollama AI</Text>
                        )}
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Generating outfit suggestions...</Text>
              )}
            </View>
          </ScrollView>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6D51',
  },
  addButton: {
    backgroundColor: '#4A6D51',
    borderRadius: 20,
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#828282',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 4,
  },
  eventDetails: {
    fontSize: 14,
    color: '#828282',
    marginBottom: 8,
  },
  suggestButton: {
    backgroundColor: '#4A6D51',
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  outfitText: {
    color: '#4A6D51',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalScrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9F9F4',
    padding: 20,
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    color: '#FF6B6B',
    marginBottom: 12,
    fontSize: 12,
  },
  dateInput: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInputText: {
    color: '#4A6D51',
  },
  datePicker: {
    marginBottom: 20,
    backgroundColor: '#F9F9F4',
  },
  timePickerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    backgroundColor: '#E8E8E8',
    padding: 10,
    borderRadius: 8,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
  },
  selectedTypeButton: {
    backgroundColor: '#4A6D51',
  },
  typeText: {
    color: '#4A6D51',
  },
  selectedTypeText: {
    color: 'white',
  },
  submitButton: {
    backgroundColor: '#4A6D51',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  outfitCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 8,
  },
  outfitDescription: {
    color: '#4A6D51',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  selectButton: {
    backgroundColor: '#4A6D51',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  outfitSource: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  regenerateButton: {
    backgroundColor: '#4A6D51',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  weatherText: {
    marginLeft: 10,
    color: '#4A6D51',
    fontWeight: '600',
  },
  outfitDescription: {
    color: '#4A6D51',
    fontStyle: 'italic',
    marginBottom: 8,
    maxHeight: 200, 
    overflow: 'scroll', 
  },
});