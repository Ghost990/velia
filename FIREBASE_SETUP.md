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
    "responseHeader": ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"]
  }
]
```
