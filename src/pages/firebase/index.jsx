import React from 'react';
import { getFirestore } from 'firebase/firestore';

const index = () => {
  return <div>index Placeholder</div>;
};

export default index;

export const db = getFirestore();
