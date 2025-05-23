// src/hooks/useStorage.js

import { useState, useEffect } from 'react';
import { projectStorage } from '../firebase/config';
import { ref, uploadBytesResumable } from 'firebase/storage';

/**
 * Hook for uploading a file to Firebase Storage and tracking progress.
 */
export const useStorage = (file) => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!file) return;

    const storageRef = ref(projectStorage, file.name);
    const uploadTask = uploadBytesResumable(storageRef, file);

    const unsubscribe = uploadTask.on(
      'state_changed',
      (snapshot) => {
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percentage);
      },
      (err) => {
        setError(err.message || 'Upload failed');
      },
      async () => {
        try {
          const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
          setUrl(downloadURL);
        } catch (err) {
          setError(err.message || 'Could not get download URL');
        }
      }
    );

    return () => unsubscribe();
  }, [file]);

  return { progress, error, url };
};
