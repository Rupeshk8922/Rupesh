import React from 'react';
import { getFirestore } from 'firebase/firestore';

const config = () => {
  return <div>config Placeholder</div>;
};

export const db = getFirestore();

export default config;
