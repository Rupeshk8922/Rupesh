// Import necessary modular functions from Firebase SDKs
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';

import { db } from './firebase/config';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

// Firestore helpers using modular API
export async function getCollection(collectionName) {
  const colRef = collection(db, collectionName);
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map(docSnap => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

export async function getDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } else {
    return null;
  }
}

export async function addDocument(collectionName, data) {
  const colRef = collection(db, collectionName);
  const docRef = await addDoc(colRef, data);
  return docRef.id;
}

export async function updateDocument(collectionName, documentId, data) {
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data);
}

export async function deleteDocument(collectionName, documentId) {
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

// Storage helpers using modular API
export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function deleteFile(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
