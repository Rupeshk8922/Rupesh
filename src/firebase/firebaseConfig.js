// Firebase configuration for Empact CRM (loaded from .env or fallback values)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBuUElnfQeKIZ-XpN5Wn_Er5xjTPVyhvt4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "empact-yhwq3.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://empact-yhwq3-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "empact-yhwq3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "empact-yhwq3.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1011581028115",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1011581028115:web:b2811728353ecf9521fce6",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9YSYE6PSC6"
};

export { firebaseConfig };
