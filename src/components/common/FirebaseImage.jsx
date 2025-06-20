import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { Image, Skeleton, Box } from '@chakra-ui/react';

/**
 * FirebaseImage Component
 * A specialized image component that handles Firebase Storage URLs properly
 * Manages all the complexities of loading images from Firebase Storage
 * 
 * @param {string} storagePath - The Firebase Storage path or URL
 * @param {object} imageProps - Props to pass to the underlying Chakra UI Image component
 * @returns {React.Component} - A React component that renders an image from Firebase Storage
 */
const FirebaseImage = ({ storagePath, imageProps = {} }) => {
  // console.log('FirebaseImage: Component rendering. Received storagePath:', storagePath, 'imageProps:', imageProps);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    const loadImage = async () => {
      if (!storagePath) {
        console.error('FirebaseImage: No storage path provided');
        setError(true);
        setLoading(false);
        return;
      }
      
      // console.log('FirebaseImage: Loading image from path:', storagePath);
      
      try {
        setLoading(true);
        setError(false);
        
        let path = storagePath;
        
        // Handle full Firebase Storage URLs
        if (storagePath.includes('firebasestorage.googleapis.com') || storagePath.includes('firebasestorage.app')) {
          try {
            // Extract the path from the URL
            const urlObj = new URL(storagePath);
            
            // Try different URL patterns
            let pathMatch = urlObj.pathname.match(/\/v\d+\/b\/[^\/]+\/o\/(.+)$/);
            
            if (pathMatch && pathMatch[1]) {
              // Decode the path component
              path = decodeURIComponent(pathMatch[1]);
            } else {
              // Alternative pattern for firebasestorage.app URLs
              pathMatch = urlObj.pathname.match(/\/([^?]+)/);
              if (pathMatch && pathMatch[1]) {
                path = pathMatch[1];
              } else {
                console.warn('Could not extract path from URL, using full URL as path', storagePath);
                // Use the URL as is, let Firebase handle it
                path = storagePath;
              }
            }
            
            // console.log('Extracted path:', path, 'from URL:', storagePath);
          } catch (err) {
            console.error('Error parsing Firebase Storage URL:', err);
            // Fall back to using the full URL
            path = storagePath;
          }
        }
        
        // Get a fresh download URL using the Firebase SDK
        // console.log('FirebaseImage: Creating storage ref with path:', path);
        const storageRef = ref(storage, path);
        
        try {
          const url = await getDownloadURL(storageRef);
          // console.log('FirebaseImage: Successfully got download URL:', url);
          
          // Add cache-busting parameter
          const urlWithCacheBusting = `${url}&t=${Date.now()}`;
          setImageUrl(urlWithCacheBusting);
        } catch (downloadErr) {
          console.error('FirebaseImage: Error getting download URL:', downloadErr);
          
          // Try using the path directly if it looks like a URL
          if (storagePath.startsWith('http')) {
            // console.log('FirebaseImage: Trying to use original URL directly:', storagePath);
            setImageUrl(storagePath);
          } else {
            throw downloadErr;
          }
        }
      } catch (err) {
        console.error('Error loading Firebase image:', err, { storagePath });
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    
    loadImage();
  }, [storagePath]);
  
  if (loading) {
    return (
      <Skeleton 
        width={imageProps.w || imageProps.width || '100%'} 
        height={imageProps.h || imageProps.height || '200px'} 
        borderRadius={imageProps.borderRadius || 'md'}
      />
    );
  }
  
  if (error || !imageUrl) {
    return (
      <Box 
        width={imageProps.w || imageProps.width || '100%'} 
        height={imageProps.h || imageProps.height || '200px'} 
        bg="gray.100" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        borderRadius={imageProps.borderRadius || 'md'}
      >
        <Box color="gray.500" fontSize="sm">Image not available</Box>
      </Box>
    );
  }
  
  return (
    <Image
      src={imageUrl}
      fallbackSrc="https://via.placeholder.com/400x300?text=Loading..."
      {...imageProps}
    />
  );
};

export default FirebaseImage;
