import { initializeApp } from "firebase/app";
import {
  getAuth,
  sendPasswordResetEmail,
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBuUElnfQeKIZ-XpN5Wn_Er5xjTPVyhvt4",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "empact-yhwq3.firebaseapp.com",
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    "https://empact-yhwq3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "empact-yhwq3",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "empact-yhwq3.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1011581028115",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1011581028115:web:b2811728353ecf9521fce6",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9YSYE6PSC6",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// Set persistence with error handling
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.warn("Failed to set persistence:", error);
});

const db = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);

// Connect to emulators if running locally
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

// Password reset helper
const firebaseSendPasswordResetEmail = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export { firebaseApp, firebaseSendPasswordResetEmail, db, auth, functions };
