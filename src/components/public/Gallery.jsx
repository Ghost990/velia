import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Image,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  useDisclosure,
  useToast
} from '@chakra-ui/react';
import { 
  Search, 
  Filter, 
  Heart, 
  Download, 
  Share2, 
  Calendar,
  Camera,
  Video,
  ArrowLeft,
  Grid,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useConfig } from '../../contexts/ConfigContext';
import { collection, query, orderBy, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import UploadService from '../../services/uploadService';

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { config } = useConfig();
  const location = useLocation();

  const isGalleryEnabled = config.wedding?.features?.galleryEnabled;
  const galleryDate = new Date(config.wedding?.features?.galleryVisibleAfter);
  const canViewGallery = isGalleryEnabled || Date.now() > galleryDate.getTime();

  useEffect(() => {
    if (canViewGallery) {
      fetchMedia();
    }
  }, [canViewGallery]);

  useEffect(() => {
    filterAndSortMedia();
  }, [media, searchTerm, filterType, sortBy, selectedFilter]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const mediaQuery = query(
        collection(db, 'media_uploads'),
        where('approved', '==', true),
        where('showInGallery', '==', true),
        orderBy('uploadDate', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(mediaQuery);
      const mediaData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        uploadDate: doc.data().uploadDate?.toDate()
      }));
      
      setMedia(mediaData);
    } catch (error) {
      console.error('Error fetching media:', error);
      toast({
        title: 'Hiba történt',
        description: 'Nem sikerült betölteni a galériát',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortMedia = () => {
    let filtered = [...media];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.fileType === filterType);
    }
    
    // Apply AR filter filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'with-filters') {
        filtered = filtered.filter(item => item.filterUsed);
      } else if (selectedFilter === 'no-filters') {
        filtered = filtered.filter(item => !item.filterUsed);
      } else {
        filtered = filtered.filter(item => item.filterUsed === selectedFilter);
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        case 'oldest':
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        case 'most-liked':
          return (b.likes || 0) - (a.likes || 0);
        default:
          return 0;
      }
    });
    
    setFilteredMedia(filtered);
  };

  const handleMediaClick = (mediaItem) => {
    setSelectedMedia(mediaItem);
    onOpen();
  };

  const downloadMedia = async (mediaItem) => {
    try {
      // Implementation for downloading media
      toast({
        title: 'Letöltés megkezdve',
        status: 'info',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Letöltési hiba',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const shareMedia = async (mediaItem) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${config.wedding?.couple?.bride} és ${config.wedding?.couple?.groom} esküvője`,
          text: 'Nézd meg ezt a gyönyörű esküvői fotót!',
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link másolva',
          description: 'A galéria linkje a vágólapra másolva',
          status: 'success',
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Sharing failed:', error);
    }
  };

  const handleUpload = async () => {
    const uploadFiles = location.state?.uploadFiles;
    if (!uploadFiles || uploadFiles.length === 0) return;

    try {
      setLoading(true);
      const uploadService = new UploadService(config);
      
      for (const file of uploadFiles) {
        try {
          await uploadService.uploadSingleFile(file);
        } catch (fileError) {
          console.error(`Error uploading file ${file.name}:`, fileError);
          toast({
            title: `Hiba a ${file.name} feltöltésekor`,
            description: fileError.message,
            status: 'error',
            duration: 3000,
          });
        }
      }

      toast({
        title: `${uploadFiles.length} fájl sikeresen feltöltve`,
        description: 'A képek moderáció után jelennek meg a galériában',
        status: 'success',
        duration: 3000,
      });

      // Clear the upload files from location state
      navigate('/gallery', { replace: true });
      
      // Refresh the gallery
      fetchMedia();
      
    } catch (error) {
      console.error('Error during upload process:', error);
      toast({
        title: 'Feltöltési hiba',
        description: 'Általános hiba történt a feltöltés során',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleUpload();
  }, [location.state]);

  if (!canViewGallery) {
    return (
      <Box minH="100vh" bg="linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%)">
        <Container maxW="container.lg" py={20}>
          <VStack spacing={8} textAlign="center">
            <Box fontSize="6xl">📸</Box>
            <Heading size="xl" color="gray.700">
              {t('gallery.title')}
            </Heading>
            <Text fontSize="lg" color="gray.600" maxW="md">
              {t('gallery.comingSoon')}
            </Text>
            <Button 
              leftIcon={<ArrowLeft />}
              onClick={() => navigate('/')}
              colorScheme="rose"
              size="lg"
            >
              Vissza a főoldalra
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%)">
      {/* Header */}
      <Box 
        bg="white/80" 
        backdropFilter="blur(10px)" 
        borderBottom="1px solid" 
        borderColor="rose.100"
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={4}>
          <Flex justify="space-between" align="center" mb={4}>
            <HStack spacing={4}>
              <IconButton
                icon={<ArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/')}
                aria-label="Vissza"
              />
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">
                  {t('gallery.title')}
                </Heading>
                <Text fontSize="sm" color="gray.600">
                  {filteredMedia.length} emlék
                </Text>
              </VStack>
            </HStack>
            
            <HStack spacing={2}>
              <IconButton
                icon={viewMode === 'grid' ? <List /> : <Grid />}
                variant="ghost"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                aria-label="Nézet váltás"
              />
              <Button 
                leftIcon={<Camera />}
                colorScheme="rose"
                onClick={() => navigate('/camera')}
              >
                Új fotó
              </Button>
            </HStack>
          </Flex>

          {/* Filters */}
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <Search color="gray.400" size={16} />
              </InputLeftElement>
              <Input
                placeholder="Keresés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="white"
                border="1px solid"
                borderColor="rose.200"
              />
            </InputGroup>
            
            <Select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              maxW="150px"
              bg="white"
            >
              <option value="all">Minden</option>
              <option value="photo">Fotók</option>
              <option value="video">Videók</option>
            </Select>
            
            <Select 
              value={selectedFilter} 
              onChange={(e) => setSelectedFilter(e.target.value)}
              maxW="200px"
              bg="white"
            >
              <option value="all">Minden szűrő</option>
              <option value="with-filters">Szűrőkkel</option>
              <option value="no-filters">Szűrők nélkül</option>
              <option value="wedding_crown">Menyasszonyi korona</option>
              <option value="groom_hat">Vőlegény kalap</option>
              <option value="wedding_frame">Esküvői keret</option>
              <option value="hearts_sparkles">Szívek és csillogás</option>
            </Select>
            
            <Select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              maxW="150px"
              bg="white"
            >
              <option value="newest">Legújabb</option>
              <option value="oldest">Legrégebbi</option>
              <option value="most-liked">Legtöbb szív</option>
            </Select>
          </HStack>
        </Container>
      </Box>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        {loading ? (
          <VStack spacing={4} py={20}>
            <Spinner size="xl" color="rose.500" />
            <Text color="gray.600">Galéria betöltése...</Text>
          </VStack>
        ) : filteredMedia.length === 0 ? (
          <VStack spacing={6} py={20} textAlign="center">
            <Box fontSize="4xl">📷</Box>
            <Heading size="md" color="gray.600">
              {searchTerm || filterType !== 'all' || selectedFilter !== 'all' 
                ? 'Nincs találat a keresési feltételekre'
                : t('gallery.empty')
              }
            </Heading>
            <Button 
              leftIcon={<Camera />}
              colorScheme="rose"
              onClick={() => navigate('/camera')}
            >
              Első fotó feltöltése
            </Button>
          </VStack>
        ) : (
          <SimpleGrid 
            columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 5 }} 
            spacing={4}
          >
            <AnimatePresence>
              {filteredMedia.map((mediaItem, index) => (
                <MotionBox
                  key={mediaItem.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  cursor="pointer"
                  onClick={() => handleMediaClick(mediaItem)}
                >
                  <Box
                    bg="white"
                    borderRadius="xl"
                    overflow="hidden"
                    boxShadow="sm"
                    _hover={{ boxShadow: 'md' }}
                    transition="all 0.2s"
                    position="relative"
                  >
                    {mediaItem.fileType === 'photo' ? (
                      <Image
                        src={mediaItem.optimization?.variants?.preview || mediaItem.optimizedUrl}
                        alt={mediaItem.originalFileName}
                        w="100%"
                        h="200px"
                        objectFit="cover"
                        loading="lazy"
                      />
                    ) : (
                      <Box
                        w="100%"
                        h="200px"
                        bg="gray.100"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Video size={40} color="gray.400" />
                      </Box>
                    )}
                    
                    {/* Overlay */}
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bg="linear-gradient(transparent, blackAlpha.700)"
                      p={3}
                    >
                      <HStack justify="space-between" align="end">
                        <VStack align="start" spacing={1}>
                          {mediaItem.filterUsed && (
                            <Badge 
                              colorScheme="pink" 
                              variant="solid"
                              fontSize="xs"
                            >
                              {mediaItem.filterUsed.replace('_', ' ')}
                            </Badge>
                          )}
                          <Text color="white" fontSize="xs">
                            {mediaItem.uploadDate?.toLocaleDateString('hu-HU')}
                          </Text>
                        </VStack>
                        
                        <HStack spacing={1}>
                          {mediaItem.likes && (
                            <HStack spacing={1}>
                              <Heart size={12} fill="pink" color="pink" />
                              <Text color="white" fontSize="xs">
                                {mediaItem.likes}
                              </Text>
                            </HStack>
                          )}
                        </HStack>
                      </HStack>
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </AnimatePresence>
          </SimpleGrid>
        )}
      </Container>

      {/* Media Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="6xl">
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent maxW="90vw" maxH="90vh" bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" size="lg" />
          <ModalBody p={0}>
            {selectedMedia && (
              <VStack spacing={4}>
                <Box
                  borderRadius="lg"
                  overflow="hidden"
                  maxW="100%"
                  maxH="80vh"
                  bg="white"
                >
                  {selectedMedia.fileType === 'photo' ? (
                    <Image
                      src={selectedMedia.optimizedUrl || selectedMedia.originalUrl}
                      alt={selectedMedia.originalFileName}
                      maxW="100%"
                      maxH="100%"
                      objectFit="contain"
                    />
                  ) : (
                    <video
                      src={selectedMedia.originalUrl}
                      controls
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  )}
                </Box>

                {/* Media Info */}
                <Box
                  bg="whiteAlpha.900"
                  backdropFilter="blur(10px)"
                  p={4}
                  borderRadius="lg"
                  w="100%"
                  maxW="md"
                >
                  <VStack spacing={3}>
                    <HStack justify="space-between" w="100%">
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="bold">
                          {selectedMedia.originalFileName}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                          {selectedMedia.uploadDate?.toLocaleDateString('hu-HU', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                        {selectedMedia.filterUsed && (
                          <Badge colorScheme="pink" variant="solid">
                            {selectedMedia.filterUsed.replace('_', ' ')}
                          </Badge>
                        )}
                      </VStack>
                    </HStack>

                    <HStack spacing={2} w="100%">
                      <Button
                        leftIcon={<Download />}
                        size="sm"
                        flex={1}
                        onClick={() => downloadMedia(selectedMedia)}
                      >
                        Letöltés
                      </Button>
                      <Button
                        leftIcon={<Share2 />}
                        size="sm"
                        variant="outline"
                        flex={1}
                        onClick={() => shareMedia(selectedMedia)}
                      >
                        Megosztás
                      </Button>
                    </HStack>

                    {/* Optimization info */}
                    {selectedMedia.optimization && (
                      <Box w="100%" bg="gray.50" p={3} borderRadius="md">
                        <Text fontSize="xs" color="gray.600">
                          Optimalizálva: {selectedMedia.optimization.compressionRatio}% tömörítés
                        </Text>
                      </Box>
                    )}
                  </VStack>
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Gallery;