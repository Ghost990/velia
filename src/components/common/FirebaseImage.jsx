import React, { useState, useEffect } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../services/firebase';
import { Image, Skeleton, Box, Text } from '@chakra-ui/react';

const FirebaseImage = ({ storagePath, imageProps = {} }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadImage = async () => {
      if (!storagePath) {
        if (isMounted) setError(true);
        return;
      }
      
      if (isMounted) {
        setIsImageLoaded(false);
        setError(false);
        setImageUrl('');
      }

      try {
        let url;
        if (storagePath.startsWith('http')) {
            url = storagePath;
        } else {
            const storageRef = ref(storage, storagePath);
            url = await getDownloadURL(storageRef);
        }
        if (isMounted) {
            setImageUrl(url);
        }
      } catch (err) {
        console.error('Error loading Firebase image:', err, { storagePath });
        if (isMounted) setError(true);
      }
    };
    
    loadImage();

    return () => {
      isMounted = false;
    };
  }, [storagePath]);

  const handleImageLoad = () => {
    setIsImageLoaded(true);
  };

  const handleImageError = () => {
    setError(true);
  }

  return (
    <Box position="relative" {...imageProps}>
      {!isImageLoaded && !error && (
        <Skeleton 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          borderRadius={imageProps.borderRadius}
        />
      )}
      
      {imageUrl && !error && (
        <Image 
          src={imageUrl} 
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ 
            opacity: isImageLoaded ? 1 : 0, 
            transition: 'opacity 0.3s ease-in-out' 
          }}
          {...imageProps} 
        />
      )}

      {error && (
        <Box 
          position="absolute" 
          top={0} 
          left={0} 
          right={0} 
          bottom={0} 
          bg="gray.100" 
          display="flex" 
          alignItems="center" 
          justifyContent="center"
          borderRadius={imageProps.borderRadius}
        >
          <Text fontSize="xs" color="gray.500">Image not available</Text>
        </Box>
      )}
    </Box>
  );
};

export default FirebaseImage;
