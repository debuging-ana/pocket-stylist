const dotenv = require('dotenv');
dotenv.config();

export default {
  expo: {
    name: "Pocket Stylist",
    slug: "pocket-stylist",
    scheme: "pocketstylist",
    version: "1.0.0",
    
    ios: {
      deploymentTarget: "15.1",
      bundleIdentifier: "com.anonymous.pocketstylist",
      infoPlist: {
        NSPhotoLibraryUsageDescription: "For saving outfit photos",
        NSLocalNetworkUsageDescription: "Required to connect to Ollama AI on your local network",
        NSBonjourServices: ["_ollama._tcp"], //for local network discovery
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true,
          NSExceptionDomains: {
            "YOUR_LOCAL_IP": { // GUYS REPLACE WITH UR IP (using ipconfig for windows)
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true
            },
            "localhost": { //this is fallback for usb tethering
              NSExceptionAllowsInsecureHTTPLoads: true,
              NSIncludesSubdomains: true
            }
          }
        }
      }
    },

    android: {
      package: "com.anonymous.pocketstylist",
      versionCode: 1,
      usesCleartextTraffic: true,
      permissions: [
        "android.permission.INTERNET"
      ]
    },

    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      removeBgApiKey: process.env.REMOVE_BG_API_KEY,
      openAiSecretKey: process.env.OPENAI_SECRET_KEY,
      ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://YOUR_LOCAL_IP:11434" // REPLACE WITH UR IP
    },

    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "15.1",
            useFrameworks: "static"
          }
        }
      ]
    ]
  }
};