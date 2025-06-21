import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Button,
  IconButton,
  Text,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Progress,
  Spinner,
  Badge
} from '@chakra-ui/react';
import { Camera, Video, RotateCcw, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useFilters } from '../../contexts/FilterContext';
import { useImageOptimization } from '../../hooks/useImageOptimization';
import WeddingFilters from './SnapFilters'; 
import EighthWallCamera from '../camera/EighthWallCamera'; 
import ImageOptimizer from './ImageOptimizer';
import UploadProgress from './UploadProgress';

const MotionBox = motion(Box);

const CameraCapture = () => {
  const [stream, setStream] = useState(null);
  const [capturedMedia, setCapturedMedia] = useState(null);
  const [mediaType, setMediaType] = useState('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  
  const cameraRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { activeFilter } = useFilters();
  const { optimizeImage } = useImageOptimization();

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCameraReady = () => {
    setCameraReady(true);
    setCameraError('');
  };

  const handleCameraError = (error) => {
    setCameraError(error.message);
    setCameraReady(false);
    toast({
      title: 'Camera Error',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleFilterSelect = (filterId) => {
    console.log('Filter selected:', filterId);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current || !cameraReady) {
      toast({
        title: 'Camera not ready',
        description: 'Please wait for the camera to initialize',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const photoBlob = await cameraRef.current.capturePhoto();
      
      if (photoBlob) {
        setCapturedMedia({
          blob: photoBlob,
          type: 'image',
          url: URL.createObjectURL(photoBlob),
          hasFilter: !!activeFilter
        });
        
        toast({
          title: 'Photo captured!',
          description: activeFilter ? `With ${activeFilter.name} filter` : 'Without filter',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Failed to capture photo:', error);
      toast({
        title: 'Capture failed',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const retakePhoto = () => {
    if (capturedMedia?.url) {
      URL.revokeObjectURL(capturedMedia.url);
    }
    setCapturedMedia(null);
  };

  const handleImageOptimization = async (optimizedBlob) => {
    if (capturedMedia) {
      setCapturedMedia(prev => ({
        ...prev,
        blob: optimizedBlob,
        url: URL.createObjectURL(optimizedBlob)
      }));
    }
  };

  const handleUploadProgress = (progress) => {
    console.log('Upload progress:', progress);
  };

  const handleUploadComplete = () => {
    setIsUploading(false);
    toast({
      title: 'Upload successful!',
      description: 'Your photo has been uploaded to the gallery',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    navigate('/gallery');
  };

  const handleUploadError = (error) => {
    setIsUploading(false);
    toast({
      title: 'Upload failed',
      description: error.message,
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="100%" h="100vh" p={0} position="relative" overflow="hidden">
      <Box position="relative" w="100%" h="100%">
        {!capturedMedia ? (
          <>
            <EighthWallCamera
              ref={cameraRef}
              activeFilter={activeFilter?.id}
              onFilterApplied={handleFilterSelect}
              onFilterRemoved={() => handleFilterSelect(null)}
              onPhotoCapture={(blob) => console.log('Photo captured:', blob)}
              onError={handleCameraError}
            />

            <MotionBox
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg="linear-gradient(transparent, blackAlpha.800)"
              p={6}
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <VStack spacing={4}>
                {activeFilter && (
                  <MotionBox
                    bg="whiteAlpha.200"
                    backdropFilter="blur(10px)"
                    px={4}
                    py={2}
                    borderRadius="full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <HStack spacing={2}>
                      <Sparkles size={16} color="white" />
                      <Text color="white" fontSize="sm" fontWeight="medium">
                        {activeFilter.name}
                      </Text>
                    </HStack>
                  </MotionBox>
                )}

                <HStack justify="space-between" w="100%" align="center">
                  <IconButton
                    icon={<ArrowLeft />}
                    variant="ghost"
                    color="white"
                    size="lg"
                    onClick={() => navigate('/gallery')}
                    aria-label="Back to gallery"
                  />

                  <MotionBox
                    whileTap={{ scale: 0.9 }}
                    transition={{ duration: 0.1 }}
                  >
                    <IconButton
                      icon={<Camera />}
                      size="xl"
                      borderRadius="full"
                      bg="white"
                      color="gray.800"
                      _hover={{ bg: "gray.100" }}
                      _active={{ bg: "gray.200" }}
                      onClick={capturePhoto}
                      isDisabled={!cameraReady}
                      aria-label="Capture photo"
                      w={16}
                      h={16}
                    />
                  </MotionBox>

                  <IconButton
                    icon={<Sparkles />}
                    variant="ghost"
                    color={activeFilter ? "pink.300" : "white"}
                    size="lg"
                    onClick={() => setShowFilters(true)}
                    aria-label="Open filters"
                  />
                </HStack>

                <HStack spacing={2}>
                  <Box
                    w={2}
                    h={2}
                    borderRadius="full"
                    bg={cameraReady ? "green.400" : "red.400"}
                  />
                  <Text color="white" fontSize="xs">
                    {cameraReady ? 'Camera Ready' : 'Initializing...'}
                  </Text>
                </HStack>
              </VStack>
            </MotionBox>
          </>
        ) : (
          <MotionBox
            w="100%"
            h="100%"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Box
              w="100%"
              h="100%"
              bgImage={`url(${capturedMedia.url})`}
              bgSize="cover"
              bgPosition="center"
              position="relative"
            >
              <MotionBox
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="linear-gradient(transparent, blackAlpha.800)"
                p={6}
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <HStack justify="space-between" w="100%">
                  <Button
                    leftIcon={<RotateCcw />}
                    variant="ghost"
                    color="white"
                    onClick={retakePhoto}
                  >
                    Retake
                  </Button>

                  <Button
                    leftIcon={<Check />}
                    colorScheme="green"
                    onClick={() => setIsOptimizing(true)}
                    isDisabled={isOptimizing || isUploading}
                  >
                    Use Photo
                  </Button>
                </HStack>
              </MotionBox>

              {capturedMedia.hasFilter && (
                <MotionBox
                  position="absolute"
                  top={4}
                  right={4}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge colorScheme="pink" variant="solid">
                    Filtered
                  </Badge>
                </MotionBox>
              )}
            </Box>
          </MotionBox>
        )}

        {cameraError && (
          <MotionBox
            position="absolute"
            top={4}
            left={4}
            right={4}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Camera Error</Text>
                <Text fontSize="sm">{cameraError}</Text>
              </VStack>
            </Alert>
          </MotionBox>
        )}
      </Box>

      <AnimatePresence>
        {showFilters && (
          <WeddingFilters
            onClose={() => setShowFilters(false)}
            onFilterSelect={handleFilterSelect}
          />
        )}
      </AnimatePresence>

      {isOptimizing && capturedMedia && (
        <ImageOptimizer
          imageBlob={capturedMedia.blob}
          onOptimized={handleImageOptimization}
          onClose={() => setIsOptimizing(false)}
          onUploadStart={() => {
            setIsOptimizing(false);
            setIsUploading(true);
          }}
        />
      )}

      {isUploading && capturedMedia && (
        <UploadProgress
          imageBlob={capturedMedia.blob}
          onProgress={handleUploadProgress}
          onComplete={handleUploadComplete}
          onError={handleUploadError}
        />
      )}
    </Container>
  );
};

export default CameraCapture;