import { initializeApp } from "firebase/app";
import Constants from "expo-constants";
import { getFirestore } from "firebase/firestore";

const {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
    firebaseMeasurementId,
  } = Constants.expoConfig.extra;

const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
    measurementId: firebaseMeasurementId
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);