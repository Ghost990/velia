# Quick Fix for Firebase Storage CORS Issue

## Immediate Solution (2 minutes)

### Method 1: Firebase Console (Recommended)

1. **Open Firebase Console**: https://console.firebase.google.com/
2. **Select project**: `krisztidani-7d45c`
3. **Go to Storage → Rules**
4. **Replace the rules with**:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```
5. **Click "Publish"**
6. **Restart your dev server**: `npm run dev`

### Method 2: Enable Anonymous Authentication

If the above doesn't work, also enable anonymous auth:

1. **Go to Authentication → Sign-in method**
2. **Enable "Anonymous"**
3. **Save**

## Test the Fix

After applying the fix:
1. Go to `http://localhost:5173/test`
2. Run the diagnostic tests
3. Try uploading files in the gallery

## For Production Later

Once development is working, you can:
1. Install Google Cloud SDK
2. Use the `cors.json` file we created
3. Apply proper CORS configuration
4. Tighten security rules

## Alternative: Quick Install Google Cloud SDK

If you prefer to install Google Cloud SDK now:
1. Download: https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
2. Run installer
3. Open new PowerShell
4. Run: `gcloud auth login`
5. Run: `gcloud config set project krisztidani-7d45c`
6. Run: `gsutil cors set cors.json gs://krisztidani-7d45c.firebasestorage.app`
