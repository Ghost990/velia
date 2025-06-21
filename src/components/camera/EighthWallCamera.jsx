import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Alert,
  AlertIcon,
  Spinner,
  Text
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { 
  initialize8thWall, 
  applyWeddingFilter, 
  removeWeddingFilter,
  capturePhotoWithFilter,
  cleanup8thWall 
} from '../../services/eighthWall';

const MotionBox = motion(Box);

const EighthWallCamera = ({ 
  onFilterApplied, 
  onFilterRemoved, 
  onPhotoCapture, 
  activeFilter,
  onError 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentFilter, setCurrentFilter] = useState(null);

  // Initialize 8th Wall on component mount
  useEffect(() => {
    initializeCamera();
    
    return () => {
      cleanup8thWall();
    };
  }, []);

  // Handle filter changes
  useEffect(() => {
    if (isInitialized && activeFilter !== currentFilter) {
      handleFilterChange(activeFilter);
    }
  }, [activeFilter, isInitialized, currentFilter]);

  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Create canvas element
      const canvas = canvasRef.current;
      if (!canvas) {
        throw new Error('Canvas element not found');
      }

      // Set canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize 8th Wall with face tracking
      const apiKey = import.meta.env.VITE_8TH_WALL_API_KEY || 'demo-key';
      await initialize8thWall(canvas, apiKey);

      setIsInitialized(true);
      setIsLoading(false);
      
      console.log('8th Wall camera initialized successfully');

    } catch (err) {
      console.error('Failed to initialize 8th Wall camera:', err);
      setError(err.message);
      setIsLoading(false);
      onError && onError(err);
    }
  };

  const handleFilterChange = async (filterId) => {
    if (!isInitialized) return;

    try {
      // Remove current filter
      if (currentFilter) {
        await removeWeddingFilter();
        setCurrentFilter(null);
        onFilterRemoved && onFilterRemoved();
      }

      // Apply new filter
      if (filterId) {
        await applyWeddingFilter(filterId);
        setCurrentFilter(filterId);
        onFilterApplied && onFilterApplied(filterId);
      }

    } catch (err) {
      console.error('Failed to change filter:', err);
      setError(err.message);
      onError && onError(err);
    }
  };

  const capturePhoto = async () => {
    if (!isInitialized) {
      throw new Error('Camera not initialized');
    }

    try {
      const photoBlob = await capturePhotoWithFilter();
      onPhotoCapture && onPhotoCapture(photoBlob);
      return photoBlob;

    } catch (err) {
      console.error('Failed to capture photo:', err);
      setError(err.message);
      onError && onError(err);
      throw err;
    }
  };

  // Expose capture function to parent
  React.useImperativeHandle(React.forwardRef(() => {}), () => ({
    capturePhoto
  }));

  if (error) {
    return (
      <MotionBox
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        p={4}
      >
        <Alert status="error">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <Text fontWeight="bold">8th Wall Camera Error</Text>
            <Text fontSize="sm">{error}</Text>
          </VStack>
        </Alert>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      ref={containerRef}
      position="relative"
      width="100%"
      height="100%"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Loading overlay */}
      {isLoading && (
        <MotionBox
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.800"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={20}
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <VStack spacing={4} color="white">
            <Spinner size="xl" thickness="4px" />
            <Text>Initializing 8th Wall Camera...</Text>
            <Text fontSize="sm" opacity={0.7}>
              Loading face tracking and wedding filters
            </Text>
          </VStack>
        </MotionBox>
      )}

      {/* 8th Wall Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)', // Mirror for selfie mode
          backgroundColor: '#000'
        }}
      />

      {/* Filter status indicator */}
      {isInitialized && currentFilter && (
        <MotionBox
          position="absolute"
          top={4}
          left={4}
          bg="blackAlpha.700"
          color="white"
          px={3}
          py={2}
          borderRadius="md"
          fontSize="sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Filter Active: {currentFilter}
        </MotionBox>
      )}

      {/* Face tracking indicator */}
      {isInitialized && (
        <MotionBox
          position="absolute"
          top={4}
          right={4}
          bg="green.500"
          color="white"
          px={2}
          py={1}
          borderRadius="full"
          fontSize="xs"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          Face Tracking Active
        </MotionBox>
      )}
    </MotionBox>
  );
};

export default EighthWallCamera;
