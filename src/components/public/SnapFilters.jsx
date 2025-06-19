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
  AlertIcon
} from '@chakra-ui/react';
import { X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useFilters } from '../../contexts/FilterContext';
import FilterButton from './FilterButton';

const MotionBox = motion(Box);

const SnapFilters = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { t } = useTranslation();
  const { availableFilters, activeFilter, applyFilter, removeFilter } = useFilters();

  useEffect(() => {
    // Simulate loading filters
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFilterSelect = async (filter) => {
    try {
      if (activeFilter?.id === filter.id) {
        removeFilter();
      } else {
        applyFilter(filter.id);
      }
    } catch (error) {
      console.error('Filter application error:', error);
      setError(t('filters.error'));
    }
  };

  return (
    <MotionBox
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="blackAlpha.800"
      backdropFilter="blur(10px)"
      borderTopRadius="xl"
      p={4}
      zIndex={20}
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
    >
      <VStack spacing={4} align="stretch">
        {/* Header */}
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <Sparkles color="white" size={20} />
            <Text color="white" fontWeight="bold" fontSize="lg">
              {t('filters.title')}
            </Text>
          </HStack>
          
          <IconButton
            icon={<X />}
            variant="ghost"
            color="white"
            size="sm"
            onClick={onClose}
            aria-label="Bezárás"
          />
        </HStack>

        {/* Loading state */}
        {loading && (
          <VStack spacing={3} py={6}>
            <Spinner color="white" size="lg" />
            <Text color="white" fontSize="sm">
              {t('filters.loading')}
            </Text>
          </VStack>
        )}

        {/* Error state */}
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Filters grid */}
        {!loading && !error && (
          <Box maxH="300px" overflowY="auto">
            <SimpleGrid columns={4} spacing={3}>
              {/* No filter option */}
              <FilterButton
                filter={{
                  id: 'none',
                  name: t('filters.noFilter'),
                  icon: '✨'
                }}
                isActive={!activeFilter}
                onClick={() => removeFilter()}
              />

              {/* Available filters */}
              {availableFilters
                .filter(filter => filter.enabled)
                .map((filter) => (
                  <FilterButton
                    key={filter.id}
                    filter={filter}
                    isActive={activeFilter?.id === filter.id}
                    onClick={() => handleFilterSelect(filter)}
                  />
                ))}
            </SimpleGrid>

            {/* Filter categories */}
            <VStack spacing={2} mt={4} align="start">
              <Text color="whiteAlpha.700" fontSize="xs" fontWeight="semibold">
                Népszerű szűrők
              </Text>
              
              <HStack spacing={2} flexWrap="wrap">
                {availableFilters
                  .filter(f => f.category === 'wedding')
                  .slice(0, 3)
                  .map(filter => (
                    <Badge
                      key={filter.id}
                      colorScheme="rose"
                      variant="subtle"
                      fontSize="xs"
                      px={2}
                      py={1}
                    >
                      {filter.name}
                    </Badge>
                  ))}
              </HStack>
            </VStack>
          </Box>
        )}

        {/* Active filter info */}
        {activeFilter && (
          <MotionBox
            bg="rose.500"
            color="white"
            p={3}
            borderRadius="md"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <HStack justify="space-between">
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold" fontSize="sm">
                  {activeFilter.name}
                </Text>
                <Text fontSize="xs" opacity={0.8}>
                  {activeFilter.description}
                </Text>
              </VStack>
              
              {activeFilter.premium && (
                <Badge colorScheme="gold" variant="solid">
                  Premium
                </Badge>
              )}
            </HStack>
          </MotionBox>
        )}
      </VStack>
    </MotionBox>
  );
};

export default SnapFilters;