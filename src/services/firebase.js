import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
// Connect to the 'wedding' Firestore database
export const db = getFirestore(app, 'wedding');
export const storage = getStorage(app);
export const auth = getAuth(app);

// For development debugging
if (import.meta.env.DEV) {
  console.log('Firebase initialized with project:', import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log('Using Firestore database: wedding');
}

// Test functions for configuration validation
export const testFirebaseConnection = async () => {
  try {
    // Test Firestore connection
    const testQuery = query(collection(db, 'test'), limit(1));
    await getDocs(testQuery);
    
    return {
      success: true,
      projectId: db.app.options.projectId,
      authDomain: db.app.options.authDomain,
      database: 'wedding'
    };
  } catch (error) {
    return {
      success: false,
      error: `Firebase connection failed: ${error.message}`,
      code: error.code,
      details: error.message
    };
  }
};

export const testImageUpload = async (testFile) => {
  try {
    // Create a test file if none provided
    if (!testFile) {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(0, 0, 100, 100);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
    }
    
    // Upload test file to Firebase Storage
    const timestamp = Date.now();
    const storageRef = ref(storage, `test-uploads/test-${timestamp}.jpg`);
    const uploadResult = await uploadBytes(storageRef, testFile);
    const downloadURL = await getDownloadURL(uploadResult.ref);
    
    return {
      success: true,
      url: downloadURL,
      size: testFile.size,
      type: testFile.type,
      path: uploadResult.ref.fullPath
    };
  } catch (error) {
    return {
      success: false,
      error: `Image upload failed: ${error.message}`,
      code: error.code,
      details: error.message
    };
  }
};

export default app;