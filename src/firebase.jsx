// firebase.js
import {
  collection,
  getFirestore,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getStorage
} from 'firebase/storage';

// Firebase configuration (using environment variables)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID, // optional
};
// Initialize Firebase app and services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics;
if (import.meta.env.PROD) {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.warn('Analytics not supported or failed to initialize:', e);
  }
}

/**
 * Fetch all documents from a collection
 * @param {string} collectionName
 * @returns {Promise<Array<Object>>}
 */
export async function getCollection(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Fetch a single document by ID from a collection
 * @param {string} collectionName
 * @param {string} documentId
 * @returns {Promise<Object|null>}
 */
export async function getDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
    };
  }
  return null;
}

/**
 * Add a new document to a collection
 * @param {string} collectionName
 * @param {Object} data
 * @returns {Promise<string>} Document ID
 */
export async function addDocument(collectionName, data) {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

/**
 * Update an existing document in a collection
 * @param {string} collectionName
 * @param {string} documentId
 * @param {Object} data
 * @returns {Promise<void>}
 */
export async function updateDocument(collectionName, documentId, data) {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data);
}

/**
 * Delete a document from a collection
 * @param {string} collectionName
 * @param {string} documentId
 * @returns {Promise<void>}
 */
export async function deleteDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

/**
 * Upload a file to Firebase Storage
 * @param {File} file
 * @param {string} path Storage path
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

/**
 * Delete a file from Firebase Storage
 * @param {string} path Storage path
 * @returns {Promise<void>}
 */
export async function deleteFile(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

// Export initialized instances and analytics
export { db, app, analytics };
