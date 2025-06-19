import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Spinner,
  Badge
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useImageOptimization } from '../../hooks/useImageOptimization';

const MotionBox = motion(Box);

const ImageOptimizer = ({ file, onOptimized, onError, showStats = true }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  
  const { t } = useTranslation();
  const { optimizeSingle, isOptimizing } = useImageOptimization();

  useEffect(() => {
    if (file) {
      handleOptimization();
    }
  }, [file]);

  const handleOptimization = async () => {
    if (!file) return;

    try {
      setCurrentStep(t('optimization.processing'));
      setProgress(10);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(t('optimization.resizing'));
      setProgress(30);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(t('optimization.compressing'));
      setProgress(60);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      setCurrentStep(t('optimization.generating'));
      setProgress(80);
      
      const result = await optimizeSingle(file);
      
      setProgress(100);
      setCurrentStep(t('optimization.complete'));
      setStats(result.metadata);
      
      setTimeout(() => {
        onOptimized(result);
      }, 1000);
      
    } catch (error) {
      console.error('Optimization failed:', error);
      setError(error.message);
      onError(error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={true} onClose={() => {}} closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent maxW="md" mx={4}>
        <ModalBody p={6}>
          <VStack spacing={6} align="stretch">
            {/* Header */}
            <VStack spacing={2}>
              <Box>
                {error ? (
                  <Icon as={AlertCircle} boxSize={12} color="red.500" />
                ) : progress === 100 ? (
                  <Icon as={CheckCircle} boxSize={12} color="green.500" />
                ) : (
                  <Spinner size="xl" color="rose.500" thickness="4px" />
                )}
              </Box>
              
              <Text
                fontSize="lg"
                fontWeight="bold"
                textAlign="center"
                color={error ? 'red.500' : progress === 100 ? 'green.500' : 'gray.700'}
              >
                {error ? t('optimization.error') : currentStep}
              </Text>
            </VStack>

            {/* Progress */}
            {!error && progress < 100 && (
              <VStack spacing={3}>
                <Progress
                  value={progress}
                  width="100%"
                  colorScheme="rose"
                  borderRadius="full"
                  bg="gray.100"
                />
                <Text fontSize="sm" color="gray.600">
                  {progress.toFixed(0)}% {t('upload.progress', { percentage: progress.toFixed(0) })}
                </Text>
              </VStack>
            )}

            {/* Statistics */}
            {stats && showStats && progress === 100 && (
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <VStack spacing={4}>
                  <Box w="100%" bg="green.50" p={4} borderRadius="md">
                    <VStack spacing={3}>
                      <HStack justify="space-between" w="100%">
                        <Stat size="sm">
                          <StatLabel fontSize="xs">Eredeti méret</StatLabel>
                          <StatNumber fontSize="md">
                            {formatFileSize(stats.originalSize)}
                          </StatNumber>
                        </Stat>
                        
                        <Stat size="sm">
                          <StatLabel fontSize="xs">Optimalizált</StatLabel>
                          <StatNumber fontSize="md">
                            {formatFileSize(stats.optimizedSize)}
                          </StatNumber>
                        </Stat>
                      </HStack>

                      <Box w="100%" textAlign="center">
                        <Badge colorScheme="green" variant="solid" fontSize="sm" px={3} py={1}>
                          {stats.compression}% megtakarítás
                        </Badge>
                      </Box>

                      <HStack justify="space-between" w="100%" fontSize="xs" color="gray.600">
                        <Text>Minőség: {t(`optimization.quality.${stats.quality}`)}</Text>
                        <Text>Idő: {stats.processingTime}s</Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              </MotionBox>
            )}

            {/* Error message */}
            {error && (
              <Box bg="red.50" p={4} borderRadius="md" borderLeft="4px solid" borderColor="red.500">
                <Text fontSize="sm" color="red.700">
                  {error}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ImageOptimizer;