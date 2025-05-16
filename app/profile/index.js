/*
Profile Screen - Displays & allows editing of user info
*/
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
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
  const [isLoggedIn] = useState(true);

  const requestPhotoPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission required',
        'Please allow access to your photo library to select a profile picture',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  useEffect(() => {
    // request photo permissions 
    (async () => {
      await requestPhotoPermission();
    })();

    // set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // user is logged in → load their profile
        loadProfileData();
      } else {
        // user logged out → clear all profile data
        setProfile({
          firstName: '',
          lastName: '',
          bio: '',
          gender: '',
          bodyType: '',
          lifestyle: '',
          email: ''
        });
        setProfilePhotoUri(null);
      }
    });

    // cleanup function (unsubscribe on unmount)
    return () => {
      unsubscribe();
    };
  }, []); // empty dependency array = runs only once on mount

  // load saved profile data from Firestore
  const loadProfileData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        // clear profile if new user logged in
        setProfile({
          firstName: '',
          lastName: '',
          bio: '',
          gender: '',
          bodyType: '',
          lifestyle: ''
        });
        setProfilePhotoUri(null);
        return;
      }

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          bio: data.bio || '',
          gender: data.gender || '',
          bodyType: data.bodyType || '',
          lifestyle: data.lifestyle || '',
          email: user.email || ''
        });
        setProfilePhotoUri(data.profilePhotoUri || null);
      } else {
        // new user - reset to empty profile
        setProfile({
          firstName: '',
          lastName: '',
          bio: '',
          gender: '',
          bodyType: '',
          lifestyle: '',
          email: user.email || ''
        });
        setProfilePhotoUri(null);
      }
    } catch (error) {
      console.log('Error loading profile:', error);
    }
  };

  // save profile data to Firestore
  const saveProfileData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return false;
      
      const profileToSave = {
        ...profile,
        profilePhotoUri: profilePhotoUri || null,
        uid: user.uid,
        email: user.email
      };

      await setDoc(doc(db, "users", user.uid), profileToSave);
      return true;
    } catch (error) {
      console.log('Error saving profile:', error);
      return false;
    }
  };
  
  // handle selecting a photo
  const handleSelectPhoto = async () => {
    try {
      // Check if we have permission
      const hasPermission = await requestPhotoPermission();
      if (!hasPermission) return;

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'Images', // updated from deprecated Media TypeOptions (warnings)
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7
      });

      if (pickerResult.canceled) return;

      if (pickerResult.assets?.length > 0) {
        const selectedImage = pickerResult.assets[0];
        
        // file type validation
        const validExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = selectedImage.uri.split('.').pop().toLowerCase();
        
        if (!validExtensions.includes(`.${fileExtension}`)) {
          Alert.alert('Invalid File', 'Please select a JPG, PNG, or GIF image.');
          return;
        }
        setProfilePhotoUri(selectedImage.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not grab your photo. Please try again');
      console.error('Image picker error:', error);
    }
  };

  // email validation
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // handle saving the profile with validation
  const handleSaveProfile = async () => {
    if (!profile.firstName.trim()) {
      Alert.alert('Missing Information', 'Please enter your first name');
      return;
    }

    // validate email format if provided
    if (profile.email && !isValidEmail(profile.email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address!');
      return;
    }

    const saveSuccess = await saveProfileData();
    
    if (saveSuccess) {
      setIsEditing(false);
      Alert.alert('Success', 'Your profile has been saved!');
    } else {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    }
  };

  // show login message if not logged in
  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.loginMessage}>Please log in to view your profile!</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>User Details     ──── ★</Text>
              <View style={styles.nameRow}>
                {/* First Name */}
                <View style={styles.firstNameField}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.inputField}
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
                      profile.lastName ? { fontWeight: 'normal' } : { fontWeight: 'normal', backgroundColor: '#E8F0E2' }
                    ]}
                    placeholder="last name.."
                    placeholderTextColor="#828282" 
                    value={profile.lastName}
                    onChangeText={(text) => setProfile({...profile, lastName: text})}
                    editable={isEditing}
                  />
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.emailFieldWrapper}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="your.email@example.com"
                  placeholderTextColor="#828282" 
                  value={profile.email}
                  onChangeText={(text) => setProfile({...profile, email: text})}
                  editable={isEditing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Bio Field */}
              <View style={styles.bioFieldWrapper}>
                <Text style={styles.inputLabel}>Bio</Text>
                <TextInput
                  style={[
                    styles.inputField,
                    styles.bioField,
                    profile.bio ? { fontWeight: 'normal' } : { fontWeight: 'normal', backgroundColor: '#E8F0E2' }
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
            </View>

              <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Personal       ───── ★</Text>
              
              {/* Gender Dropdown */}
              <View style={styles.dropdownWrapper}>
                <Text style={styles.dropdownLabel}>Gender</Text>
                <DropDownPicker
                  listMode="MODAL"
                  open={genderOpen}
                  value={profile.gender}
                  items={genderItems}
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

              {/* Body Type Dropdown */}
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
              
              {/* Lifestyle Dropdown */}
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
            </View>
              
              {/* Save/Edit Button */}
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
  },
  headerContainer: {
    height: 250,
    backgroundColor: '#E8F0E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    marginTop: -20,
    marginBottom: -4,
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
    backgroundColor: '#E8F0E2',
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
    marginBottom: 10,
  },
  firstNameField: {
    width: '48%', 
    marginTop: 5, 
    marginRight: 10, 
  },
  lastNameField: {
    width: '48%', 
    marginTop: 5, 
  },
  bioFieldWrapper: {
    width: '100%',  
    marginTop: 10,  
    marginBottom: 10,  
  },
  inputField: {
    height: 45,
    backgroundColor: '#E8F0E2',
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
    fontSize: 25,
    fontWeight: '600',
    color: '#666666',
    marginTop: 20,
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
    backgroundColor: '#E8F0E2',
    minHeight: 45,
  },
  dropdownDisabled: {
    backgroundColor: '#E8F0E2',
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
    backgroundColor: '#E8F0E2',
  },
  saveButton: {
    backgroundColor: '#AFC6A3',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  editButton: {
    backgroundColor: '#828282',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default ProfileScreen;