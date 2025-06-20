import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Image,
  Badge,
  Card,
  CardBody,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  Input,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { 
  Check, 
  X, 
  Eye, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { db } from '../../services/firebase'; // Corrected path to Firebase config
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const MotionCard = motion(Card);

const MediaModeration = () => {
  console.log('MediaModeration component rendering');
  const [pendingMedia, setPendingMedia] = useState([]);
  const [approvedMedia, setApprovedMedia] = useState([]);
  const [rejectedMedia, setRejectedMedia] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { t } = useTranslation();

  // Mock data - replace with Firebase queries
  useEffect(() => {
    loadPendingMedia();
    loadApprovedMedia();
    loadRejectedMedia();
  }, []);

  const loadPendingMedia = async () => {
    try {
      const q = query(
        collection(db, 'media_uploads'),
        where('approved', '==', false),
        // Consider adding another where clause for 'rejected', '==', false if you have that field
        // Or, if items are only ever 'pending' or 'approved' or 'rejected', this might be enough.
        // For now, let's assume 'approved: false' means it's pending and not explicitly rejected yet.
      );
      const querySnapshot = await getDocs(q);
      console.log('loadPendingMedia - querySnapshot.docs:', querySnapshot.docs.length, querySnapshot.docs);
      const pendingItems = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        uploadDate: docSnap.data().uploadDate?.toDate ? docSnap.data().uploadDate.toDate() : new Date(docSnap.data().uploadDate) // Handle both Timestamp and string/number dates
      }));
      console.log('loadPendingMedia - pendingItems:', pendingItems);
      setPendingMedia(pendingItems);
    } catch (error) {
      console.error('Error loading pending media:', error);
      toast({
        title: 'Hiba a függőben lévő média betöltésekor',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    // Mock data was previously here

  };

  const loadApprovedMedia = async () => {
    try {
      const q = query(
        collection(db, 'media_uploads'),
        where('approved', '==', true)
      );
      const querySnapshot = await getDocs(q);
      console.log('loadApprovedMedia - querySnapshot.docs:', querySnapshot.docs.length, querySnapshot.docs);
      const approvedItems = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        uploadDate: docSnap.data().uploadDate?.toDate ? docSnap.data().uploadDate.toDate() : new Date(docSnap.data().uploadDate)
      }));
      console.log('loadApprovedMedia - approvedItems:', approvedItems);
      setApprovedMedia(approvedItems);
    } catch (error) {
      console.error('Error loading approved media:', error);
      toast({
        title: 'Hiba a jóváhagyott média betöltésekor',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    // Mock data was previously here

  };

  const loadRejectedMedia = async () => {
    try {
      const q = query(
        collection(db, 'media_uploads'),
        where('rejected', '==', true) // Assuming you have a 'rejected' field
      );
      const querySnapshot = await getDocs(q);
      console.log('loadRejectedMedia - querySnapshot.docs:', querySnapshot.docs.length, querySnapshot.docs);
      const rejectedItems = querySnapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data(),
        uploadDate: docSnap.data().uploadDate?.toDate ? docSnap.data().uploadDate.toDate() : new Date(docSnap.data().uploadDate)
      }));
      console.log('loadRejectedMedia - rejectedItems:', rejectedItems);
      setRejectedMedia(rejectedItems);
    } catch (error) {
      console.error('Error loading rejected media:', error);
      toast({
        title: 'Hiba az elutasított média betöltésekor',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    // Original mock data:
    // setRejectedMedia([]);
  };

  const approveMedia = async (mediaId) => {
    try {
      const mediaRef = doc(db, 'media_uploads', mediaId);
      await updateDoc(mediaRef, {
        approved: true,
        rejected: false, // Explicitly set rejected to false
        showInGallery: true,
        status: 'approved' // Optional: maintain a status field
      });

      // Refresh lists
      loadPendingMedia();
      loadApprovedMedia();
        
      toast({
        title: 'Jóváhagyva',
        description: 'A tartalom megjelenik a galériában.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error approving media:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült jóváhagyni a tartalmat',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const rejectMedia = async (mediaId) => {
    try {
      const mediaRef = doc(db, 'media_uploads', mediaId);
      await updateDoc(mediaRef, {
        approved: false,
        rejected: true,
        showInGallery: false,
        status: 'rejected' // Optional: maintain a status field
      });

      // Refresh lists
      loadPendingMedia();
      loadRejectedMedia();
        
      toast({
        title: 'Elutasítva',
        description: 'A tartalom nem jelenik meg a galériában.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error rejecting media:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült elutasítani a tartalmat',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const deleteMedia = async (mediaId, category) => {
    try {
      const mediaRef = doc(db, 'media_uploads', mediaId);
      await deleteDoc(mediaRef);

      // Refresh the appropriate list
      if (category === 'approved') {
        loadApprovedMedia();
      } else if (category === 'rejected') {
        loadRejectedMedia();
      } else if (category === 'pending') { // If deleting from pending for some reason
        loadPendingMedia();
      }
      // Note: Consider also deleting from Firebase Storage here if needed.

      toast({
        title: 'Törölve',
        description: 'A tartalom véglegesen törölve lett.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error deleting media:', error);
      toast({
        title: 'Hiba',
        description: 'Nem sikerült törölni a tartalmat',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const openMediaModal = (media) => {
    setSelectedMedia(media);
    onOpen();
  };

  const MediaCard = ({ media, showActions = false, category = null }) => (
    <MotionCard
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      cursor="pointer"
      onClick={() => openMediaModal(media)}
    >
      <CardBody p={4}>
        <VStack spacing={3} align="stretch">
          {/* Preview */}
          <Box
            w="100%"
            h="150px"
            borderRadius="md"
            overflow="hidden"
            bg="gray.100"
            position="relative"
          >
            {media.fileType === 'image' ? (
              <Image
                src={media.thumbnailUrl}
                alt={media.fileName}
                w="100%"
                h="100%"
                objectFit="cover"
              />
            ) : (
              <Box
                w="100%"
                h="100%"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="gray.200"
              >
                <Text color="gray.600">📹 Videó</Text>
              </Box>
            )}
            
            {media.filterUsed && (
              <Badge
                position="absolute"
                top={2}
                right={2}
                colorScheme="pink"
                variant="solid"
                fontSize="xs"
              >
                {media.filterUsed.replace('_', ' ')}
              </Badge>
            )}
          </Box>

          {/* Info */}
          <VStack spacing={2} align="stretch">
            <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
              {media.fileName}
            </Text>
            
            <HStack justify="space-between" fontSize="xs" color="gray.600">
              <HStack spacing={1}>
                <User size={12} />
                <Text>{media.userEmail}</Text>
              </HStack>
              <HStack spacing={1}>
                <Calendar size={12} />
                <Text>{media.uploadDate.toLocaleDateString('hu-HU')}</Text>
              </HStack>
            </HStack>

            {media.optimization && (
              <Text fontSize="xs" color="green.600">
                {media.optimization.compressionRatio} tömörítés
              </Text>
            )}
          </VStack>

          {/* Actions */}
          {showActions && (
            <HStack spacing={2}>
              <Button
                size="sm"
                colorScheme="green"
                leftIcon={<Check size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  approveMedia(media.id);
                }}
                flex={1}
              >
                Jóváhagy
              </Button>
              <Button
                size="sm"
                colorScheme="red"
                leftIcon={<X size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  rejectMedia(media.id);
                }}
                flex={1}
              >
                Elutasít
              </Button>
            </HStack>
          )}

          {category && (
            <HStack justify="space-between">
              <Button
                size="sm"
                leftIcon={<Eye size={14} />}
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  openMediaModal(media);
                }}
              >
                Megtekint
              </Button>
              <IconButton
                size="sm"
                colorScheme="red"
                variant="ghost"
                icon={<Trash2 size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMedia(media.id, category);
                }}
                aria-label="Törlés"
              />
            </HStack>
          )}
        </VStack>
      </CardBody>
    </MotionCard>
  );

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg">Tartalom moderálás</Heading>
            <Text color="gray.600">
              {pendingMedia.length} jóváhagyásra vár
            </Text>
          </VStack>
          
          {/* Filters */}
          <HStack spacing={4}>
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <Search color="gray.400" size={16} />
              </InputLeftElement>
              <Input
                placeholder="Keresés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <Select maxW="150px" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">Minden</option>
              <option value="photo">Fotók</option>
              <option value="video">Videók</option>
            </Select>
          </HStack>
        </HStack>

        {/* Tabs */}
        <Tabs colorScheme="purple">
          <TabList>
            <Tab>
              Függőben ({pendingMedia.length})
            </Tab>
            <Tab>
              Jóváhagyott ({approvedMedia.length})
            </Tab>
            <Tab>
              Elutasított ({rejectedMedia.length})
            </Tab>
          </TabList>

          <TabPanels>
            {/* Pending */}
            <TabPanel px={0}>
              {pendingMedia.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="gray.600">Nincs jóváhagyásra váró tartalom</Text>
                </Box>
              ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
                  {pendingMedia.map((media) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      showActions={true}
                    />
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Approved */}
            <TabPanel px={0}>
              {approvedMedia.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="gray.600">Nincs jóváhagyott tartalom</Text>
                </Box>
              ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
                  {approvedMedia.map((media) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      category="approved"
                    />
                  ))}
                </Grid>
              )}
            </TabPanel>

            {/* Rejected */}
            <TabPanel px={0}>
              {rejectedMedia.length === 0 ? (
                <Box textAlign="center" py={12}>
                  <Text color="gray.600">Nincs elutasított tartalom</Text>
                </Box>
              ) : (
                <Grid templateColumns="repeat(auto-fill, minmax(280px, 1fr))" gap={6}>
                  {rejectedMedia.map((media) => (
                    <MediaCard
                      key={media.id}
                      media={media}
                      category="rejected"
                    />
                  ))}
                </Grid>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Media Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Tartalom részletek</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedMedia && (
              <VStack spacing={4} align="stretch">
                {/* Media Preview */}
                <Box
                  w="100%"
                  maxH="400px"
                  borderRadius="md"
                  overflow="hidden"
                  bg="gray.100"
                >
                  {selectedMedia.fileType === 'image' ? (
                    <Image
                      src={selectedMedia.url}
                      alt={selectedMedia.fileName}
                      w="100%"
                      maxH="400px"
                      objectFit="contain"
                    />
                  ) : (
                    <Box
                      w="100%"
                      h="300px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg="gray.200"
                    >
                      <Text color="gray.600">📹 Videó előnézet</Text>
                    </Box>
                  )}
                </Box>

                {/* Media Info */}
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Fájlnév</Text>
                    <Text fontWeight="medium">{selectedMedia.fileName}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Típus</Text>
                    <Text fontWeight="medium">{selectedMedia.fileType}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Feltöltő</Text>
                    <Text fontWeight="medium">{selectedMedia.userEmail}</Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">Dátum</Text>
                    <Text fontWeight="medium">
                      {selectedMedia.uploadDate.toLocaleDateString('hu-HU')}
                    </Text>
                  </Box>
                  {selectedMedia.filterUsed && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">Szűrő</Text>
                      <Badge colorScheme="pink" variant="solid">
                        {selectedMedia.filterUsed.replace('_', ' ')}
                      </Badge>
                    </Box>
                  )}
                  {selectedMedia.optimization && (
                    <Box>
                      <Text fontSize="sm" color="gray.600">Optimalizálás</Text>
                      <Text fontWeight="medium" color="green.600">
                        {selectedMedia.optimization.compressionRatio} tömörítés
                      </Text>
                    </Box>
                  )}
                </Grid>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Bezárás
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MediaModeration;