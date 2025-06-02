// auth.js - Authentication services using Firebase
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  verifyBeforeUpdateEmail as firebaseVerifyBeforeUpdateEmail,
  GoogleAuthProvider
} from 'firebase/auth';
import { app } from '../firebaseConfig';

const auth = getAuth(app);

// Login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Sign up
export const signupUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Update email - UPDATED FUNCTION
export const updateEmail = async (newEmail) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    // used Firebase's verifyBeforeUpdateEmail method
    await firebaseVerifyBeforeUpdateEmail(user, newEmail);
    return true;
  } catch (error) {
    console.error('Email update error:', error);
    throw error;
  }
};

// Update password
export const updatePassword = async (currentPassword, newPassword) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }

  try {
    // Re-authenticate the user before updating the password
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(user, credential);
    
    // Update the password
    await firebaseUpdatePassword(user, newPassword);
    return true;
  } catch (error) {
    throw error;
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await auth.signOut();
    return true;
  } catch (error) {
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// for email user story: checks if email is verified
export const isEmailVerified = () => {
  const user = auth.currentUser;
  return user ? user.emailVerified : false;
};

// for email user story: checks if user is Google-authenticated
export const isGoogleProvider = (user) => {
  return user.providerData.some(
    provider => provider.providerId === GoogleAuthProvider.PROVIDER_ID
  );
};

// for email user story: get authentication provider
export const getAuthProvider = () => {
  const user = auth.currentUser;
  if (!user) return null;
  
  return user.providerData[0]?.providerId;
};

export { auth }; // Export auth instance for use elsewhere