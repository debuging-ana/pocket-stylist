import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA8M0pjD1fgRjCJmAZCkwtpmT6zER5623Y",
  authDomain: "pocket-stylist-30d92.firebaseapp.com",
  projectId: "pocket-stylist-30d92",
  storageBucket: "pocket-stylist-30d92.appspot.com", 
  messagingSenderId: "664813945291",
  appId: "1:664813945291:web:a17a8f25f29b0e187c364e",
  measurementId: "G-HJ5GXNCJPD" 
};

// initialize Firebase
const app = initializeApp(firebaseConfig);

// initializing firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

//exporting the services we'll be using
export { auth, db, storage };