/*
Events Screen: main screen for managing events & ollama outfit suggestions
this screen allows users to:
- view their upcoming events in chronological list
- add new events with detailes like title, date/time & event type
- get ollama AI generated outfit suggestions tailored to
  -> event type (casual, formal, business, party)
  -> weather conditions at event time/location
  -> user's current wardrobe items
-save selected outfits to events
- regenerate ollama ai outfit suggestion

Key Features:
- real-time data synchronization with firestore
- location-based weather integration (With aut as fallback)
- fallback suggestions if ollama AI fails
- form validation & error handling
- performance tracking & logging
*/

import { View, Text, FlatList, Pressable, Modal, TextInput, Alert, ScrollView, ActivityIndicator, Linking, StyleSheet, StatusBar } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
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
  //state for managing the events list
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
  const [weatherCache, setWeatherCache] = useState({});

  const isWeatherDataStale = (timestamp) => {
    const ONE_HOUR = 60 * 60 * 1000; //1 hour in milliseconds
      return !timestamp || (Date.now() - timestamp) > ONE_HOUR;
  };
  
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

    /**
     Main Data Fetching Effect
    
     Sets up real-time listeners for:
     1. user's wardrobe items
     2. user's events
     3. user profile data
     
     Handles:
     - permission errors 
     - data normalization
     - deduplication of records
    
     Cleanup function unsubscribes all listeners when component unmounts
     or when user ID changes to prevent memory leaks
   */
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

    //events listener with error handling, query sorting
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

  /**
     Add New Event Handler
   
     Handles form submission by:
     1. validating input
     2. combining date and time into single timestamp
     3. creating atomic Firestore batch write
     4. resetting form on success
   
     Includes:
     - loading state management
     - error handling with user feedback
     - firestore timestamp conversion
   */
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

    /**
   * Regenerate Outfit Suggestions
   * 
   * triggers new outfit generation for currently selected event
   * handles loading state during regeneration
   */
  const regenerateSuggestions = async () => {
    if (!selectedEvent) return;
    setRegenerating(true);
    await getOutfitSuggestions(selectedEvent);
    setRegenerating(false);
  };

    /**
     Get Outfit Suggestions
     
     Primary outfit generation function that:
     1. gets user location (with fallback)
     2. fetches weather data for event time/location
     3. selects a random wardrobe item as focus
     4. generates AI suggestions via Ollama
     5. falls back to basic suggestions if AI fails
     
     Features:
     - retry logic for incomplete AI responses
     - performance tracking
     - personalized prompts based on user data
     - weather-aware recommendations
     
     this was modified to use the weather data directly from the fetch/cache instead of just relying on state
   */
    const getOutfitSuggestions = useCallback(async (event) => {
      setSelectedEvent(event); //saves the selected event in state
      setOutfitSuggestions([]);
      setOutfitSource(null);
      
      if (!wardrobeItems.length) {
        console.log("No wardrobe items available");
        return;
      }
      //starts timing the suggesttion process (for performance insight)
      const startTime = Date.now();
      log.info("Starting Ollama generation...");
      
      let location;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Permission Required',
            'Enable location access for weather-based suggestions',
            [
              { text: 'Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel' }
            ]
          );
          throw new Error('Permission denied');
        } //get the user's current location with high accuracy
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
      } catch (error) { //if location access, fails fallback to default location
        console.log("Location error:", error);
        location = {
          coords: {
            latitude: -36.8536,
            longitude: 174.7665
          }
        };
      }
      
      //get weather data first!
      let currentWeatherData;
      try {
        if (weatherCache[event.id] && !isWeatherDataStale(weatherCache[event.id].timestamp)) {
          currentWeatherData = weatherCache[event.id].data;
        } else {
          const weather = await getWeather(location.coords.latitude, location.coords.longitude, event.date);
          currentWeatherData = {
            condition: weather.condition.toLowerCase(),
            temperature: Math.round(weather.temperature)
          };
          //update cache & state
          setWeatherCache(prev => ({
            ...prev,
            [event.id]: {
              data: currentWeatherData,
              timestamp: Date.now()
            }
          }));
          setWeatherData(currentWeatherData); //update state for UI
        }
      } catch (error) {
        console.log("Weather error:", error);
        if (weatherCache[event.id]?.data) { currentWeatherData = weatherCache[event.id].data;   
        } else {
          currentWeatherData = {
            condition: 'moderate',
            temperature: 20
          };
        }
        setWeatherData(currentWeatherData); //update state for UI
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

    //construct prompt for ollama AI & changed to match the displayed weather 
    const prompt = `Suggest a complete outfit for a ${userProfile.gender} attending a ${event.type} event in ${currentWeatherData.condition} weather (${currentWeatherData.temperature}°C). 
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        {/* Header Section with improved design */}
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="calendar-heart" size={40} color="#4A6D51" />
            </View>
            <Text style={styles.headerTitle}>My Events</Text>
            <Text style={styles.headerSubtitle}>
              Plan your outfits for upcoming events
            </Text>
          </View>
        </View>

        {/* Add Event Button */}
        <View style={styles.addButtonContainer}>
          <Pressable 
            style={styles.addButton}
            onPress={() => setShowModal(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
            <Text style={styles.addButtonText}>Add New Event</Text>
          </Pressable>
        </View>

        {/* events list */}
        <FlatList
          data={events.sort((a, b) => a.date - b.date)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="calendar-outline" size={60} color="#4A6D51" />
              </View>
              <Text style={styles.emptyTitle}>No Events Yet</Text>
              <Text style={styles.emptyText}>Add your first event to get started with outfit planning</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <View style={styles.eventHeader}>
                <View style={styles.eventTypeIcon}>
                  <MaterialCommunityIcons 
                    name={
                      item.type === 'formal' ? 'tie' :
                      item.type === 'business' ? 'briefcase' :
                      item.type === 'party' ? 'party-popper' :
                      'account-casual'
                    } 
                    size={24} 
                    color="#4A6D51" 
                  />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{item.title}</Text>
                  <Text style={styles.eventDetails}>
                    {formatDateTime(item.date)} • {item.type}
                  </Text>
                </View>
              </View>
              
              {item.outfit ? (
                <View style={styles.outfitSelectedContainer}>
                  <MaterialCommunityIcons name="check-circle" size={16} color="#4A6D51" />
                  <Text style={styles.outfitText}>Outfit planned: {item.outfit.name}</Text>
                </View>
              ) : (
                <Pressable 
                  style={styles.suggestButton}
                  onPress={() => getOutfitSuggestions(item)}>
                  <MaterialCommunityIcons name="magic-staff" size={16} color="#4A6D51" />
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
               <View style={styles.formContent}>
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
                   <Text style={styles.submitButtonText}>
                     {isLoading ? 'Adding...' : 'Add Event'}
                   </Text>
                 </Pressable>
               </View>

               {/* date picker component */}
               {showDatePicker && (
                 <View style={styles.datePickerContainer}>
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
                     themeVariant="light"
                   />
                 </View>
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
                     themeVariant="light"
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
                      <ScrollView style={styles.outfitDescriptionContainer}
                      nestedScrollEnabled={true}
                      >
                      <Text style={styles.outfitDescription}>
                        {outfit.description}
                      </Text>
                      </ScrollView>

                      
                      {/* select outfit button */}
                      <View style={{ marginTop: 10 }}> 
                        <Pressable 
                          style={styles.selectButton}
                          onPress={() => confirmOutfit(outfit)} 
                          disabled={loadingOutfitId === outfit.name}>
                            <Text style={styles.selectButtonText}>
                              {loadingOutfitId === outfit.name ? 'Saving...' : 'Select This Outfit Suggestion'}
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
                            <Text style={styles.regenerateButtonText}>Generate with Ollama AI</Text>
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
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F4',
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#F9F9F4',
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBE9D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#828282',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 5,
  },
  addButtonContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A6D51',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#DBE9D1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4A6D51',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#828282',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  eventCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTypeIcon: {
    marginRight: 10,
  },
  eventInfo: {
    flexDirection: 'column',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51', 
    borderWidth: 1,  
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginTop: 12,
  },
  buttonText: {
    color: '#4A6D51',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  outfitSelectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  outfitText: {
    color: '#4A6D51',
    marginLeft: 8,
    fontStyle: 'italic',
  },
  modalScrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    minHeight: '100%',
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
  formContent: {
    marginTop: 25,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A6D51',
    marginTop: 5,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
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
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateInputText: {
    color: '#4A6D51',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePicker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: '100%',
  },
  timePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginVertical: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  typeButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedTypeButton: {
    backgroundColor: '#DBE9D1',
    borderColor: '#4A6D51', 
    borderWidth: 2,  
  },
  typeText: {
    color: '#4A6D51',
  },
  selectedTypeText: {
    color: '#4A6D51',
  },
  submitButton: {
    backgroundColor: '#4A6D51',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 10,
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
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
  outfitDescriptionContainer: {
  maxHeight: 200, //fixed height for consistent sizing
  marginBottom: 8,
  borderWidth: 1,
  borderColor: '#E8E8E8',
  borderRadius: 8,
  padding: 10,
  },
  outfitDescription: {
  color: '#4A6D51',
  fontStyle: 'italic',
  flexShrink: 1, //allows text to wrap properly
  },
  selectButton: {
    backgroundColor: '#CADBC1',
    borderColor: '#4A6D51', 
    borderWidth: 1,  
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#4A6D51',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#CADBC1',
  },
  outfitSource: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  regenerateButton: {
    backgroundColor: '#4A6D51',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  weatherText: {
    marginLeft: 10,
    color: '#4A6D51',
    fontWeight: '600',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  regenerateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});