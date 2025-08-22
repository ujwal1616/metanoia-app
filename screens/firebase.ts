import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config from the Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyAqETP5TwUktfwZ-AYYWWZicUgTRuXLtf4",
  authDomain: "metanoia-app-5495e.firebaseapp.com",
  projectId: "metanoia-app-5495e",
  storageBucket: "metanoia-app-5495e.appspot.com",
  messagingSenderId: "964843695837",
  appId: "1:964843695837:web:f68f04eb6fed8df8db3534",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Use React Native persistence for authentication
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Get Firestore database instance
const db = getFirestore(app);

export { auth, db };