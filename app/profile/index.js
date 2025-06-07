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
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import MaterialCommunityIcons
import { scaleSize, scaleWidth, scaleHeight, scaleFontSize, scaleSpacing, deviceWidth } from '../../utils/responsive';

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
    {label: 'Pear Shape', value: 'Pear Shape'},
    {label: 'Inverted Triangle', value: 'Inverted Triangle'}
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

  // handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
    loadProfileData(); // Reload original data from database
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
                  <MaterialCommunityIcons name="image-edit-outline" size={80} color="#4A6D51" />
                  <Text style={styles.placeholderText}>
                    {isEditing ? 'Tap to add photo' : 'Add a photo'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.contentContainer}>
            <View style={styles.formContainer}>
              <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>User Details</Text>
              <View style={styles.nameRow}>
                {/* First Name */}
                <View style={styles.firstNameField}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="first name.."
                    placeholderTextColor="#A0A0A0" 
                    value={profile.firstName}
                    onChangeText={(text) => setProfile({ ...profile, firstName: text })}
                    editable={isEditing}
                  />
                </View>
                
                {/* Last Name */}
                <View style={styles.lastNameField}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.inputField}
                    placeholder="last name.."
                    placeholderTextColor="#A0A0A0" 
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
                  placeholderTextColor="#A0A0A0" 
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
                  ]}
                  placeholder="what should we know about you?"
                  placeholderTextColor="#A0A0A0" 
                  value={profile.bio}
                  onChangeText={(text) => setProfile({...profile, bio: text})}
                  editable={isEditing}
                  multiline
                  numberOfLines={4}
                />
              </View> 
            </View>

              <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Personal</Text>
              
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
                dropDownContainerStyle={styles.dropdownOpenContainer}
                listItemLabelStyle={[styles.dropdownItemText,{ color: 'white'}]}
                listItemContainerStyle={[styles.dropdownItemContainer,{ backgroundColor: '#AFC6A3' }]}
                modalProps={{animationType: 'slide'}}
                modalTitle="Select Gender"
                modalTitleStyle={styles.dropdownModalTitle}
                modalContentContainerStyle={styles.dropdownModalContainer}
                ArrowDownIconComponent={() => (
                <MaterialIcons name="keyboard-arrow-down" size={24} color="#4A6D51" />)}
                ArrowUpIconComponent={() => (
                <MaterialIcons name="keyboard-arrow-up" size={24} color="#4A6D51" />)}
                CloseIconComponent={() => (
                <MaterialIcons name="close" size={24} color="#4A6D51" />)}
                modalTitleContainerStyle={styles.modalTitleContainer}
                modalHeaderContainerStyle={styles.modalHeaderContainer}
                zIndex={3000}
                itemSeparator={true}
                itemSeparatorStyle={{ backgroundColor: '#E0E0E0' }}
                activeItemContainerStyle={{backgroundColor: '#C7D9BD'}}
                activeItemLabelStyle={{
                  color: 'white', 
                  fontWeight: 'bold',}}
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
                  dropDownContainerStyle={[styles.dropdownContainer, bodyTypeOpen && styles.dropdownOpenContainer]}
                  listItemLabelStyle={[styles.dropdownItemText, { color: 'white' }]}
                  listItemContainerStyle={[styles.dropdownItemContainer, { backgroundColor: '#AFC6A3' }]}
                  modalProps={{animationType: 'slide'}}
                  modalTitle="Select Body Type"
                  modalTitleStyle={styles.dropdownModalTitle}
                  modalContentContainerStyle={styles.dropdownModalContainer}
                  ArrowDownIconComponent={() => (
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#4A6D51" />)}
                  ArrowUpIconComponent={() => (
                  <MaterialIcons name="keyboard-arrow-up" size={24} color="#4A6D51" />)}
                  CloseIconComponent={() => (
                  <MaterialIcons name="close" size={24} color="#4A6D51" />)}
                  modalTitleContainerStyle={styles.modalTitleContainer}
                  modalHeaderContainerStyle={styles.modalHeaderContainer}
                  zIndex={2000}
                  itemSeparator={true}
                  itemSeparatorStyle={{ backgroundColor: '#E0E0E0' }}
                  activeItemContainerStyle={{backgroundColor: '#C7D9BD'}}
                  activeItemLabelStyle={{
                    color: 'white',
                    fontWeight: 'bold',}}
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
                  dropDownContainerStyle={[styles.dropdownContainer, lifestyleOpen && styles.dropdownOpenContainer]}
                  listItemLabelStyle={[styles.dropdownItemText,{ color: 'white' }]}
                  listItemContainerStyle={[styles.dropdownItemContainer, { backgroundColor: '#AFC6A3' }]}
                  modalProps={{animationType: 'slide',}}
                  modalTitle="Select Lifestyle"
                  modalTitleStyle={styles.dropdownModalTitle}
                  modalContentContainerStyle={styles.dropdownModalContainer}
                  ArrowDownIconComponent={() => (
                  <MaterialIcons name="keyboard-arrow-down" size={24} color="#4A6D51" />)}
                  ArrowUpIconComponent={() => (
                  <MaterialIcons name="keyboard-arrow-up" size={24} color="#4A6D51" />)}
                  CloseIconComponent={() => (
                  <MaterialIcons name="close" size={24} color="#4A6D51" />)}
                  modalTitleContainerStyle={styles.modalTitleContainer}
                  modalHeaderContainerStyle={styles.modalHeaderContainer}
                  zIndex={1000}
                  itemSeparator={true}
                  itemSeparatorStyle={{ backgroundColor: '#E0E0E0' }}
                  activeItemContainerStyle={{backgroundColor: '#C7D9BD'}}
                  activeItemLabelStyle={{
                    color: 'white',
                    fontWeight: 'bold',
                    }}
                  />
                </View>
              )}
            </View>
              
              {/* Action Buttons */}
              {isEditing ? (
                <>
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={handleSaveProfile}
                  >
                    <Text style={styles.buttonText}>Save Profile</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.cancelButton}
                    onPress={handleCancelEdit}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => setIsEditing(true)}
                >
                  <View style={styles.editButtonContent}>
                    <MaterialIcons name="edit" size={20} color="white" />
                    <Text style={styles.buttonText}>Edit Profile</Text>
                  </View>
                </TouchableOpacity>
              )}
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
    backgroundColor: '#F9F9F4',
  },
  headerContainer: {
    height: scaleHeight(220), // Reduced from 250
    backgroundColor: '#F9F9F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoContainer: {
    marginTop: scaleSpacing(-20),
    marginBottom: scaleSpacing(-30), // Reduced space under profile picture
  },
  profileImage: {
    width: scaleSize(180),
    height: scaleSize(180),
    borderRadius: scaleSize(90),
    borderWidth: 3,
    borderColor: 'white',
  },
  photoPlaceholder: {
    width: scaleSize(180),
    height: scaleSize(180),
    borderRadius: scaleSize(90),
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  placeholderText: {
    color: '#4A6D51',
    fontSize: scaleFontSize(14),
    textAlign: 'center',
    marginTop: scaleSpacing(10),
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9F9F4',
    paddingTop: scaleSpacing(10),
    paddingBottom: scaleSpacing(20), // Reduced padding at bottom
  },
  formContainer: {
    paddingHorizontal: scaleSpacing(25),
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleSpacing(10),
  },
  firstNameField: {
    width: '48%', 
    marginTop: scaleSpacing(5), 
    marginRight: scaleSpacing(10), 
  },
  lastNameField: {
    width: '48%', 
    marginTop: scaleSpacing(5), 
  },
  bioFieldWrapper: {
    width: '100%',  
    marginTop: scaleSpacing(10),  
    marginBottom: scaleSpacing(10),  
  },
  inputField: {
    height: scaleHeight(45),
    backgroundColor: '#F9F9F4',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: scaleSize(15),
    paddingHorizontal: scaleSpacing(15),
    fontSize: scaleFontSize(16),
    color: '#666666',
    fontWeight: 'normal',
    marginBottom: scaleSpacing(10),
  },
  inputLabel: {
    fontSize: scaleFontSize(14),
    color: '#4A6D51',
    fontWeight: '500',
    marginBottom: scaleSpacing(8),
  },  
  bioField: {
    height: scaleHeight(100),
    textAlignVertical: 'top',
    paddingTop: scaleSpacing(15),
  },
  sectionTitle: {
    fontSize: scaleFontSize(22),
    fontWeight: '600',
    color: '#4A6D51',
    marginTop: scaleSpacing(5),
    marginVertical: scaleSpacing(15),
  },
  dropdownWrapper: {
    marginBottom: scaleSpacing(15),
    zIndex: 1,
  },
  dropdownLabel: {
    fontSize: scaleFontSize(14),
    color: '#4A6D51',
    marginBottom: scaleSpacing(8),
    fontWeight: '500',
  },
  dropdown: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F4',
    minHeight: scaleHeight(45),
    borderRadius: scaleSize(15),
    paddingHorizontal: scaleSpacing(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dropdownDisabled: {
    backgroundColor: '#F9F9F4',
    opacity: 0.8,
  },
  dropdownText: {
    fontSize: scaleFontSize(16),
    color: '#4A6D51',
    fontWeight: '500',
  },
  dropdownItemText: {
    color: '#4A6D51',
    fontWeight: '400', 
    fontSize: scaleFontSize(16),
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    backgroundColor: 'white',
    borderRadius: scaleSize(15),
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  dropdownItemContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
    paddingVertical: scaleSpacing(10),
  },
  dropdownModalContainer: {
    backgroundColor: 'white', 
    paddingHorizontal: scaleSpacing(20),
    paddingTop: scaleSpacing(10),
    paddingBottom: scaleSpacing(20),
  },
  dropdownModalTitle: {
    fontSize: scaleFontSize(18),
    fontWeight: 'bold', 
    color: '#4A6D51',
    marginLeft: scaleSpacing(130),
  },
  dropdownOpenContainer: {
    backgroundColor: 'white', 
  },
  modalHeaderContainer: {
    backgroundColor: '#AFC6A3',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: scaleSpacing(15),
    paddingVertical: scaleSpacing(10),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center', 
    position: 'absolute', 
    left: 0,
    right: 0,
  },
  saveButton: {
    backgroundColor: '#4A6D51',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    marginTop: scaleSpacing(10),
    marginBottom: scaleSpacing(10), // Reduced from 15
    elevation: 3,
    shadowColor: '#4A6D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  editButton: {
    backgroundColor: '#4A6D51',
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    marginTop: scaleSpacing(10),
    marginBottom: 0,
    elevation: 3,
    shadowColor: '#4A6D51',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  editButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderRadius: scaleSize(15),
    padding: scaleSpacing(15),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A6D51',
    marginBottom: 0, // Reduced from 10
  },
  buttonText: {
    color: 'white',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
    marginLeft: scaleSpacing(8), // Add space between icon and text
  },
  cancelButtonText: {
    color: '#4A6D51',
    fontSize: scaleFontSize(16),
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: scaleSize(20),
    padding: scaleSpacing(20),
    marginBottom: scaleSpacing(20), // Reduced from 25
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