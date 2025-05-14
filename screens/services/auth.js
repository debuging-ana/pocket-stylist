// Firebase authentication logic (login/signup/update email)

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateEmail as firebaseUpdateEmail
} from 'firebase/auth';
import { app } from '../../firebaseConfig';

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

  return firebaseUpdateEmail(user, newEmail);
};

export { auth }; // Export auth instance for use elsewhere
