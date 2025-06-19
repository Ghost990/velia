import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyDAC9IK7Ewk0A-h6Qx9IHmNPVLT7GTMp2E",
  authDomain: "krisztidani-7d45c.firebaseapp.com",
  projectId: "krisztidani-7d45c",
  storageBucket: "krisztidani-7d45c.firebasestorage.app",
  messagingSenderId: "943064589125",
  appId: "1:943064589125:web:e67318672870e1bdbf942c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;