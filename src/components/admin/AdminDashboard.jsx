import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  IconButton,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  CardHeader,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue
} from '@chakra-ui/react';
import {
  BarChart3,
  Users,
  Camera,
  Settings,
  Image,
  Filter,
  TrendingUp,
  Download,
  Eye,
  Heart,
  Share2,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import MediaModeration from './MediaModeration';
import FilterAnalytics from './FilterAnalytics';
import OptimizationSettings from './OptimizationSettings';

const MotionCard = motion(Card);

const AdminDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  // Mock data - replace with real data from Firebase
  const stats = {
    totalUploads: 284,
    totalUsers: 156,
    totalStorage: '2.4 GB',
    averageOptimization: '67%',
    recentUploads: 23,
    pendingApprovals: 8,
    popularFilters: [
      { name: 'Menyasszonyi korona', uses: 45 },
      { name: 'Szívek és csillogás', uses: 38 },
      { name: 'Esküvői keret', uses: 29 }
    ]
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Box 
        bg={cardBg} 
        borderBottom="1px solid" 
        borderColor="gray.200" 
        px={6} 
        py={4}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <HStack justify="space-between">
          <VStack align="start" spacing={1}>
            <Heading size="lg" color="gray.800">
              {t('admin.dashboard')}
            </Heading>
            <Text color="gray.600" fontSize="sm">
              Esküvői platform kezelése
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <Badge colorScheme="green" variant="subtle" px={3} py={1}>
              Online
            </Badge>
            
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                rightIcon={<MoreVertical size={16} />}
              >
                <Avatar size="sm" name={user?.email} />
              </MenuButton>
              <MenuList>
                <MenuItem icon={<Settings size={16} />}>
                  Beállítások
                </MenuItem>
                <MenuItem icon={<LogOut size={16} />} onClick={handleLogout}>
                  Kijelentkezés
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </HStack>
      </Box>

      <Container maxW="container.xl" py={8}>
        <Routes>
          <Route path="/" element={<DashboardHome stats={stats} />} />
          <Route path="/media" element={<MediaModeration />} />
          <Route path="/analytics" element={<FilterAnalytics />} />
          <Route path="/optimization" element={<OptimizationSettings />} />
        </Routes>
      </Container>
    </Box>
  );
};

const DashboardHome = ({ stats }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  
  return (
    <VStack spacing={8} align="stretch">
      {/* Quick Stats */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6}>
        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Összes feltöltés</StatLabel>
              <HStack>
                <StatNumber color="blue.500">{stats.totalUploads}</StatNumber>
                <Image size={20} color="blue.500" />
              </HStack>
              <StatHelpText>
                <StatArrow type="increase" />
                12% az elmúlt héten
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Aktív felhasználók</StatLabel>
              <HStack>
                <StatNumber color="green.500">{stats.totalUsers}</StatNumber>
                <Users size={20} color="green.500" />
              </HStack>
              <StatHelpText>
                <StatArrow type="increase" />
                8% az elmúlt héten
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Tárhely használat</StatLabel>
              <HStack>
                <StatNumber color="purple.500">{stats.totalStorage}</StatNumber>
                <BarChart3 size={20} color="purple.500" />
              </HStack>
              <StatHelpText>
                85% kapacitás
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Átlag optimalizálás</StatLabel>
              <HStack>
                <StatNumber color="orange.500">{stats.averageOptimization}</StatNumber>
                <TrendingUp size={20} color="orange.500" />
              </HStack>
              <StatHelpText>
                Tárhely megtakarítás
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>
      </Grid>

      {/* Main Content Grid */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Recent Activity */}
        <Card bg={cardBg}>
          <CardHeader>
            <Heading size="md">Legutóbbi tevékenység</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {[
                { action: 'Új fotó feltöltve', user: 'Nagy Anna', time: '2 perce', icon: Camera },
                { action: 'Szűrő használva', user: 'Kovács Péter', time: '5 perce', icon: Filter },
                { action: 'Galéria megtekintve', user: 'Szabó Mária', time: '8 perce', icon: Eye },
                { action: 'Fotó letöltve', user: 'Kiss János', time: '12 perce', icon: Download },
                { action: 'Tartalom megosztva', user: 'Tóth Eszter', time: '15 perce', icon: Share2 }
              ].map((activity, index) => (
                <HStack key={index} spacing={3} p={3} borderRadius="md" _hover={{ bg: 'gray.50' }}>
                  <Box
                    p={2}
                    borderRadius="md"
                    bg="blue.50"
                    color="blue.500"
                  >
                    <activity.icon size={16} />
                  </Box>
                  <VStack align="start" spacing={0} flex={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      {activity.action}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {activity.user} • {activity.time}
                    </Text>
                  </VStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Actions & Stats */}
        <VStack spacing={6} align="stretch">
          {/* Quick Actions */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Gyors műveletek</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3}>
                <Button 
                  w="100%" 
                  leftIcon={<Eye />} 
                  colorScheme="blue"
                  onClick={() => navigate('/admin/media')}
                >
                  Moderálás ({stats.pendingApprovals})
                </Button>
                <Button 
                  w="100%" 
                  leftIcon={<BarChart3 />} 
                  variant="outline"
                  onClick={() => navigate('/admin/analytics')}
                >
                  Statisztikák
                </Button>
                <Button 
                  w="100%" 
                  leftIcon={<Settings />} 
                  variant="outline"
                  onClick={() => navigate('/admin/optimization')}
                >
                  Beállítások
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Popular Filters */}
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Népszerű szűrők</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {stats.popularFilters.map((filter, index) => (
                  <HStack key={index} justify="space-between">
                    <Text fontSize="sm">{filter.name}</Text>
                    <Badge colorScheme="pink" variant="subtle">
                      {filter.uses}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Grid>
    </VStack>
  );
};

export default AdminDashboard;