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
import SnapFilters from './SnapFilters';
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
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunks = useRef([]);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { activeFilter } = useFilters();
  const { optimizeSingle } = useImageOptimization();

  useEffect(() => {
    initializeCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
        audio: mediaType === 'video'
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraError('');
    } catch (error) {
      console.error('Camera access error:', error);
      setCameraError(t('camera.permissionRequest'));
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob
    canvas.toBlob((blob) => {
      const file = new File([blob], `wedding-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });
      setCapturedMedia(file);
    }, 'image/jpeg', 0.9);
  };

  const startVideoRecording = async () => {
    if (!stream) return;

    try {
      recordedChunks.current = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunks.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, {
          type: 'video/webm'
        });
        const file = new File([blob], `wedding-video-${Date.now()}.webm`, {
          type: 'video/webm'
        });
        setCapturedMedia(file);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          stopVideoRecording();
        }
      }, 30000);
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: 'Videó felvétel hiba',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleOptimizationComplete = (result) => {
    // Handle optimized media
    console.log('Optimization complete:', result);
    setIsOptimizing(false);
    // Proceed with upload
    handleUpload(result);
  };

  const handleOptimizationError = (error) => {
    console.error('Optimization failed:', error);
    setIsOptimizing(false);
    toast({
      title: 'Optimalizálási hiba',
      description: 'Kép optimalizálása sikertelen',
      status: 'error',
      duration: 3000,
    });
  };

  const handleUpload = async (optimizedResult) => {
    setIsUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: t('upload.success'),
        status: 'success',
        duration: 3000,
      });
      
      // Reset and go back
      setCapturedMedia(null);
      navigate('/');
    } catch (error) {
      toast({
        title: t('upload.error'),
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const retake = () => {
    setCapturedMedia(null);
    setIsOptimizing(false);
    setIsUploading(false);
  };

  const approve = () => {
    if (capturedMedia) {
      if (capturedMedia.type.startsWith('image/')) {
        setIsOptimizing(true);
      } else {
        handleUpload({ optimized: capturedMedia });
      }
    }
  };

  if (cameraError) {
    return (
      <Container maxW="container.md" py={10}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {cameraError}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg="black" position="relative">
      {/* Header */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        zIndex={10}
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      >
        <HStack p={4} justify="space-between">
          <IconButton
            icon={<ArrowLeft />}
            variant="ghost"
            color="white"
            onClick={() => navigate('/')}
            aria-label="Vissza"
          />
          
          <HStack spacing={2}>
            <Button
              size="sm"
              variant={mediaType === 'photo' ? 'solid' : 'ghost'}
              colorScheme="white"
              onClick={() => setMediaType('photo')}
            >
              {t('camera.photoMode')}
            </Button>
            <Button
              size="sm"
              variant={mediaType === 'video' ? 'solid' : 'ghost'}
              colorScheme="white"
              onClick={() => setMediaType('video')}
            >
              {t('camera.videoMode')}
            </Button>
          </HStack>

          <IconButton
            icon={<Sparkles />}
            variant="ghost"
            color="white"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Szűrők"
          />
        </HStack>
      </Box>

      {/* Camera view */}
      <Box position="relative" w="100%" h="100vh">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scaleX(-1)' // Mirror for selfie mode
          }}
        />
        
        <canvas
          ref={canvasRef}
          style={{ display: 'none' }}
        />

        {/* Active filter indicator */}
        {activeFilter && (
          <Badge
            position="absolute"
            top="20"
            left="4"
            colorScheme="rose"
            variant="solid"
            px={3}
            py={1}
            borderRadius="full"
          >
            {activeFilter.name}
          </Badge>
        )}

        {/* Recording indicator */}
        {isRecording && (
          <MotionBox
            position="absolute"
            top="20"
            right="4"
            bg="red.500"
            color="white"
            px={3}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Box w={2} h={2} bg="white" borderRadius="full" mr={2} />
            REC
          </MotionBox>
        )}
      </Box>

      {/* Controls */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={6}
        bg="blackAlpha.300"
        backdropFilter="blur(10px)"
      >
        <VStack spacing={4}>
          {/* Main capture button */}
          <Box position="relative">
            <IconButton
              icon={mediaType === 'photo' ? <Camera /> : <Video />}
              size="lg"
              borderRadius="full"
              bg={isRecording ? 'red.500' : 'white'}
              color={isRecording ? 'white' : 'black'}
              boxSize={16}
              fontSize="2xl"
              onClick={mediaType === 'photo' ? capturePhoto : (isRecording ? stopVideoRecording : startVideoRecording)}
              _hover={{
                transform: 'scale(1.1)',
              }}
              transition="all 0.2s"
            />
            
            {isRecording && (
              <Box
                position="absolute"
                inset={-2}
                borderRadius="full"
                border="2px solid"
                borderColor="red.500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
          </Box>
        </VStack>
      </Box>

      {/* Filters panel */}
      <AnimatePresence>
        {showFilters && (
          <SnapFilters onClose={() => setShowFilters(false)} />
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <Modal isOpen={!!capturedMedia && !isOptimizing && !isUploading} onClose={retake}>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent maxW="90vw" maxH="90vh" bg="transparent" boxShadow="none">
          <ModalBody p={0}>
            <VStack spacing={4}>
              <Box
                borderRadius="lg"
                overflow="hidden"
                maxW="100%"
                maxH="70vh"
              >
                {capturedMedia && capturedMedia.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(capturedMedia)}
                    alt="Captured"
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                ) : capturedMedia && capturedMedia.type.startsWith('video/') ? (
                  <video
                    src={URL.createObjectURL(capturedMedia)}
                    controls
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                ) : null}
              </Box>

              <HStack spacing={4}>
                <Button
                  leftIcon={<RotateCcw />}
                  onClick={retake}
                  variant="outline"
                  colorScheme="whiteAlpha"
                >
                  {t('camera.retake')}
                </Button>
                <Button
                  leftIcon={<Check />}
                  onClick={approve}
                  colorScheme="green"
                >
                  {t('camera.approve')}
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Optimization modal */}
      {isOptimizing && capturedMedia && (
        <ImageOptimizer
          file={capturedMedia}
          onOptimized={handleOptimizationComplete}
          onError={handleOptimizationError}
        />
      )}

      {/* Upload progress modal */}
      {isUploading && (
        <UploadProgress
          isOpen={isUploading}
          progress={75}
          fileName={capturedMedia?.name || ''}
          onClose={() => {}}
        />
      )}
    </Box>
  );
};

export default CameraCapture;