import React from 'react';
import { SimpleGrid, Box } from '@chakra-ui/react';
import SkeletonCard from '../common/SkeletonCard';

const GallerySkeleton = () => {
  return (
    <Box data-testid="gallery-skeleton">
      <SimpleGrid columns={{ sm: 2, md: 3, lg: 4 }} spacing={6}>
        {[...Array(12)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default GallerySkeleton;
