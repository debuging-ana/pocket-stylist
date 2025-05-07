/*
Profile Screen - Displays & allows editing of user info
*/

/*
wat i need to work on:
- No Firebase integration yet (both for fetching and saving user profile)
- No async error or loading state handling (in case data operations fail or take time)
- Profile data not persisted — currently it only updates local state and shows an alert
*/

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DropDownPicker from 'react-native-dropdown-picker';

// this screen lets our users view & update their profile info, including personal details and photo.
const ProfileScreen = () => {  
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    gender: '',
    bodyType: '',
    lifestyle: ''
  });
  
  // Dropdown states
  const [genderOpen, setGenderOpen] = useState(false);
  const [genderItems, setGenderItems] = useState([
    {label: 'Female', value: 'Female'},
    {label: 'Male', value: 'Male'},
    {label: 'Prefer not to say', value: 'Prefer not to say'}
  ]);

  const [bodyTypeOpen, setBodyTypeOpen] = useState(false);
  const [bodyTypeItems, setBodyTypeItems] = useState([
    {label: 'Triangle', value: 'Triangle'},
    {label: 'Rectangle', value: 'Rectangle'},
    {label: 'Hour Glass', value: 'Hour Glass'},
    {label: 'Ectomorph', value: 'Ectomorph'},
    {label: 'Mesomorph', value: 'Mesomorph'},
    {label: 'Endomorph', value: 'Endomorph'}
  ]);

  const [lifestyleOpen, setLifestyleOpen] = useState(false);
  const [lifestyleItems, setLifestyleItems] = useState([
    {label: 'Professional', value: 'Professional'},
    {label: 'Student', value: 'Student'},
    {label: 'Parent', value: 'Parent'},
    {label: 'Athlete', value: 'Athlete'},
    {label: 'Creative', value: 'Creative'},
    {label: 'Freelancer', value: 'Freelancer'},
    {label: 'Traveler', value: 'Traveler'},
    {label: 'Retired', value: 'Retired'},
    {label: 'Other', value: 'Other'}
  ]);
  
  const [profilePhotoUri, setProfilePhotoUri] = useState(null);
  const [isEditing, setIsEditing] = useState(false); 

  useEffect(() => {
    (async () => {
      // asks our users for permission to access their photo library
      // this is required for ios and android to open the gallery/photos
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Photo Access Required', 
          'To set a profile picture, please enable photo access in your device settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => ImagePicker.openSettingsAsync() }
          ]
        );
      }
    })();
  }, []);

  const handleSelectPhoto = async () => {
    try {
      // launch the device's gallery so our users can choose a profile pic
      // do nothing if the user cancels
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7
      });

      if (pickerResult.canceled) return;

      if (pickerResult.assets?.length > 0) {
        setProfilePhotoUri(pickerResult.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Photo Error', 'Couldn’t grab your photo — maybe check your photos/gallery settings?');
      console.error('Image picker error:', error);
    }
  };

  const handleSaveProfile = () => {
    if (!profile.firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name so we know what to call you!');
      return;
    }

    setIsEditing(false);
    Alert.alert('Profile Saved', 'Your changes have been saved!');
  };

  return (
    // helps move the screen content up when the keyboard appears, 
    // especially on iOS where it might otherwise hide input fields & scrollview was throwing errors 'VirtualizedLists'
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      // iOS uses 'padding' to avoid the keyboard, while Android prefers 'height' — different behaviors per platform
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      // on iOS we offset more to ensure inputs are visible above the keyboard
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              onPress={isEditing ? handleSelectPhoto : null}
              style={styles.photoContainer}
            >
              {profilePhotoUri ? (
                <Image 
                  source={{ uri: profilePhotoUri }} 
                  style={styles.profileImage} 
                  accessibilityLabel="Profile photo"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.placeholderText}>
                    {isEditing ? 'Tap to add photo' : 'No photo selected'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
            <View style={styles.nameRow}>

              {/* First Name */}
              <View style={styles.firstNameField}>
              <Text style={styles.inputLabel}>First Name</Text>
                <TextInput
                  style={[
                    styles.inputField,
                    profile.firstName ? { fontWeight: 'bold' } : { fontWeight: 'normal', color: '#828282' }
                  ]}
                  placeholder="first name.."
                  placeholderTextColor="#828282" 
                  value={profile.firstName}
                  onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                  editable={isEditing}
                />
              </View>
              
              {/* Last Name */}
              <View style={styles.lastNameField}>
                <Text style={styles.inputLabel}>Last Name</Text>
                <TextInput
                  style={[
                    styles.inputField,
                    profile.lastName ? { fontWeight: 'bold' } : { fontWeight: 'normal' }
                  ]}
                  placeholder="last name.."
                  placeholderTextColor="#828282" 
                  value={profile.lastName}
                  onChangeText={(text) => setProfile({...profile, lastName: text})}
                  editable={isEditing}
                />
              </View>
            </View>

            {/* Bio Field */}
            <View style={styles.bioFieldWrapper}>
            <Text style={styles.inputLabel}>Bio</Text>
              <TextInput
                style={[
                  styles.inputField,
                  styles.bioField,
                  profile.bio ? { fontWeight: 'bold' } : { fontWeight: 'normal' }
                ]}
                placeholder="what should we know about you?"
                placeholderTextColor="#828282" 
                value={profile.bio}
                onChangeText={(text) => setProfile({...profile, bio: text})}
                editable={isEditing}
                multiline
                numberOfLines={4}
              />
            </View> 

              <Text style={styles.sectionTitle}>Personal</Text>
              
              {/* Gender Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Text style={styles.dropdownLabel}>Gender</Text>
                  <DropDownPicker
                    listMode="MODAL"
                    open={genderOpen}
                    value={profile.gender}
                    items={genderItems}
                    // only allows 1 dropdown (gender, body type, lifestyle) to open at a time — helps avoid UI overlap
                    setOpen={(open) => {
                      setGenderOpen(open);
                      if (open) {
                        setBodyTypeOpen(false);
                        setLifestyleOpen(false);
                      }
                    }}
                    setValue={(value) => setProfile({...profile, gender: value()})}
                    setItems={setGenderItems}
                    disabled={!isEditing}
                    placeholder="Select Gender"
                    style={[styles.dropdown, !isEditing && styles.dropdownDisabled]}
                    textStyle={styles.dropdownText}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listItemLabelStyle={styles.dropdownItemText}
                    listItemContainerStyle={{ backgroundColor: '#E8F0E2' }}
                    zIndex={3000}
                  />
              </View>

              {/* Body Type Dropdown - Hidden when Gender dropdown is open */}
              {!genderOpen && (
                <View style={styles.dropdownWrapper}>
                  <Text style={styles.dropdownLabel}>Body Type</Text>
                    <DropDownPicker
                    listMode="MODAL"
                    open={bodyTypeOpen}
                    value={profile.bodyType}
                    items={bodyTypeItems}
                    setOpen={(open) => {
                      setBodyTypeOpen(open);
                      if (open) {
                        setGenderOpen(false);
                        setLifestyleOpen(false);
                      }
                    }}
                    setValue={(value) => setProfile({...profile, bodyType: value()})}
                    setItems={setBodyTypeItems}
                    disabled={!isEditing}
                    placeholder="Select Body Type"
                    style={[styles.dropdown, !isEditing && styles.dropdownDisabled]}
                    textStyle={styles.dropdownText}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listItemLabelStyle={styles.dropdownItemText}
                    listItemContainerStyle={{ backgroundColor: '#E8F0E2' }}
                    zIndex={2000}
                  />
                </View>
              )}
              
              {/* Lifestyle Dropdown - Hidden when Gender dropdown is open */}
              {!genderOpen && (
                <View style={styles.dropdownWrapper}>
                  <Text style={styles.dropdownLabel}>LifeStyle Information</Text>
                    <DropDownPicker
                      listMode="MODAL"
                      open={lifestyleOpen}
                      value={profile.lifestyle}
                      items={lifestyleItems}
                      setOpen={(open) => {
                        setLifestyleOpen(open);
                        if (open) {
                          setGenderOpen(false);
                          setBodyTypeOpen(false);
                        }
                      }}
                    setValue={(value) => setProfile({...profile, lifestyle: value()})}
                    setItems={setLifestyleItems}
                    disabled={!isEditing}
                    placeholder="Select Lifestyle"
                    style={[styles.dropdown, !isEditing && styles.dropdownDisabled]}
                    textStyle={styles.dropdownText}
                    dropDownContainerStyle={styles.dropdownContainer}
                    listItemLabelStyle={styles.dropdownItemText}
                    listItemContainerStyle={{ backgroundColor: '#E8F0E2' }}
                    zIndex={1000}
                  />
                </View>
              )}
              
              {/* If the user is editing their profile, enable all input fields & show the 'save' button */}
              {/* otherwise keep everything read-only and show an 'edit' button */}
              <TouchableOpacity 
                style={isEditing ? styles.saveButton : styles.editButton}
                onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              >
                <Text style={styles.buttonText}>
                  {isEditing ? 'Save' : 'Edit Profile'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0E2',
  },
  headerContainer: {
    height: 250,
    backgroundColor: '#E8F0E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    marginTop: -30,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: 'white',
  },
  photoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  placeholderText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 10,
    paddingBottom: 40,
    marginTop: -30,
  },
  formContainer: {
    paddingHorizontal: 25,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  firstNameField: {
    width: '48%', 
    marginTop: 30, 
    marginRight: 10, 
  },
  
  lastNameField: {
    width: '48%', 
    marginTop: 30, 
  },
  bioFieldWrapper: {
    width: '100%',  
    marginTop: 10,  
    marginBottom: 10,  
  },
  inputField: {
    height: 45,
    borderColor: '#AFC6A3',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#666666',
    fontWeight: 'normal',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
    marginBottom: 5,
  },  
  bioField: {
    height: 100,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666666',
    marginTop: 30,
    marginVertical: 20,
  },
  dropdownWrapper: {
    marginBottom: 15,
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  dropdown: {
    borderColor: '#AFC6A3',
    backgroundColor: '#f9f9f9',
    minHeight: 45,
  },
  dropdownDisabled: {
    backgroundColor: '#f9f9f9',
  },
  dropdownText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'normal',
  },
  dropdownItemText: {
    color: '#666666',
    fontWeight: 'normal', 
    fontSize: 16,
  },
  dropdownContainer: {
    borderColor: '#AFC6A3',
    backgroundColor: '#f9f9f9',
  },
  saveButton: {
    backgroundColor: '#AFC6A3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  editButton: {
    backgroundColor: '#828282',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;