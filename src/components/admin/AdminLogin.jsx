import React, { useState } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Text,
  Image,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { Eye, EyeOff, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const MotionBox = motion(Box);

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      setError('Hibás email vagy jelszó');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
    >
      <Container maxW="md">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            p={8}
            border="1px solid"
            borderColor="gray.100"
          >
            <VStack spacing={6}>
              {/* Logo/Icon */}
              <Box
                w={16}
                h={16}
                bg="linear-gradient(135deg, #667eea, #764ba2)"
                borderRadius="xl"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="lg"
              >
                <Lock color="white" size={32} />
              </Box>

              {/* Header */}
              <VStack spacing={2} textAlign="center">
                <Heading size="lg" color="gray.800">
                  {t('admin.login')}
                </Heading>
                <Text color="gray.600" fontSize="sm">
                  Adminisztrátori hozzáférés
                </Text>
              </VStack>

              {/* Error Alert */}
              {error && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error}
                </Alert>
              )}

              {/* Form */}
              <Box as="form" onSubmit={handleSubmit} w="100%">
                <VStack spacing={4}>
                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontSize="sm" fontWeight="medium">
                      Email cím
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@example.com"
                        bg="gray.50"
                        border="2px solid transparent"
                        _hover={{ borderColor: 'gray.200' }}
                        _focus={{ 
                          borderColor: 'purple.400',
                          bg: 'white',
                          boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.6)'
                        }}
                        size="lg"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel color="gray.700" fontSize="sm" fontWeight="medium">
                      Jelszó
                    </FormLabel>
                    <InputGroup>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        bg="gray.50"
                        border="2px solid transparent"
                        _hover={{ borderColor: 'gray.200' }}
                        _focus={{ 
                          borderColor: 'purple.400',
                          bg: 'white',
                          boxShadow: '0 0 0 1px rgba(102, 126, 234, 0.6)'
                        }}
                        size="lg"
                      />
                      <InputRightElement h="full">
                        <IconButton
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                          icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          aria-label={showPassword ? 'Jelszó elrejtése' : 'Jelszó mutatása'}
                        />
                      </InputRightElement>
                    </InputGroup>
                  </FormControl>

                  <Button
                    type="submit"
                    size="lg"
                    w="100%"
                    bg="linear-gradient(135deg, #667eea, #764ba2)"
                    color="white"
                    _hover={{
                      bg: "linear-gradient(135deg, #5a67d8, #6b46c1)",
                      transform: 'translateY(-1px)',
                      boxShadow: 'lg'
                    }}
                    _active={{
                      transform: 'translateY(0)'
                    }}
                    isLoading={loading}
                    loadingText="Belépés..."
                    transition="all 0.2s"
                  >
                    Belépés
                  </Button>
                </VStack>
              </Box>

              {/* Footer */}
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Csak adminisztrátorok számára • Biztonságos hozzáférés
              </Text>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default AdminLogin;