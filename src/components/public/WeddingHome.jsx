import React from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Image,
  HStack,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { Camera, Heart, Images } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useConfig } from '../../contexts/ConfigContext';
import { useAuth } from '../../contexts/AuthContext';

const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

const WeddingHome = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { config } = useConfig();
  const { loginAsDevAdmin } = useAuth();
  const bride = config.wedding?.couple?.bride || 'Anna';
  const groom = config.wedding?.couple?.groom || 'Péter';
  const hashtag = config.wedding?.social?.hashtag || '#Esküvő2024';

  const bgGradient = useColorModeValue(
    'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #f3e8ff 100%)',
    'linear-gradient(135deg, #1a1625 0%, #2d1b69 50%, #0f0a19 100%)'
  );

  const galleryEnabled = config.wedding?.features?.galleryEnabled;
  const galleryDate = new Date(config.wedding?.features?.galleryVisibleAfter);
  const canViewGallery = galleryEnabled || Date.now() > galleryDate.getTime();

  return (
    <Box
      minH="100vh"
      background={bgGradient}
      position="relative"
      overflow="hidden"
    >
      {/* Decorative elements */}
      <Box
        position="absolute"
        top="10%"
        left="5%"
        opacity={0.1}
        transform="rotate(-15deg)"
      >
        <Icon as={Heart} boxSize={20} color="rose.400" />
      </Box>
      <Box
        position="absolute"
        bottom="15%"
        right="8%"
        opacity={0.1}
        transform="rotate(25deg)"
      >
        <Icon as={Heart} boxSize={16} color="rose.300" />
      </Box>

      <Container maxW="container.lg" pt={20} pb={10}>
        <MotionVStack
          spacing={8}
          align="center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Wedding rings illustration */}
          <MotionBox
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <VStack spacing={4}>
              <Box position="relative">
                <Text fontSize="6xl" color="gold.400">💍</Text>
                <Text 
                  fontSize="4xl" 
                  color="gold.500" 
                  position="absolute" 
                  top="0" 
                  right="-10px"
                  transform="rotate(15deg)"
                >
                  💍
                </Text>
              </Box>
            </VStack>
          </MotionBox>

          {/* Title */}
          <VStack spacing={4} textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, rose.400, rose.600, gold.400)"
              bgClip="text"
              fontWeight="bold"
              lineHeight="shorter"
              fontFamily="'Great Vibes', cursive"
              fontSize={{ base: "4xl", md: "5xl", lg: "6xl" }}
            >
              {t('welcome.title', { bride, groom }).split('\n').map((line, index) => (
                <React.Fragment key={index}>
                  {line}
                  {index < t('welcome.title', { bride, groom }).split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </Heading>
            
            <Text
              fontSize={{ base: "lg", md: "xl" }}
              color="gray.600"
              maxW="2xl"
              lineHeight="tall"
              fontFamily="'Playfair Display', serif"
              fontWeight="400"
              textAlign="center"
              px={4}
            >
              {t('welcome.subtitle')}
            </Text>

            {config.wedding?.social?.showHashtag && (
              <Text
                fontSize={{ base: "xl", md: "2xl" }}
                color="rose.500"
                fontWeight="semibold"
                mt={2}
                fontFamily="'Dancing Script', cursive"
              >
                {hashtag}
              </Text>
            )}
          </VStack>

          {/* Action buttons */}
          <MotionVStack
            spacing={4}
            w="100%"
            maxW="sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              size="lg"
              variant="wedding"
              w="100%"
              leftIcon={<Icon as={Camera} />}
              onClick={() => navigate('/camera')}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'xl',
              }}
              transition="all 0.2s"
              fontFamily="'Inter', sans-serif"
              fontWeight="500"
            >
              {t('welcome.startButton')}
            </Button>

            <Button
              size="lg"
              variant="outline"
              colorScheme="rose"
              w="100%"
              leftIcon={<Icon as={Images} />}
              onClick={() => navigate('/gallery')}
              isDisabled={!canViewGallery}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
              fontFamily="'Inter', sans-serif"
              fontWeight="500"
            >
              {t('welcome.galleryButton')}
            </Button>
          </MotionVStack>

          {/* Mobile Upload Link */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            textAlign="center"
          >
            <VStack spacing={2}>
              <Text
                as="button"
                fontSize="md"
                color="rose.600"
                fontWeight="600"
                textDecoration="underline"
                cursor="pointer"
                _hover={{
                  color: "rose.700",
                  transform: "scale(1.05)"
                }}
                transition="all 0.2s"
                fontFamily="'Inter', sans-serif"
                onClick={() => {
                  // Create a file input element for mobile upload
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.multiple = true;
                  input.capture = 'environment'; // Use rear camera on mobile
                  input.onchange = (e) => {
                    const files = Array.from(e.target.files);
                    if (files.length > 0) {
                      // Navigate to gallery with upload mode
                      navigate('/gallery', { state: { uploadFiles: files } });
                    }
                  };
                  input.click();
                }}
              >
                {t('welcome.mobileUpload')}
              </Text>
              <Text
                fontSize="sm"
                color="gray.500"
                fontStyle="italic"
                fontFamily="'Inter', sans-serif"
              >
                {t('welcome.mobileUploadDesc')}
              </Text>
            </VStack>
          </MotionBox>

          {/* Info text */}
          {!canViewGallery && (
            <Text
              fontSize="sm"
              color="gray.500"
              textAlign="center"
              fontStyle="italic"
              fontFamily="'Inter', sans-serif"
            >
              {t('gallery.comingSoon')}
            </Text>
          )}

          {/* Admin Access Link */}
          <Text
            fontSize="sm"
            color="gray.600"
            textDecoration="underline"
            cursor="pointer"
            _hover={{ color: "gray.800", transform: "scale(1.05)" }}
            onClick={() => {
              loginAsDevAdmin();
              navigate('/admin/dashboard');
            }}
            position="relative"
            bottom="20px"
            right="20px"
            bg="white"
            px={3}
            py={1}
            borderRadius="md"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
            transition="all 0.2s"
            zIndex={9000}
          >
            🔧 Admin
          </Text>
        </MotionVStack>
      </Container>
    </Box>
  );
};

export default WeddingHome;