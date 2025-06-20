// Script to apply CORS settings using Firebase Admin SDK
// This avoids the need for gsutil and Python version compatibility issues
import { initializeApp, cert } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// Get the directory name using ES modules approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin with application default credentials
// This will use your logged-in credentials from firebase login
try {
  // Try to use the Firebase CLI credentials
  initializeApp({
    storageBucket: 'krisztidani.firebasestorage.app'
  });

  console.log('Firebase Admin SDK initialized successfully');

  // Read CORS configuration from cors.json
  const corsConfigPath = path.join(__dirname, 'cors.json');
  const corsConfig = JSON.parse(fs.readFileSync(corsConfigPath, 'utf8'));

  // Get a reference to the storage service
  const bucket = getStorage().bucket();

  // Apply CORS configuration
  bucket.setCorsConfiguration(corsConfig)
    .then(() => {
      console.log('CORS configuration applied successfully!');
      console.log('Your Firebase Storage should now accept requests from your local development server.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error applying CORS configuration:', error);
      process.exit(1);
    });
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  console.log('\nTo fix this issue:');
  console.log('1. Make sure you are logged in to Firebase CLI: run "firebase login"');
  console.log('2. Run "firebase login:ci" to get a token');
  console.log('3. Create a service account key in the Firebase Console and download it');
  console.log('4. Set the environment variable: export GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/key.json');
  process.exit(1);
}
