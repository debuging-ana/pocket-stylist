const dotenv = require('dotenv');
dotenv.config();

export default {
  expo: {
    name: "Pocket Stylist",
    slug: "pocket-stylist",
    scheme: "pocketstylist",
    version: "1.0.0",
    newArchEnabled: true,
    ios: {
      infoPlist: {
        NSPhotoLibraryUsageDescription: "Allow photo access to choose profile pictures"
      }
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
    },
  },
};