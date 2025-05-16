import { createContext } from 'react';
import { firebaseApp } from '../firebase/config'; // Import your Firebase app instance

export const FirebaseContext = createContext(firebaseApp);

export const FirebaseProvider = ({ children }) => {
  return (
    <FirebaseContext.Provider value={firebaseApp}>
      {children}
    </FirebaseContext.Provider>
  );
};