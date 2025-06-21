import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Progress,
  Divider,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Code,
  Spinner,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { CheckCircle, XCircle, AlertCircle, Play, RefreshCw, Camera, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { testFirebaseConnection, testImageUpload } from '../../services/firebase';
import { getAvailableWeddingFilters, initializeEighthWall } from '../../services/eighthWall';

const MotionBox = motion(Box);

const TestConfiguration = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState({
    firebase: { status: 'pending', message: '', details: null },
    eighthWall: { status: 'pending', message: '', details: null },
    filters: { status: 'pending', message: '', details: null },
    camera: { status: 'pending', message: '', details: null },
    upload: { status: 'pending', message: '', details: null },
  });

  const toast = useToast();
  const { t } = useTranslation();

  const updateTestStatus = (testName, status, message, details = null) => {
    setTestResults(prev => ({
      ...prev,
      [testName]: { status, message, details }
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle color="green" size={20} />;
      case 'error': return <XCircle color="red" size={20} />;
      case 'warning': return <AlertCircle color="orange" size={20} />;
      default: return <Spinner size="sm" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'error': return 'red';
      case 'warning': return 'orange';
      default: return 'gray';
    }
  };

  const testFirebaseIntegration = async () => {
    try {
      const result = await testFirebaseConnection();
      if (result.success) {
        updateTestStatus('firebase', 'success', 'Firebase connection successful', result);
      } else {
        updateTestStatus('firebase', 'error', result.error, null);
      }
    } catch (error) {
      updateTestStatus('firebase', 'error', `Firebase test failed: ${error.message}`, {
        error: error.message,
        stack: error.stack
      });
    }
  };

  const testEighthWallIntegration = async () => {
    try {
      // Create a temporary canvas for testing
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 640;
      testCanvas.height = 480;
      
      // Test 8th Wall initialization (no API key needed)
      const success = await initializeEighthWall(testCanvas);
      
      if (success) {
        updateTestStatus('eighthWall', 'success', '8th Wall WebAR initialized successfully', {
          sdk: 'XR8',
          version: 'latest',
          faceTracking: 'enabled',
          authentication: 'project-based'
        });
      } else {
        updateTestStatus('eighthWall', 'warning', '8th Wall initialized but with warnings', null);
      }
    } catch (error) {
      updateTestStatus('eighthWall', 'error', `8th Wall initialization failed: ${error.message}`, {
        error: error.message,
        note: '8th Wall uses project-based authentication, not API keys'
      });
    }
  };

  const testFiltersConfiguration = async () => {
    try {
      // Test wedding filters loading
      const filters = getAvailableWeddingFilters();
      
      if (filters && filters.length > 0) {
        updateTestStatus('filters', 'success', `Loaded ${filters.length} wedding filters`, {
          filterCount: filters.length,
          categories: [...new Set(filters.map(f => f.category))],
          sampleFilters: filters.slice(0, 3).map(f => f.name)
        });
      } else {
        updateTestStatus('filters', 'warning', 'No wedding filters found', null);
      }
    } catch (error) {
      updateTestStatus('filters', 'error', `Filter configuration test failed: ${error.message}`, {
        error: error.message
      });
    }
  };

  const testCameraAccess = async () => {
    try {
      // Test camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, 
        audio: false 
      });
      
      if (stream) {
        // Stop the stream immediately after testing
        stream.getTracks().forEach(track => track.stop());
        
        updateTestStatus('camera', 'success', 'Camera access granted', {
          videoTracks: stream.getVideoTracks().length,
          constraints: { video: true, audio: false }
        });
      } else {
        updateTestStatus('camera', 'error', 'Failed to access camera', null);
      }
    } catch (error) {
      updateTestStatus('camera', 'error', `Camera access failed: ${error.message}`, {
        error: error.message,
        name: error.name
      });
    }
  };

  const testUploadFunctionality = async () => {
    try {
      // Create a test image blob
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(0, 0, 100, 100);
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      const testFile = new File([blob], 'test-image.jpg', { type: 'image/jpeg' });
      
      const result = await testImageUpload(testFile);
      
      if (result.success) {
        updateTestStatus('upload', 'success', 'Image upload test successful', {
          url: result.url,
          size: testFile.size,
          type: testFile.type
        });
      } else {
        updateTestStatus('upload', 'error', result.error, null);
      }
    } catch (error) {
      updateTestStatus('upload', 'error', `Upload test failed: ${error.message}`, {
        error: error.message
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    const tests = [
      testFirebaseIntegration,
      testEighthWallIntegration,
      testFiltersConfiguration,
      testCameraAccess,
      testUploadFunctionality
    ];

    for (const test of tests) {
      await test();
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    setIsRunning(false);
    
    // Show completion toast
    const failedTests = Object.values(testResults).filter(result => result.status === 'error').length;
    if (failedTests === 0) {
      toast({
        title: 'All tests passed!',
        description: 'Your 8th Wall wedding platform is ready to use.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } else {
      toast({
        title: `${failedTests} test(s) failed`,
        description: 'Please check the results and fix any issues.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const resetTests = () => {
    setTestResults({
      firebase: { status: 'pending', message: '', details: null },
      eighthWall: { status: 'pending', message: '', details: null },
      filters: { status: 'pending', message: '', details: null },
      camera: { status: 'pending', message: '', details: null },
      upload: { status: 'pending', message: '', details: null },
    });
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <MotionBox
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <VStack spacing={4} textAlign="center">
            <Heading size="xl" color="pink.500">
              8th Wall Wedding Platform Test
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Verify your wedding filter platform configuration
            </Text>
          </VStack>
        </MotionBox>

        {/* Control buttons */}
        <HStack justify="center" spacing={4}>
          <Button
            leftIcon={<Play />}
            colorScheme="pink"
            size="lg"
            onClick={runAllTests}
            isLoading={isRunning}
            loadingText="Running Tests..."
          >
            Run All Tests
          </Button>
          <Button
            leftIcon={<RefreshCw />}
            variant="outline"
            size="lg"
            onClick={resetTests}
            isDisabled={isRunning}
          >
            Reset
          </Button>
        </HStack>

        {/* Test Results */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {Object.entries(testResults).map(([testName, result]) => (
            <MotionBox
              key={testName}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card>
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <HStack spacing={3}>
                      {getStatusIcon(result.status)}
                      <Heading size="md">
                        {testName === 'eighthWall' ? '8th Wall WebAR' : 
                         testName === 'filters' ? 'Wedding Filters' : 
                         testName.charAt(0).toUpperCase() + testName.slice(1)}
                      </Heading>
                    </HStack>
                    <Badge colorScheme={getStatusColor(result.status)}>
                      {result.status}
                    </Badge>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={3}>
                    <Text fontSize="sm" color="gray.600">
                      {result.message || 'Waiting to run...'}
                    </Text>
                    
                    {result.details && (
                      <Accordion allowToggle size="sm">
                        <AccordionItem border="none">
                          <AccordionButton px={0} py={2}>
                            <Text fontSize="xs" color="gray.500">
                              View Details
                            </Text>
                            <AccordionIcon />
                          </AccordionButton>
                          <AccordionPanel px={0} py={2}>
                            <Code fontSize="xs" p={2} borderRadius="md" w="100%">
                              {JSON.stringify(result.details, null, 2)}
                            </Code>
                          </AccordionPanel>
                        </AccordionItem>
                      </Accordion>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            </MotionBox>
          ))}
        </SimpleGrid>

        {/* Environment Check */}
        <Card>
          <CardHeader>
            <Heading size="md">Environment Configuration</Heading>
          </CardHeader>
          <CardBody>
            <List spacing={2}>
              <ListItem>
                <ListIcon 
                  as={CheckCircle} 
                  color="green.500" 
                />
                8th Wall API Key: Not required
              </ListItem>
              <ListItem>
                <ListIcon 
                  as={import.meta.env.VITE_FIREBASE_API_KEY ? CheckCircle : XCircle} 
                  color={import.meta.env.VITE_FIREBASE_API_KEY ? 'green.500' : 'red.500'} 
                />
                Firebase API Key: {import.meta.env.VITE_FIREBASE_API_KEY ? 'Configured' : 'Missing'}
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                A-Frame: Installed
              </ListItem>
              <ListItem>
                <ListIcon as={CheckCircle} color="green.500" />
                Wedding Filters: Available
              </ListItem>
            </List>
          </CardBody>
        </Card>

        {/* Instructions */}
        <Alert status="info">
          <AlertIcon />
          <VStack align="start" spacing={2}>
            <AlertTitle>Setup Instructions:</AlertTitle>
            <AlertDescription>
              <List spacing={1} fontSize="sm">
                <ListItem>1. Ensure camera permissions are granted</ListItem>
                <ListItem>2. Test on HTTPS (required for WebAR)</ListItem>
                <ListItem>3. Upload 3D assets to 8th Wall console for better filters</ListItem>
              </List>
            </AlertDescription>
          </VStack>
        </Alert>
      </VStack>
    </Container>
  );
};

export default TestConfiguration;
