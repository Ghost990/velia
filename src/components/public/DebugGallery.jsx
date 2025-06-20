import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  VStack, 
  HStack, 
  Image,
  Code,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Divider
} from '@chakra-ui/react';

const DebugGallery = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllMedia();
  }, []);

  const fetchAllMedia = async () => {
    try {
      setLoading(true);
      console.log('DebugGallery: Fetching ALL media from Firestore');
      
      const allMediaQuery = query(
        collection(db, 'media_uploads'),
        orderBy('uploadDate', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(allMediaQuery);
      console.log('DebugGallery: Got snapshot with', snapshot.docs.length, 'documents');
      
      if (snapshot.docs.length === 0) {
        setError('No media documents found in Firestore');
      }
      
      const allMediaData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate?.toDate()
        };
      });
      
      console.log('DebugGallery: Processed media data', allMediaData);
      setMediaItems(allMediaData);
    } catch (error) {
      console.error('Error fetching media:', error);
      setError(`Error fetching media: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fixAllItems = async () => {
    try {
      console.log('Fixing all media items...');
      let fixedCount = 0;
      
      for (const item of mediaItems) {
        try {
          const docRef = doc(db, 'media_uploads', item.id);
          await updateDoc(docRef, {
            approved: true,
            showInGallery: true
          });
          console.log(`✅ Fixed item ${item.id}`);
          fixedCount++;
        } catch (err) {
          console.error(`❌ Failed to fix item ${item.id}:`, err);
        }
      }
      
      console.log(`Done fixing ${fixedCount}/${mediaItems.length} media items.`);
      alert(`Fixed ${fixedCount} items. Refreshing data...`);
      fetchAllMedia();
    } catch (error) {
      console.error('Error fixing items:', error);
      alert(`Error fixing items: ${error.message}`);
    }
  };

  if (loading) {
    return <Box p={8}><Text>Loading media items...</Text></Box>;
  }

  if (error) {
    return (
      <Box p={8}>
        <Heading size="md" mb={4}>Error</Heading>
        <Text color="red.500">{error}</Text>
        <Button mt={4} onClick={fetchAllMedia}>Try Again</Button>
      </Box>
    );
  }

  return (
    <Box p={8}>
      <Heading mb={4}>Debug Gallery</Heading>
      <Text mb={4}>Found {mediaItems.length} media items in Firestore</Text>
      
      <Button 
        colorScheme="blue" 
        mb={6} 
        onClick={fixAllItems}
      >
        Fix All Items (Set approved=true, showInGallery=true)
      </Button>
      
      <Divider mb={6} />
      
      <VStack spacing={8} align="stretch">
        {mediaItems.map(item => (
          <Box 
            key={item.id} 
            p={4} 
            borderWidth="1px" 
            borderRadius="md" 
            shadow="sm"
          >
            <HStack mb={4} justify="space-between">
              <Heading size="sm">{item.originalFileName || 'Unnamed File'}</Heading>
              <HStack>
                <Badge colorScheme={item.approved ? "green" : "red"}>
                  {item.approved ? "Approved" : "Not Approved"}
                </Badge>
                <Badge colorScheme={item.showInGallery ? "green" : "red"}>
                  {item.showInGallery ? "In Gallery" : "Hidden"}
                </Badge>
              </HStack>
            </HStack>
            
            {item.originalUrl && (
              <Box mb={4}>
                <Text fontWeight="bold" mb={2}>Original Image:</Text>
                <Image 
                  src={item.originalUrl} 
                  alt={item.originalFileName}
                  maxH="200px"
                  objectFit="contain"
                  border="1px solid"
                  borderColor="gray.200"
                  p={2}
                  mb={2}
                />
                <Code p={2} fontSize="xs" width="100%" overflowX="auto" display="block">
                  {item.originalUrl}
                </Code>
              </Box>
            )}
            
            {item.optimizedUrl && item.optimizedUrl !== item.originalUrl && (
              <Box mb={4}>
                <Text fontWeight="bold" mb={2}>Optimized Image:</Text>
                <Image 
                  src={item.optimizedUrl} 
                  alt={`Optimized ${item.originalFileName}`}
                  maxH="200px"
                  objectFit="contain"
                  border="1px solid"
                  borderColor="gray.200"
                  p={2}
                  mb={2}
                />
                <Code p={2} fontSize="xs" width="100%" overflowX="auto" display="block">
                  {item.optimizedUrl}
                </Code>
              </Box>
            )}
            
            <Accordion allowToggle mt={4}>
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Document Details
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack align="stretch" spacing={2}>
                    <HStack>
                      <Text fontWeight="bold" width="120px">Document ID:</Text>
                      <Text>{item.id}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" width="120px">File Type:</Text>
                      <Text>{item.fileType || 'unknown'}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="bold" width="120px">Upload Date:</Text>
                      <Text>{item.uploadDate?.toLocaleString() || 'unknown'}</Text>
                    </HStack>
                    {item.optimization?.variants?.preview && (
                      <Box>
                        <Text fontWeight="bold">Preview Variant:</Text>
                        <Code p={2} fontSize="xs" width="100%" overflowX="auto" display="block">
                          {item.optimization.variants.preview}
                        </Code>
                      </Box>
                    )}
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default DebugGallery;
