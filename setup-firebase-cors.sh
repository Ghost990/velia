#!/bin/bash

# Script to set up CORS configuration for Firebase Storage
echo "Setting up CORS configuration for Firebase Storage..."

# Check if firebase-tools is installed
if ! command -v firebase &> /dev/null
then
    echo "Firebase CLI not found. Installing firebase-tools..."
    npm install -g firebase-tools
fi

# Check if gsutil is installed (comes with Google Cloud SDK)
if ! command -v gsutil &> /dev/null
then
    echo "gsutil not found. You need to install Google Cloud SDK."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    echo "After installation, run 'gcloud init' to set up your account."
    exit 1
fi

# Login to Firebase (if not already logged in)
echo "Logging in to Firebase..."
firebase login

# Get the storage bucket from .env file
STORAGE_BUCKET=$(grep VITE_FIREBASE_STORAGE_BUCKET .env | cut -d '"' -f 2)

if [ -z "$STORAGE_BUCKET" ]
then
    echo "Storage bucket not found in .env file."
    echo "Please enter your Firebase storage bucket name (e.g. your-project.appspot.com):"
    read STORAGE_BUCKET
fi

# Apply CORS configuration
echo "Applying CORS configuration to $STORAGE_BUCKET..."
gsutil cors set cors.json gs://$STORAGE_BUCKET

echo "CORS configuration applied successfully!"
echo "Your Firebase Storage should now accept requests from your local development server."
