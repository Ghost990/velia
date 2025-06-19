import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Code,
  Divider,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Spinner,
  Progress
} from '@chakra-ui/react';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Camera, 
  Upload, 
  Database,
  Wifi,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useConfig } from '../../contexts/ConfigContext';
import { db, storage, auth } from '../../services/firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import { initializeSnapKit, loadLens } from '../../services/snapKit';

const MotionBox = motion(Box);

const TestConfiguration = () => {
  const [tests, setTests] = useState({
    firebase: { status: 'pending', message: '', details: null },
    storage: { status: 'pending', message: '', details: null },
    snapKit: { status: 'pending', message: '', details: null },
    filters: { status: 'pending', message: '', details: null },
    upload: { status: 'pending', message: '', details: null },
    config: { status: 'pending', message: '', details: null }
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');
  const [progress, setProgress] = useState(0);
  
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { config } = useConfig();

  const updateTestStatus = (testName, status, message, details = null) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status, message, details }
    }));
  };

  const testFirebaseConnection = async () => {
    setCurrentTest('Firebase Connection');
    try {
      // Test Firestore connection
      const testQuery = query(collection(db, 'test'), limit(1));
      await getDocs(testQuery);
      
      updateTestStatus('firebase', 'success', 'Firebase Firestore connection successful', {
        projectId: db.app.options.projectId,
        authDomain: db.app.options.authDomain
      });
    } catch (error) {
      updateTestStatus('firebase', 'error', `Firebase connection failed: ${error.message}`, {
        error: error.code,
        details: error.message
      });
    }
  };

  const testStorageConnection = async () => {
    setCurrentTest('Firebase Storage');
    try {
      // Test storage connection by listing root
      const storageRef = ref(storage, '/');
      await listAll(storageRef);
      
      updateTestStatus('storage', 'success', 'Firebase Storage connection successful', {
        bucket: storage.app.options.storageBucket
      });
    } catch (error) {
      updateTestStatus('storage', 'error', `Storage connection failed: ${error.message}`, {
        error: error.code,
        details: error.message
      });
    }
  };

  const testSnapKitIntegration = async () => {
    setCurrentTest('Snap Camera Kit');
    try {
      // Test SnapKit initialization
      const session = await initializeSnapKit();
      
      if (session) {
        updateTestStatus('snapKit', 'success', 'Snap Camera Kit initialized successfully', {
          sessionId: session.id || 'Available'
        });
      } else {
        updateTestStatus('snapKit', 'warning', 'SnapKit initialized but session is null', null);
      }
    } catch (error) {
      updateTestStatus('snapKit', 'error', `SnapKit initialization failed: ${error.message}`, {
        error: error.name,
        details: error.message,
        suggestion: 'Check API token and Camera Kit dependency'
      });
    }
  };

  const testFilterConfiguration = async () => {
    setCurrentTest('Filter Configuration');
    try {
      // Test filter loading from config
      const filtersConfig = config.filters;
      
      if (!filtersConfig) {
        updateTestStatus('filters', 'error', 'No filter configuration found', null);
        return;
      }

      if (!filtersConfig.enabled) {
        updateTestStatus('filters', 'warning', 'Filters are disabled in configuration', {
          enabled: false
        });
        return;
      }

      const availableFilters = filtersConfig.filters || [];
      const enabledFilters = availableFilters.filter(f => f.enabled);

      updateTestStatus('filters', 'success', `${enabledFilters.length} filters available`, {
        total: availableFilters.length,
        enabled: enabledFilters.length,
        categories: Object.keys(filtersConfig.categories || {})
      });
    } catch (error) {
      updateTestStatus('filters', 'error', `Filter configuration error: ${error.message}`, {
        error: error.name,
        details: error.message
      });
    }
  };

  const testUploadFunctionality = async () => {
    try {
      const uploadService = new UploadService(config);
      const result = await uploadService.testUpload();
      
      if (result.success) {
        updateTestStatus('upload', 'success', 'Upload test completed successfully', {
          details: `Test file uploaded with ID: ${result.result.id}`
        });
      } else {
        updateTestStatus('upload', 'error', 'Upload test failed', {
          details: result.message
        });
      }
    } catch (error) {
      let errorMessage = error.message;
      let actionableAdvice = '';

      // Detect CORS issues
      if (error.message?.includes('CORS') || error.message?.includes('blocked by CORS policy')) {
        actionableAdvice = `
🔧 CORS Configuration Required:
1. Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install
2. Run: gcloud auth login
3. Run: gcloud config set project krisztidani-7d45c
4. Run: gsutil cors set cors.json gs://krisztidani-7d45c.firebasestorage.app
5. See FIREBASE_SETUP.md for detailed instructions

Alternative: Update Firebase Storage rules in console for development.`;
      }

      // Detect authentication issues
      if (error.message?.includes('unauthenticated') || error.message?.includes('permission-denied')) {
        actionableAdvice = `
🔐 Authentication/Permission Issue:
1. Check Firebase Storage rules in console
2. Enable anonymous authentication if needed
3. Verify project configuration in firebase.js`;
      }

      updateTestStatus('upload', 'error', 'Upload functionality test failed', {
        details: `${errorMessage}${actionableAdvice ? '\n\n' + actionableAdvice : ''}`
      });
    }
  };

  const testConfiguration = async () => {
    setCurrentTest('Configuration Validation');
    try {
      const issues = [];
      
      // Check wedding config
      if (!config.couple?.bride || !config.couple?.groom) {
        issues.push('Missing bride or groom names');
      }
      
      // Check features
      if (!config.features) {
        issues.push('Missing features configuration');
      }
      
      // Check upload settings
      if (!config.upload) {
        issues.push('Missing upload configuration');
      }
      
      // Check storage settings
      if (!config.storage) {
        issues.push('Missing storage configuration');
      }

      if (issues.length === 0) {
        updateTestStatus('config', 'success', 'Configuration is valid', {
          bride: config.couple?.bride,
          groom: config.couple?.groom,
          featuresEnabled: Object.keys(config.features || {}).filter(key => config.features[key]).length
        });
      } else {
        updateTestStatus('config', 'warning', `Configuration issues found: ${issues.join(', ')}`, {
          issues
        });
      }
    } catch (error) {
      updateTestStatus('config', 'error', `Configuration validation failed: ${error.message}`, {
        error: error.name,
        details: error.message
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const testFunctions = [
      testConfiguration,
      testFirebaseConnection,
      testStorageConnection,
      testSnapKitIntegration,
      testFilterConfiguration,
      testUploadFunctionality
    ];

    for (let i = 0; i < testFunctions.length; i++) {
      await testFunctions[i]();
      setProgress(((i + 1) / testFunctions.length) * 100);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
    }

    setCurrentTest('');
    setIsRunning(false);
    
    toast({
      title: 'Configuration tests completed',
      status: 'info',
      duration: 3000,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle color="green" size={20} />;
      case 'error': return <XCircle color="red" size={20} />;
      case 'warning': return <AlertTriangle color="orange" size={20} />;
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

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%)">
      <Container maxW="6xl" py={8}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Button
              leftIcon={<ArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/')}
            >
              Vissza
            </Button>
            <Heading size="lg" color="gray.700">
              Rendszer Konfiguráció Teszt
            </Heading>
            <Button
              colorScheme="blue"
              onClick={runAllTests}
              isLoading={isRunning}
              loadingText="Testing..."
            >
              Összes Teszt Futtatása
            </Button>
          </HStack>

          {/* Progress */}
          {isRunning && (
            <Box>
              <Text mb={2} fontSize="sm" color="gray.600">
                Jelenlegi teszt: {currentTest}
              </Text>
              <Progress value={progress} colorScheme="blue" />
            </Box>
          )}

          {/* Test Results */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {Object.entries(tests).map(([testName, result]) => (
              <Card key={testName} variant="outline">
                <CardHeader pb={2}>
                  <HStack justify="space-between">
                    <Text fontWeight="semibold" textTransform="capitalize">
                      {testName === 'snapKit' ? 'Snap Camera Kit' : testName}
                    </Text>
                    {getStatusIcon(result.status)}
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack align="stretch" spacing={2}>
                    <Badge colorScheme={getStatusColor(result.status)} variant="subtle">
                      {result.status.toUpperCase()}
                    </Badge>
                    <Text fontSize="sm" color="gray.600">
                      {result.message}
                    </Text>
                    {result.details && (
                      <Box>
                        <Text fontSize="xs" fontWeight="semibold" mb={1}>
                          Részletek:
                        </Text>
                        <Code fontSize="xs" p={2} borderRadius="md" display="block" whiteSpace="pre-wrap">
                          {JSON.stringify(result.details, null, 2)}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>

          {/* Summary */}
          <Alert status="info">
            <AlertIcon />
            <Box>
              <AlertTitle>Teszt Összefoglaló</AlertTitle>
              <AlertDescription>
                Ez a diagnosztikai eszköz segít azonosítani a feltöltési és szűrő problémákat. 
                Futtassa le az összes tesztet, hogy lássa a rendszer állapotát.
              </AlertDescription>
            </Box>
          </Alert>
        </VStack>
      </Container>
    </Box>
  );
};

export default TestConfiguration;
