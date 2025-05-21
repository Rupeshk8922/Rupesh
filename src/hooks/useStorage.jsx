import { useState, useEffect } from 'react'
import { projectStorage } from '../firebase/config'
import { ref, uploadBytesResumable } from 'firebase/storage';

export const useStorage = (file) => {
  const [progress, setProgress] = useState(0);



  useEffect(() => {
    // references
    const storageRef = ref(projectStorage, file.name);

    // upload the file
    const uploadTask = uploadBytesResumable(storageRef, file);

    // listen for state changes, errors, and completion of the upload.
    uploadTask.on('state_changed',
      (snapshot) => {
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(percentage);
      },
      (error) => {
        // A full list of error codes is available at
        // https://firebase.google.com/docs/storage/web/handle-errors
        console.log(error);

      }
    );

  }, [file]);

  return { progress };
}