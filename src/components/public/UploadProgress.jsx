import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  VStack,
  Text,
  Progress,
  HStack,
  Icon,
  Spinner
} from '@chakra-ui/react';
import { Upload, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const MotionVStack = motion(VStack);

const UploadProgress = ({ isOpen, progress, fileName, onClose, error }) => {
  const { t } = useTranslation();
  const isComplete = progress >= 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent maxW="md" mx={4}>
        <ModalBody p={6}>
          <MotionVStack
            spacing={6}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Icon */}
            <motion.div
              animate={isComplete ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isComplete ? (
                <Icon as={CheckCircle} boxSize={16} color="green.500" />
              ) : (
                <Spinner size="xl" color="rose.500" thickness="4px" />
              )}
            </motion.div>

            {/* Status text */}
            <VStack spacing={2} textAlign="center">
              <Text fontSize="lg" fontWeight="bold" color={isComplete ? 'green.500' : 'gray.700'}>
                {isComplete ? t('upload.success') : t('upload.uploading')}
              </Text>
              
              {fileName && (
                <Text fontSize="sm" color="gray.600" noOfLines={1}>
                  {fileName}
                </Text>
              )}
            </VStack>

            {/* Progress bar */}
            {!isComplete && (
              <VStack spacing={3} w="100%">
                <Progress
                  value={progress}
                  width="100%"
                  colorScheme="rose"
                  borderRadius="full"
                  bg="gray.100"
                  hasStripe
                  isAnimated
                />
                
                <HStack justify="space-between" w="100%" fontSize="sm" color="gray.600">
                  <Text>{progress.toFixed(0)}%</Text>
                  <HStack spacing={1}>
                    <Icon as={Upload} boxSize={4} />
                    <Text>{t('upload.uploading')}</Text>
                  </HStack>
                </HStack>
              </VStack>
            )}

            {/* Success message */}
            {isComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Az emlék sikeresen hozzáadva a gyűjteményhez!
                </Text>
              </motion.div>
            )}
          </MotionVStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default UploadProgress;