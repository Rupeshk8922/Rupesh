import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET, // <-- Corrected bucket domain
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
// Optional but recommended to avoid session loss
setPersistence(auth, browserLocalPersistence);

const functions = getFunctions(firebaseApp);

// Connect to emulators in development
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080); // Note: Firestore default emulator port is typically 8080
}


const firebaseSendPasswordResetEmail = async (email) => { // Renamed the function
 await sendPasswordResetEmail(auth, email);
};

export { firebaseApp, firebaseSendPasswordResetEmail, db, auth, functions }; // Export the renamed function
