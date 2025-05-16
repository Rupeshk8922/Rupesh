import { initializeApp } from "firebase/app";
import { getAuth, sendPasswordResetEmail, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyBuUElnfQeKIZ-XpN5Wn_Er5xjTPVyhvt4",
  authDomain: "empact-yhwq3.firebaseapp.com",
  databaseURL: "https://empact-yhwq3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "empact-yhwq3",
  storageBucket: "empact-yhwq3.appspot.com", // <-- Corrected bucket domain
  messagingSenderId: "1011581028115",
  appId: "1:1011581028115:web:b2811728353ecf9521fce6",
  measurementId: "G-9YSYE6PSC6"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp);

// Connect to emulators in development
if (window.location.hostname === "localhost") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  connectFirestoreEmulator(db, "127.0.0.1", 8080); // Note: Firestore default emulator port is typically 8080
}


const sendPasswordReset = async (email) => {
 await sendPasswordResetEmail(auth, email);
};

export { firebaseApp, sendPasswordReset, db, auth, functions };
