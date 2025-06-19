import React from 'react';
import {
  Box,
  VStack,
  Text,
  IconButton,
  Badge
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

const FilterButton = ({ filter, isActive, onClick }) => {
  const getFilterIcon = (filterId) => {
    const icons = {
      none: '✨',
      wedding_crown: '👑',
      groom_hat: '🎩',
      wedding_frame: '🖼️',
      hearts_sparkles: '💖'
    };
    return icons[filterId] || '🎭';
  };

  return (
    <MotionBox
      as="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      <VStack spacing={2} align="center">
        <Box
          w={16}
          h={16}
          borderRadius="xl"
          bg={isActive ? 'rose.500' : 'whiteAlpha.200'}
          border="2px solid"
          borderColor={isActive ? 'rose.400' : 'transparent'}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="2xl"
          position="relative"
          _hover={{
            bg: isActive ? 'rose.600' : 'whiteAlpha.300',
          }}
          transition="all 0.2s"
        >
          {getFilterIcon(filter.id)}
          
          {filter.premium && (
            <Badge
              position="absolute"
              top="-2"
              right="-2"
              colorScheme="gold"
              variant="solid"
              fontSize="xs"
              px={1}
            >
              ✨
            </Badge>
          )}

          {isActive && (
            <Box
              position="absolute"
              inset={-1}
              borderRadius="xl"
              border="2px solid"
              borderColor="rose.400"
              animation="pulse 2s infinite"
            />
          )}
        </Box>

        <Text
          color="white"
          fontSize="xs"
          fontWeight="medium"
          textAlign="center"
          lineHeight="tight"
          maxW="16"
          noOfLines={2}
        >
          {filter.name}
        </Text>
      </VStack>
    </MotionBox>
  );
};

export default FilterButton;