# Pocket Stylist
### Your AI-Powered Personal Stylist

Pocket Stylist is an AI-powered styling assistant designed to help users curate outfits effortlessly based on their personal wardrobe, body type, location, weather, and events.
Help students look their best with little to no effort and never be late to a class again trying to find an outfit.

## Tech Stack

### Frontend
- Expo
- Expo Router
- React Native
- React Navigation - Advanced navigation components


### Backend
- Node.js

### Authentication & Database
- Firebase Authentication
- Firebase Firestore
- Firebase Storage 
- OpenAI API - AI-powered styling recommendations
- Ollama - Local AI model integration

## Project Structure
   ```
pocket-stylist-1/
├── app/                   
│   ├── wardrobe/          
│   ├── chat/        
│   ├── boards/       
│   ├── profile/           
│   ├── outfit/             
│   ├── homepage.js         
│   ├── explorePage.js      
│   ├── contacts.js         
│   ├── login.js          
│   └── signup.js         
├── components/             
├── context/               
│   ├── AuthContext.js    
│   ├── wardrobeContext.js 
│   └── NotificationContext.js 
├── utils/                 
├── services/              
├── assets/                
├── __tests__/             
└── firebaseConfig.js 
   ```

## Features
- Personalized outfit suggestions
- Weather-based styling
- Event-based recommendations
- Quick wardrobe curation
- Works with your real closet

## Get started

### Prerequisites
- Node.js (v16 or higher)
- Expo CLI
- Firebase account
- OpenAI API Key (optional, for AI features)
- RemoveBG API Key (optional, for remove background features)

1. Clone the Repository
   ```
   git clone https://github.com/debuging-ana/pocket-stylist.git
   ```

2. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

## Environmental Setup
### Create an .env file in the root directory:

FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id
OPENAI_SECRET_KEY=your_openai_key
OLLAMA_BASE_URL=http://YOUR_LOCAL_IP:11434
REMOVE_BG_API_KEY=your_remove_bg_key


- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)

## Contributers

- Juliana Binondo
- Ellison Yong
- Ana Carolina
- Dineth Beneragama
- Mohumad Hussain
