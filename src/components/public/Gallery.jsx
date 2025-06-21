import React, { useState, useEffect, useCallback, useRef } from 'react';
import FirebaseImage from '../common/FirebaseImage';
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
  Progress,
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
  List,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useImageOptimization } from '../../hooks/useImageOptimization';
import { useConfig } from '../../contexts/ConfigContext';
import { setupDebugHelpers } from './debug-helper';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import UploadService from '../../services/uploadService';
import GallerySkeleton from './GallerySkeleton';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const MotionBox = motion(Box);
const MotionImage = motion(Image);

const Gallery = () => {
  const [media, setMedia] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isDownloading, setIsDownloading] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOptimizationModalOpen, onOpen: onOptimizationModalOpen, onClose: onOptimizationModalClose } = useDisclosure(); // For a simple optimization progress modal
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();
  const { config } = useConfig();
  const { optimizeSingle } = useImageOptimization();
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
    fetchMedia();
    // Setup debug helpers for fixing media items
    setupDebugHelpers();
  }, []);

  useEffect(() => {
    filterAndSortMedia();
  }, [media, searchTerm, filterType, sortBy, selectedFilter]);



  // Fetch all media items that match gallery criteria
  const fetchMedia = async () => {
    try {
      setLoading(true);
      // console.log('Gallery: Fetching media from Firestore');
      
      const mediaQuery = query(
        collection(db, 'media_uploads'),
        where('approved', '==', true),
        where('showInGallery', '==', true),
        orderBy('uploadDate', 'desc'),
        limit(50)
      );
      
      // console.log('Gallery: Query created', mediaQuery);
      
      const snapshot = await getDocs(mediaQuery);
      // console.log('Gallery: Got snapshot with', snapshot.docs.length, 'documents');
      
      const mediaData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          uploadDate: data.uploadDate?.toDate()
        };
      });
      
      // console.log('Gallery: Processed media data', mediaData);
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
    // console.log('filterAndSortMedia: Initial media length:', media.length, 'Filters:', { searchTerm, filterType, sortBy, selectedFilter });
    let filtered = [...media];
    
    // Apply search filter
    if (searchTerm) {
      // console.log('filterAndSortMedia: Applying search term filter:', searchTerm);
      filtered = filtered.filter(item => 
        item.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      // console.log('filterAndSortMedia: After search term filter, length:', filtered.length);
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      // console.log('filterAndSortMedia: Applying type filter:', filterType);
      filtered = filtered.filter(item => item.fileType === filterType);
      // console.log('filterAndSortMedia: After type filter, length:', filtered.length);
    }
    
    // Apply AR filter filter
    if (selectedFilter !== 'all') {
      // console.log('filterAndSortMedia: Applying selectedFilter:', selectedFilter);
      if (selectedFilter === 'with-filters') {
        filtered = filtered.filter(item => item.filterUsed);
      } else if (selectedFilter === 'no-filters') {
        filtered = filtered.filter(item => !item.filterUsed);
      } else {
        // Example: filtered = filtered.filter(item => item.someProperty === selectedFilter);
      }
      // console.log('filterAndSortMedia: After selectedFilter, length:', filtered.length);
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
    // console.log('filterAndSortMedia: After sorting, final filtered length:', filtered.length);
    setFilteredMedia(filtered);
    // console.log('filterAndSortMedia: setFilteredMedia called with:', filtered);
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

  const handleDownloadAll = async () => {
    if (filteredMedia.length === 0) {
      toast({
        title: 'Nincs letölthető kép',
        status: 'info',
        duration: 3000,
      });
      return;
    }

    setIsDownloading(true);
    const downloadToastId = toast({
      title: 'Letöltés előkészítése...',
      description: 'A képek összegyűjtése folyamatban.',
      status: 'loading',
      duration: null,
      isClosable: false,
    });

    const zip = new JSZip();
    let filesToZip = 0;

    try {
      await Promise.all(
        filteredMedia.map(async (mediaItem) => {
          const url = mediaItem.originalUrl || mediaItem.optimizedUrl;
          if (!url) {
            console.warn('Skipping media item with no URL:', mediaItem.id);
            return;
          }
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch ${url}`);
            }
            const blob = await response.blob();
            const fileName = mediaItem.originalFileName || `${mediaItem.id}.jpg`;
            zip.file(fileName, blob);
            filesToZip++;
          } catch (fetchError) {
            console.error(`Could not fetch ${url}:`, fetchError);
          }
        })
      );

      if (filesToZip === 0) {
        throw new Error('Egyetlen képet sem sikerült letölteni.');
      }
      
      toast.update(downloadToastId, {
        title: `Tömörítés (${filesToZip} kép)...`,
        description: 'Ez eltarthat egy ideig. Kérlek, ne zárd be az ablakot.',
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const brideName = config.wedding?.couple?.bride || 'gallery';
      const groomName = config.wedding?.couple?.groom || 'download';
      const date = new Date().toISOString().split('T')[0];
      saveAs(zipBlob, `${brideName}-${groomName}-gallery-${date}.zip`);

      toast.close(downloadToastId);
      toast({
        title: 'Letöltés elindítva!',
        status: 'success',
        duration: 4000,
      });
    } catch (error) {
      toast.close(downloadToastId);
      toast({
        title: 'Hiba történt a letöltés során',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // File input reference for upload button
  const fileInputRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isOptimizingGalleryFile, setIsOptimizingGalleryFile] = useState(false);
  const [currentOptimizingFileName, setCurrentOptimizingFileName] = useState('');

  // Handle file drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, []);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Process files for upload
  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      toast({
        title: 'Nem támogatott fájltípus',
        description: 'Csak kép és videó fájlokat tölthetsz fel',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    await uploadFiles(validFiles);
  };

  // Handle upload button click
  const handleUploadButtonClick = () => {
    fileInputRef.current?.click();
  };

  // Upload files with progress tracking
  const uploadFiles = async (filesRaw) => {
    if (!filesRaw || filesRaw.length === 0) return;

    setIsOptimizingGalleryFile(true);
    onOptimizationModalOpen();
    const filesToProcess = Array.from(filesRaw);
    const processedFiles = [];

    for (const file of filesToProcess) {
      setCurrentOptimizingFileName(file.name);
      if (file.type.startsWith('image/')) {
        try {
          // console.log(`Optimizing image: ${file.name}`);
          const optimizationResult = await optimizeSingle(file); // From useImageOptimization
          processedFiles.push(optimizationResult.optimized); // Ensure 'optimized' is the File object
          // console.log(`Optimized ${file.name}, new size: ${optimizationResult.optimized.size}`);
        } catch (optError) {
          console.error(`Error optimizing file ${file.name}:`, optError);
          toast({
            title: `Hiba az ${file.name} optimalizálásakor`,
            description: optError.message,
            status: 'error',
            duration: 3000,
          });
          // Optionally, upload original if optimization fails, or skip
          // processedFiles.push(file); // Uncomment to upload original on error
        }
      } else {
        processedFiles.push(file); // Add videos and other non-image files as is
      }
    }
    setCurrentOptimizingFileName('');
    setIsOptimizingGalleryFile(false);
    onOptimizationModalClose();

    if (processedFiles.length === 0) {
      toast({
        title: 'Nincs feltölthető fájl',
        description: 'Nem maradt fájl a feldolgozás után, vagy hiba történt az optimalizálás során.',
        status: 'info',
        duration: 4000,
      });
      setIsUploading(false); // Reset uploading state if nothing to upload
      setUploadProgress(0);
      return;
    }

    // Original function continues from here, using 'processedFiles' instead of 'files'

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const uploadService = new UploadService(config);
      
      // Use the uploadFiles method with progress tracking
      const results = await uploadService.uploadFiles(
        processedFiles,
        (progress) => {
          setUploadProgress(progress);
        },
        (file, result, error) => {
          if (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast({
              title: `Hiba a ${file.name} feltöltésekor`,
              description: error.message,
              status: 'error',
              duration: 3000,
            });
          }
        }
      );

      const successCount = results.filter(r => r.success).length;
      
      toast({
        title: `${successCount} fájl sikeresen feltöltve`,
        description: 'A képek moderáció után jelennek meg a galériában',
        status: 'success',
        duration: 3000,
      });
      
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
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Legacy upload handler for navigation state
  const handleLegacyUpload = async () => {
    const filesToUpload = location.state?.uploadFiles;
    if (filesToUpload && filesToUpload.length > 0) {
      await uploadFiles(filesToUpload);
      // Clear the upload files from location state
      navigate('/gallery', { replace: true });
    }
  };

  useEffect(() => {
    handleLegacyUpload();
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
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%)"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
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
              <HStack spacing={2}>
                <Button 
                  leftIcon={<Camera />}
                  colorScheme="rose"
                  onClick={() => navigate('/camera')}
                >
                  Új fotó
                </Button>
                <Button
                  leftIcon={<Upload />}
                  colorScheme="purple"
                  onClick={handleUploadButtonClick}
                  isLoading={isUploading}
                  loadingText={`${Math.round(uploadProgress)}%`}
                >
                  Feltöltés
                </Button>
                <Button
                  leftIcon={<Download />}
                  colorScheme="green"
                  onClick={handleDownloadAll}
                  isLoading={isDownloading}
                  loadingText="Tömörítés..."
                  isDisabled={filteredMedia.length === 0}
                >
                  Összes letöltése
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                  multiple
                  accept="image/*,video/*"
                />
              </HStack>
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

      {/* Optimization Progress Modal */}
      <Modal isOpen={isOptimizationModalOpen} onClose={() => {}} isCentered closeOnOverlayClick={false} trapFocus={false}>
        <ModalOverlay bg="blackAlpha.600" />
        <ModalContent mx={4}>
          <ModalBody p={6}>
            <VStack spacing={5} textAlign="center">
              <Spinner size="xl" color="rose.500" thickness="4px" speed="0.65s" />
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">Optimalizálás folyamatban...</Text>
              {currentOptimizingFileName && 
                <Text fontSize="sm" color="gray.600" noOfLines={1} title={currentOptimizingFileName}>
                  Fájl: {currentOptimizingFileName}
                </Text>
              }
              <Text fontSize="xs" color="gray.500">Ez eltarthat egy kis ideig, kérlek várj.</Text>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Content */}
      <Container maxW="container.xl" py={8}>
        {loading ? (
          <GallerySkeleton />
        ) : (
          <>
            {/* Drag & Drop Overlay */}
            {dragActive && (
              <Box
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bg="blackAlpha.600"
                backdropFilter="blur(5px)"
                zIndex={1000}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
              >
                <Box
                  bg="white"
                  p={10}
                  borderRadius="xl"
                  boxShadow="xl"
                  textAlign="center"
                  maxW="md"
                  w="full"
                >
                  <VStack spacing={6}>
                    <Box fontSize="5xl">📸</Box>
                    <Heading size="lg">Húzd ide a képeket</Heading>
                    <Text color="gray.600">Engedd el a képeket a feltöltéshez</Text>
                  </VStack>
                </Box>
              </Box>
            )}
            
            {/* Upload Progress */}
            {isUploading && (
              <Box mb={6} bg="white" p={4} borderRadius="lg" boxShadow="sm">
                <VStack spacing={3} align="stretch">
                  <HStack justify="space-between">
                    <Text fontWeight="medium">Feltöltés folyamatban...</Text>
                    <Text>{Math.round(uploadProgress)}%</Text>
                  </HStack>
                  <Progress
                    value={uploadProgress}
                    size="sm"
                    colorScheme="rose"
                    borderRadius="full"
                  />
                </VStack>
              </Box>
            )}
            
            {filteredMedia.length === 0 ? (
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
                  {filteredMedia.map((mediaItem, index) => {
                    const pathToLog = mediaItem.optimization?.variants?.preview || mediaItem.optimizedUrl;
                    if (!pathToLog) {
                      // Placeholder rendering
                      return (
                        <MotionBox
                          key={`${mediaItem.id}-placeholder`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                        >
                          <Box
                            bg="gray.100"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="sm"
                            h="280px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Text color="gray.500">Image Unavailable</Text>
                          </Box>
                        </MotionBox>
                      );
                    } else {
                      // Actual image rendering with FirebaseImage
                      return (
                        <MotionBox
                          key={mediaItem.id}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          cursor="pointer"
                          onClick={() => handleMediaClick(mediaItem)}
                          className="group" // For potential group hover effects
                        >
                          <Box
                            bg="white"
                            borderRadius="xl"
                            overflow="hidden"
                            boxShadow="sm"
                            _hover={{ boxShadow: 'md' }}
                            transition="all 0.2s"
                            position="relative"
                            h="280px"
                          >
                            <FirebaseImage
                              storagePath={pathToLog}
                              imageProps={{
                                w: '100%',
                                h: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <Box
                              position="absolute"
                              bottom="0"
                              left="0"
                              right="0"
                              bg="rgba(0,0,0,0.7)"
                              color="white"
                              p={2}
                              opacity={0}
                              _groupHover={{ opacity: 1 }} // Show on parent MotionBox hover
                              transition="opacity 0.3s ease-in-out"
                            >
                              <Text fontSize="sm" fontWeight="semibold" noOfLines={1}>
                                {mediaItem.originalFileName || mediaItem.fileName || 'Untitled'}
                              </Text>
                              {mediaItem.uploadDate?.seconds && (
                                <Text fontSize="xs">
                                  {new Date(mediaItem.uploadDate.seconds * 1000).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                                </Text>
                              )}
                            </Box>
                          </Box>
                        </MotionBox>
                      );
                    }

                  })}
                </AnimatePresence>
              </SimpleGrid>
            )}
          </>
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
                  {selectedMedia.fileType === 'image' ? (
                    <FirebaseImage
                      storagePath={selectedMedia.optimizedUrl || selectedMedia.originalUrl}
                      imageProps={{
                        alt: selectedMedia.originalFileName,
                        maxW: "100%",
                        maxH: "100%",
                        objectFit: "contain",
                        borderRadius: "md"
                      }}
                    />
                  ) : (
                    <video
                      src={selectedMedia.originalUrl}
                      controls
                      style={{ maxWidth: '100%', maxHeight: '80vh' }}
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