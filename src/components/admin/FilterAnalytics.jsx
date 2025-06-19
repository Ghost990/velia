import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Progress,
  Badge,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton
} from '@chakra-ui/react';
import { 
  TrendingUp, 
  Filter, 
  Users, 
  Eye, 
  Download,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';

const MotionCard = motion(Card);

const FilterAnalytics = () => {
  const [period, setPeriod] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    
    // Mock analytics data - replace with Firebase queries
    setTimeout(() => {
      setAnalytics({
        totalFilterUses: 342,
        uniqueUsers: 89,
        mostPopularFilter: 'Menyasszonyi korona',
        filterStats: [
          { 
            id: 'wedding_crown', 
            name: 'Menyasszonyi korona', 
            uses: 85, 
            percentage: 24.9,
            trend: '+12%',
            users: 45
          },
          { 
            id: 'hearts_sparkles', 
            name: 'Szívek és csillogás', 
            uses: 72, 
            percentage: 21.1,
            trend: '+8%',
            users: 38
          },
          { 
            id: 'wedding_frame', 
            name: 'Esküvői keret', 
            uses: 58, 
            percentage: 17.0,
            trend: '+15%',
            users: 31
          },
          { 
            id: 'groom_hat', 
            name: 'Vőlegény kalap', 
            uses: 45, 
            percentage: 13.2,
            trend: '+5%',
            users: 28
          },
          { 
            id: 'romantic_hearts', 
            name: 'Romantikus szívek', 
            uses: 38, 
            percentage: 11.1,
            trend: '-2%',
            users: 22
          },
          { 
            id: 'vintage_frame', 
            name: 'Vintage keret', 
            uses: 25, 
            percentage: 7.3,
            trend: '+3%',
            users: 18
          },
          { 
            id: 'flower_crown', 
            name: 'Virágkoszorú', 
            uses: 19, 
            percentage: 5.6,
            trend: 'új',
            users: 15
          }
        ],
        hourlyUsage: [
          { hour: '10:00', uses: 15 },
          { hour: '11:00', uses: 23 },
          { hour: '12:00', uses: 31 },
          { hour: '13:00', uses: 28 },
          { hour: '14:00', uses: 42 },
          { hour: '15:00', uses: 38 },
          { hour: '16:00', uses: 35 },
          { hour: '17:00', uses: 29 },
          { hour: '18:00', uses: 25 },
          { hour: '19:00', uses: 18 }
        ]
      });
      setLoading(false);
    }, 1000);
  };

  if (loading || !analytics) {
    return (
      <Box textAlign="center" py={12}>
        <Text>Statisztikák betöltése...</Text>
      </Box>
    );
  }

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Szűrő statisztikák</Heading>
          <Text color="gray.600">
            AR szűrők használati elemzése
          </Text>
        </VStack>
        
        <HStack spacing={4}>
          <Select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            maxW="150px"
          >
            <option value="24h">24 óra</option>
            <option value="7d">7 nap</option>
            <option value="30d">30 nap</option>
            <option value="90d">90 nap</option>
          </Select>
          
          <IconButton
            icon={<RefreshCw size={16} />}
            onClick={loadAnalytics}
            aria-label="Frissítés"
          />
        </HStack>
      </HStack>

      {/* Overview Stats */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Összes szűrő használat</StatLabel>
              <HStack>
                <StatNumber color="blue.500">{analytics.totalFilterUses}</StatNumber>
                <Filter size={20} color="blue.500" />
              </HStack>
              <StatHelpText>
                +23% az előző időszakhoz képest
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Egyedi felhasználók</StatLabel>
              <HStack>
                <StatNumber color="green.500">{analytics.uniqueUsers}</StatNumber>
                <Users size={20} color="green.500" />
              </HStack>
              <StatHelpText>
                {(analytics.totalFilterUses / analytics.uniqueUsers).toFixed(1)} átlag/fő
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Legnépszerűbb szűrő</StatLabel>
              <HStack>
                <StatNumber color="purple.500" fontSize="lg">
                  {analytics.mostPopularFilter}
                </StatNumber>
                <TrendingUp size={20} color="purple.500" />
              </HStack>
              <StatHelpText>
                {analytics.filterStats[0].uses} használat
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>
      </Grid>

      {/* Filter Usage Chart */}
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Szűrő használat részletesen</Heading>
              <Badge colorScheme="blue" variant="subtle">
                {period === '24h' ? '24 óra' : period === '7d' ? '7 nap' : period === '30d' ? '30 nap' : '90 nap'}
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {analytics.filterStats.map((filter, index) => (
                <MotionCard
                  key={filter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  variant="outline"
                >
                  <CardBody p={4}>
                    <HStack justify="space-between" mb={2}>
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{filter.name}</Text>
                        <HStack spacing={4} fontSize="sm" color="gray.600">
                          <Text>{filter.uses} használat</Text>
                          <Text>•</Text>
                          <Text>{filter.users} felhasználó</Text>
                        </HStack>
                      </VStack>
                      
                      <VStack align="end" spacing={0}>
                        <Text fontWeight="bold" color="blue.500">
                          {filter.percentage}%
                        </Text>
                        <Badge 
                          colorScheme={filter.trend.includes('+') ? 'green' : filter.trend === 'új' ? 'purple' : 'red'}
                          variant="subtle"
                          fontSize="xs"
                        >
                          {filter.trend}
                        </Badge>
                      </VStack>
                    </HStack>
                    
                    <Progress
                      value={filter.percentage}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                    />
                  </CardBody>
                </MotionCard>
              ))}
            </VStack>
          </CardBody>
        </Card>

        {/* Hourly Usage */}
        <Card>
          <CardHeader>
            <Heading size="md">Óránkénti használat</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {analytics.hourlyUsage.map((hour, index) => (
                <HStack key={index} justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {hour.hour}
                  </Text>
                  <HStack spacing={2}>
                    <Progress
                      value={(hour.uses / Math.max(...analytics.hourlyUsage.map(h => h.uses))) * 100}
                      size="sm"
                      colorScheme="green"
                      w="60px"
                    />
                    <Text fontSize="sm" fontWeight="medium" minW="30px">
                      {hour.uses}
                    </Text>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <Heading size="md">Részletes táblázat</Heading>
        </CardHeader>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Szűrő neve</Th>
                <Th isNumeric>Használatok</Th>
                <Th isNumeric>Felhasználók</Th>
                <Th isNumeric>Részesedés</Th>
                <Th>Trend</Th>
                <Th isNumeric>Átlag/fő</Th>
              </Tr>
            </Thead>
            <Tbody>
              {analytics.filterStats.map((filter) => (
                <Tr key={filter.id}>
                  <Td>
                    <Text fontWeight="medium">{filter.name}</Text>
                  </Td>
                  <Td isNumeric>{filter.uses}</Td>
                  <Td isNumeric>{filter.users}</Td>
                  <Td isNumeric>{filter.percentage}%</Td>
                  <Td>
                    <Badge 
                      colorScheme={filter.trend.includes('+') ? 'green' : filter.trend === 'új' ? 'purple' : 'red'}
                      variant="subtle"
                    >
                      {filter.trend}
                    </Badge>
                  </Td>
                  <Td isNumeric>
                    {(filter.uses / filter.users).toFixed(1)}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default FilterAnalytics;