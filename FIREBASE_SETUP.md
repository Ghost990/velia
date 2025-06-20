# Firebase Setup Guide

This document explains how to set up Firebase for your Hungarian Wedding Platform project.

## Environment Variables

The project uses environment variables to store Firebase configuration. These are stored in a `.env` file at the root of the project.

1. Make sure your `.env` file contains the following variables:

```
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
```

2. These variables are used in `src/services/firebase.js` to initialize the Firebase app.

## CORS Configuration

To allow your local development server to access Firebase Storage and Firestore, you need to configure CORS (Cross-Origin Resource Sharing).

### Setting up CORS for Firebase Storage

1. We've created a CORS configuration in `cors.json` that allows requests from:

   - Local development server: `http://localhost:5173`, `http://127.0.0.1:5173`, `https://localhost:5173`
   - Production domains: `https://krisztidani.firebaseapp.com`, `https://krisztidani.web.app`

2. To apply this configuration, run:

```bash
npm run setup-cors
```

This script will:

- Check if Firebase CLI is installed
- Check if Google Cloud SDK (gsutil) is installed
- Apply the CORS configuration to your Firebase Storage bucket

### Manual CORS Setup

If the script doesn't work, you can manually apply the CORS configuration:

1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Login to your Google account: `gcloud auth login`
3. Apply CORS configuration: `gsutil cors set cors.json gs://your-storage-bucket`

## Troubleshooting CORS Issues

If you're still experiencing CORS issues:

1. Verify your Firebase configuration in `.env` matches your Firebase project
2. Check Firebase Storage rules to ensure they allow read/write operations
3. Ensure you're properly authenticated if your Storage rules require authentication
4. Try clearing your browser cache or using an incognito window

## Firebase Storage Rules

Make sure your Firebase Storage rules allow the operations you need. Example rules that allow authenticated users to read/write:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

You can modify these rules in the Firebase Console under Storage > Rules.

# Firebase Storage CORS Configuration Fix

## Problem

Firebase Storage is blocking uploads from localhost due to CORS policy. You're seeing this error:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

## Solution

### Option 1: Configure CORS using Google Cloud SDK (Recommended)

1. **Install Google Cloud SDK** if you haven't already:

   - Download from: https://cloud.google.com/sdk/docs/install
   - Follow installation instructions for Windows

2. **Authenticate with Google Cloud**:

   ```bash
   gcloud auth login
   ```

3. **Set your project**:

   ```bash
   gcloud config set project krisztidani-7d45c
   ```

4. **Apply CORS configuration**:

   ```bash
   gsutil cors set cors.json gs://krisztidani-7d45c.firebasestorage.app
   ```

5. **Verify CORS configuration**:
   ```bash
   gsutil cors get gs://krisztidani-7d45c.firebasestorage.app
   ```

### Option 2: Firebase Console (Alternative)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `krisztidani-7d45c`
3. Go to Storage → Rules
4. Update storage rules to be more permissive for development:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true; // WARNING: Only for development!
    }
  }
}
```

### Option 3: Development Proxy (Temporary)

If you can't configure CORS immediately, the app includes a development mode that will:

- Show detailed error messages
- Provide fallback upload methods
- Skip optimization for faster testing

## Firestore Issues

The 400 errors from Firestore suggest rules or authentication issues. Check:

1. **Firestore Rules** - Go to Firestore → Rules in Firebase Console
2. **Authentication** - Ensure anonymous auth is enabled if not using user accounts
3. **Indexes** - Check if any composite indexes are required

## Testing

After applying CORS configuration:

1. Restart your development server: `npm run dev`
2. Go to `/test` route to run diagnostics
3. Try uploading files in `/gallery`

## Production Deployment

For production, update `cors.json` to include your actual domain:

```json
[
  {
    "origin": ["https://yourdomain.com", "http://localhost:5173"],
    "method": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "User-Agent",
      "x-goog-resumable"
    ]
  }
]
```
