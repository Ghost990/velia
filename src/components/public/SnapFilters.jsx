import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Badge,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  Tooltip
} from '@chakra-ui/react';
import { X, Sparkles, Heart, Crown, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useFilters } from '../../contexts/FilterContext';
import { getAvailableWeddingFilters } from '../../services/eighthWall';
import FilterButton from './FilterButton';

const MotionBox = motion(Box);

const SnapFilters = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weddingFilters, setWeddingFilters] = useState([]);
  const { t } = useTranslation();
  const { availableFilters, activeFilter, applyFilter, removeFilter } = useFilters();

  useEffect(() => {
    loadWeddingFilters();
  }, []);

  const loadWeddingFilters = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get 8th Wall wedding filters
      const filters = getAvailableWeddingFilters();
      setWeddingFilters(filters);
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load wedding filters:', err);
      setError('Failed to load wedding filters');
      setLoading(false);
    }
  };

  const handleFilterSelect = async (filter) => {
    try {
      if (activeFilter?.id === filter.id) {
        removeFilter();
        onClose && onClose(null);
      } else {
        applyFilter(filter.id);
        onClose && onClose(filter.id);
      }
    } catch (error) {
      console.error('Filter application error:', error);
      setError('Failed to apply filter');
    }
  };

  const getFilterIcon = (filterType) => {
    switch (filterType) {
      case 'face_attachment':
        return Crown;
      case 'particles':
        return Heart;
      case 'overlay':
        return Camera;
      default:
        return Sparkles;
    }
  };

  const getCategoryFilters = (category) => {
    return weddingFilters.filter(filter => filter.category === category);
  };

  return (
    <MotionBox
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="blackAlpha.800"
      zIndex={1000}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <MotionBox
        position="absolute"
        bottom="0"
        left="0"
        right="0"
        bg="white"
        borderTopRadius="xl"
        maxH="80vh"
        overflowY="auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 500 }}
      >
        {/* Header */}
        <HStack justify="space-between" p={4} borderBottom="1px" borderColor="gray.200">
          <HStack spacing={3}>
            <Sparkles size={24} color="#E53E3E" />
            <VStack align="start" spacing={0}>
              <Text fontSize="lg" fontWeight="bold">
                Wedding Filters
              </Text>
              <Text fontSize="sm" color="gray.600">
                Choose your perfect wedding look
              </Text>
            </VStack>
          </HStack>
          <IconButton
            icon={<X />}
            variant="ghost"
            onClick={onClose}
            aria-label="Close filters"
          />
        </HStack>

        {/* Content */}
        <Box p={4}>
          {loading && (
            <VStack spacing={4} py={8}>
              <Spinner size="lg" color="pink.500" />
              <Text>Loading wedding filters...</Text>
            </VStack>
          )}

          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}

          {!loading && !error && (
            <VStack spacing={6} align="stretch">
              {/* Wedding Category */}
              <Box>
                <HStack spacing={2} mb={3}>
                  <Crown size={20} color="#D69E2E" />
                  <Text fontSize="md" fontWeight="semibold">
                    Wedding Essentials
                  </Text>
                  <Badge colorScheme="gold" variant="subtle">
                    {getCategoryFilters('wedding').length}
                  </Badge>
                </HStack>
                <SimpleGrid columns={3} spacing={3}>
                  {getCategoryFilters('wedding').map((filter) => {
                    const Icon = getFilterIcon(filter.type);
                    const isActive = activeFilter?.id === filter.id;
                    
                    return (
                      <Tooltip key={filter.id} label={filter.description} placement="top">
                        <MotionBox
                          bg={isActive ? "pink.500" : "gray.100"}
                          color={isActive ? "white" : "gray.700"}
                          p={3}
                          borderRadius="lg"
                          cursor="pointer"
                          textAlign="center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFilterSelect(filter)}
                          border={isActive ? "2px solid" : "2px solid transparent"}
                          borderColor={isActive ? "pink.300" : "transparent"}
                        >
                          <VStack spacing={2}>
                            <Icon size={24} />
                            <Text fontSize="xs" fontWeight="medium">
                              {filter.name}
                            </Text>
                            {filter.premium && (
                              <Badge size="sm" colorScheme="yellow">
                                Premium
                              </Badge>
                            )}
                          </VStack>
                        </MotionBox>
                      </Tooltip>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Romantic Category */}
              <Box>
                <HStack spacing={2} mb={3}>
                  <Heart size={20} color="#E53E3E" />
                  <Text fontSize="md" fontWeight="semibold">
                    Romantic Effects
                  </Text>
                  <Badge colorScheme="pink" variant="subtle">
                    {getCategoryFilters('romantic').length}
                  </Badge>
                </HStack>
                <SimpleGrid columns={3} spacing={3}>
                  {getCategoryFilters('romantic').map((filter) => {
                    const Icon = getFilterIcon(filter.type);
                    const isActive = activeFilter?.id === filter.id;
                    
                    return (
                      <Tooltip key={filter.id} label={filter.description} placement="top">
                        <MotionBox
                          bg={isActive ? "pink.500" : "gray.100"}
                          color={isActive ? "white" : "gray.700"}
                          p={3}
                          borderRadius="lg"
                          cursor="pointer"
                          textAlign="center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFilterSelect(filter)}
                          border={isActive ? "2px solid" : "2px solid transparent"}
                          borderColor={isActive ? "pink.300" : "transparent"}
                        >
                          <VStack spacing={2}>
                            <Icon size={24} />
                            <Text fontSize="xs" fontWeight="medium">
                              {filter.name}
                            </Text>
                            {filter.premium && (
                              <Badge size="sm" colorScheme="yellow">
                                Premium
                              </Badge>
                            )}
                          </VStack>
                        </MotionBox>
                      </Tooltip>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Frame Category */}
              <Box>
                <HStack spacing={2} mb={3}>
                  <Camera size={20} color="#3182CE" />
                  <Text fontSize="md" fontWeight="semibold">
                    Photo Frames
                  </Text>
                  <Badge colorScheme="blue" variant="subtle">
                    {getCategoryFilters('frame').length}
                  </Badge>
                </HStack>
                <SimpleGrid columns={3} spacing={3}>
                  {getCategoryFilters('frame').map((filter) => {
                    const Icon = getFilterIcon(filter.type);
                    const isActive = activeFilter?.id === filter.id;
                    
                    return (
                      <Tooltip key={filter.id} label={filter.description} placement="top">
                        <MotionBox
                          bg={isActive ? "pink.500" : "gray.100"}
                          color={isActive ? "white" : "gray.700"}
                          p={3}
                          borderRadius="lg"
                          cursor="pointer"
                          textAlign="center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFilterSelect(filter)}
                          border={isActive ? "2px solid" : "2px solid transparent"}
                          borderColor={isActive ? "pink.300" : "transparent"}
                        >
                          <VStack spacing={2}>
                            <Icon size={24} />
                            <Text fontSize="xs" fontWeight="medium">
                              {filter.name}
                            </Text>
                            {filter.premium && (
                              <Badge size="sm" colorScheme="yellow">
                                Premium
                              </Badge>
                            )}
                          </VStack>
                        </MotionBox>
                      </Tooltip>
                    );
                  })}
                </SimpleGrid>
              </Box>

              {/* Clear Filter Option */}
              {activeFilter && (
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box
                    bg="gray.50"
                    p={3}
                    borderRadius="lg"
                    cursor="pointer"
                    textAlign="center"
                    onClick={() => handleFilterSelect({ id: null })}
                    border="2px dashed"
                    borderColor="gray.300"
                  >
                    <VStack spacing={2}>
                      <X size={24} color="#666" />
                      <Text fontSize="sm" fontWeight="medium" color="gray.600">
                        Remove Filter
                      </Text>
                    </VStack>
                  </Box>
                </MotionBox>
              )}
            </VStack>
          )}
        </Box>
      </MotionBox>
    </MotionBox>
  );
};

export default SnapFilters;