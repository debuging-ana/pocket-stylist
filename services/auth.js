// auth.js - Authentication services using Firebase
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail
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

// Update email
export const updateEmail = async (newEmail) => {
  const user = auth.currentUser;
  
  if (!user) {
    throw new Error('No user is currently signed in');
  }
  
  try {
    await firebaseUpdateEmail(user, newEmail);
    return true;
  } catch (error) {
    // For operations that require recent authentication
    if (error.code === 'auth/requires-recent-login') {
      throw error; // Handle reauthentication in the component
    }
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

export { auth }; // Export auth instance for use elsewhere
