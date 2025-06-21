import React from 'react';
import { Box, Skeleton } from '@chakra-ui/react';

const SkeletonCard = () => {
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
    >
      <Skeleton height="200px" />
      <Box p="4">
        <Skeleton height="20px" width="80%" />
        <Skeleton height="20px" width="50%" mt="2" />
      </Box>
    </Box>
  );
};

export default SkeletonCard;
