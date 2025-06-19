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
  FormControl,
  FormLabel,
  FormHelperText,
  Select,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Grid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  Badge,
  Progress,
  useToast
} from '@chakra-ui/react';
import { Save, RefreshCw, Settings, TrendingUp, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '../../hooks/useTranslation';
import { useConfig } from '../../contexts/ConfigContext';

const MotionCard = motion(Card);

const OptimizationSettings = () => {
  const [settings, setSettings] = useState({});
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { config, updateConfig } = useConfig();
  const { t } = useTranslation();
  const toast = useToast();

  useEffect(() => {
    if (config.optimization) {
      setSettings(config.optimization);
    }
  }, [config]);

  const handleSettingChange = (path, value) => {
    setSettings(prev => {
      const newSettings = { ...prev };
      const keys = path.split('.');
      let current = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const testOptimizationSettings = async () => {
    setLoading(true);
    
    try {
      // Simulate testing with sample images
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestResults({
        averageCompression: 68,
        averageProcessingTime: 1.2,
        qualityScore: 85,
        storageReduction: '2.1 GB',
        samples: [
          { 
            name: 'Minta fotó 1', 
            originalSize: '2.4 MB', 
            optimizedSize: '0.8 MB', 
            compression: '67%',
            quality: 'Kiváló'
          },
          { 
            name: 'Minta fotó 2', 
            originalSize: '3.1 MB', 
            optimizedSize: '0.9 MB', 
            compression: '71%',
            quality: 'Jó'
          },
          { 
            name: 'Minta fotó 3', 
            originalSize: '1.8 MB', 
            optimizedSize: '0.6 MB', 
            compression: '65%',
            quality: 'Kiváló'
          }
        ]
      });
      
      toast({
        title: 'Teszt befejezve',
        description: 'Az optimalizálási beállítások tesztelése sikeres',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Teszt hiba',
        description: 'Nem sikerült tesztelni a beállításokat',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    
    try {
      await updateConfig('optimization', settings);
      
      toast({
        title: 'Beállítások mentve',
        description: 'Az optimalizálási beállítások sikeresen frissítve',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Mentési hiba',
        description: 'Nem sikerült menteni a beállításokat',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setSettings({
      image: {
        quality: {
          high: 0.9,
          medium: 0.8,
          low: 0.6,
          default: "medium"
        },
        maxDimensions: {
          gallery: { width: 1920, height: 1080 },
          thumbnail: { width: 400, height: 400 },
          preview: { width: 800, height: 600 }
        },
        formats: {
          preferredOutput: "webp",
          fallback: "jpeg",
          preserveOriginal: false
        },
        compression: {
          enabled: true,
          aggressive: false,
          progressive: true,
          stripMetadata: true,
          preserveExif: false
        }
      }
    });
    
    toast({
      title: 'Alapértékek visszaállítva',
      status: 'info',
      duration: 2000,
    });
  };

  // Mock current statistics
  const currentStats = {
    totalOptimized: 1247,
    averageSavings: 65,
    totalSaved: '4.2 GB',
    averageTime: 1.4
  };

  return (
    <VStack spacing={8} align="stretch">
      {/* Header */}
      <HStack justify="space-between">
        <VStack align="start" spacing={1}>
          <Heading size="lg">Optimalizálási beállítások</Heading>
          <Text color="gray.600">
            Kép és videó optimalizálás konfigurálása
          </Text>
        </VStack>
        
        <HStack spacing={4}>
          <Button
            leftIcon={<RefreshCw size={16} />}
            variant="outline"
            onClick={resetToDefaults}
          >
            Alapértékek
          </Button>
          <Button
            leftIcon={<Settings size={16} />}
            colorScheme="blue"
            onClick={testOptimizationSettings}
            isLoading={loading}
            loadingText="Tesztelés..."
          >
            Beállítások tesztelése
          </Button>
          <Button
            leftIcon={<Save size={16} />}
            colorScheme="green"
            onClick={saveSettings}
            isLoading={saving}
            loadingText="Mentés..."
          >
            Mentés
          </Button>
        </HStack>
      </HStack>

      {/* Current Statistics */}
      <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Optimalizált képek</StatLabel>
              <HStack>
                <StatNumber color="blue.500">{currentStats.totalOptimized}</StatNumber>
                <Settings size={20} color="blue.500" />
              </HStack>
              <StatHelpText>
                Összesen feldolgozva
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
              <StatLabel color="gray.600" fontSize="sm">Átlagos megtakarítás</StatLabel>
              <HStack>
                <StatNumber color="green.500">{currentStats.averageSavings}%</StatNumber>
                <TrendingUp size={20} color="green.500" />
              </HStack>
              <StatHelpText>
                Fájlméret csökkentés
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
              <StatLabel color="gray.600" fontSize="sm">Összes megtakarítás</StatLabel>
              <HStack>
                <StatNumber color="purple.500">{currentStats.totalSaved}</StatNumber>
                <HardDrive size={20} color="purple.500" />
              </HStack>
              <StatHelpText>
                Tárhely megtakarítás
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>

        <MotionCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardBody>
            <Stat>
              <StatLabel color="gray.600" fontSize="sm">Átlagos feldolgozási idő</StatLabel>
              <HStack>
                <StatNumber color="orange.500">{currentStats.averageTime}s</StatNumber>
                <RefreshCw size={20} color="orange.500" />
              </HStack>
              <StatHelpText>
                Per kép
              </StatHelpText>
            </Stat>
          </CardBody>
        </MotionCard>
      </Grid>

      {/* Settings */}
      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
        {/* Image Quality Settings */}
        <Card>
          <CardHeader>
            <Heading size="md">Képminőség beállítások</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <FormControl>
                <FormLabel>Alapértelmezett minőség</FormLabel>
                <Select 
                  value={settings.image?.quality?.default || 'medium'}
                  onChange={(e) => handleSettingChange('image.quality.default', e.target.value)}
                >
                  <option value="high">Magas (90%)</option>
                  <option value="medium">Közepes (80%)</option>
                  <option value="low">Alacsony (60%)</option>
                </Select>
                <FormHelperText>
                  Alapértelmezett tömörítési minőség új feltöltésekhez
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Magas minőség értéke</FormLabel>
                <HStack>
                  <Slider
                    value={(settings.image?.quality?.high || 0.9) * 100}
                    onChange={(value) => handleSettingChange('image.quality.high', value / 100)}
                    min={70}
                    max={100}
                    step={1}
                    flex={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack bg="green.400" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text minW="40px" fontSize="sm">
                    {Math.round((settings.image?.quality?.high || 0.9) * 100)}%
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Közepes minőség értéke</FormLabel>
                <HStack>
                  <Slider
                    value={(settings.image?.quality?.medium || 0.8) * 100}
                    onChange={(value) => handleSettingChange('image.quality.medium', value / 100)}
                    min={60}
                    max={90}
                    step={1}
                    flex={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack bg="blue.400" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text minW="40px" fontSize="sm">
                    {Math.round((settings.image?.quality?.medium || 0.8) * 100)}%
                  </Text>
                </HStack>
              </FormControl>

              <FormControl>
                <FormLabel>Alacsony minőség értéke</FormLabel>
                <HStack>
                  <Slider
                    value={(settings.image?.quality?.low || 0.6) * 100}
                    onChange={(value) => handleSettingChange('image.quality.low', value / 100)}
                    min={40}
                    max={80}
                    step={1}
                    flex={1}
                  >
                    <SliderTrack>
                      <SliderFilledTrack bg="orange.400" />
                    </SliderTrack>
                    <SliderThumb />
                  </Slider>
                  <Text minW="40px" fontSize="sm">
                    {Math.round((settings.image?.quality?.low || 0.6) * 100)}%
                  </Text>
                </HStack>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>

        {/* Dimension Settings */}
        <Card>
          <CardHeader>
            <Heading size="md">Méret beállítások</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text fontWeight="medium" mb={3}>Galéria maximális méret</Text>
                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm">Szélesség</FormLabel>
                    <NumberInput
                      value={settings.image?.maxDimensions?.gallery?.width || 1920}
                      onChange={(value) => handleSettingChange('image.maxDimensions.gallery.width', parseInt(value))}
                      min={800}
                      max={4000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Magasság</FormLabel>
                    <NumberInput
                      value={settings.image?.maxDimensions?.gallery?.height || 1080}
                      onChange={(value) => handleSettingChange('image.maxDimensions.gallery.height', parseInt(value))}
                      min={600}
                      max={3000}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
              </Box>

              <Box>
                <Text fontWeight="medium" mb={3}>Bélyegkép méret</Text>
                <HStack>
                  <FormControl>
                    <FormLabel fontSize="sm">Szélesség</FormLabel>
                    <NumberInput
                      value={settings.image?.maxDimensions?.thumbnail?.width || 400}
                      onChange={(value) => handleSettingChange('image.maxDimensions.thumbnail.width', parseInt(value))}
                      min={200}
                      max={800}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize="sm">Magasság</FormLabel>
                    <NumberInput
                      value={settings.image?.maxDimensions?.thumbnail?.height || 400}
                      onChange={(value) => handleSettingChange('image.maxDimensions.thumbnail.height', parseInt(value))}
                      min={200}
                      max={800}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </HStack>
              </Box>

              <FormControl>
                <FormLabel>Előnyben részesített formátum</FormLabel>
                <Select
                  value={settings.image?.formats?.preferredOutput || 'webp'}
                  onChange={(e) => handleSettingChange('image.formats.preferredOutput', e.target.value)}
                >
                  <option value="webp">WebP (modern, kisebb méret)</option>
                  <option value="jpeg">JPEG (kompatibilis)</option>
                </Select>
                <FormHelperText>
                  WebP 20-35%-kal kisebb fájlméretet eredményez
                </FormHelperText>
              </FormControl>
            </VStack>
          </CardBody>
        </Card>
      </Grid>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <Heading size="md">Haladó beállítások</Heading>
        </CardHeader>
        <CardBody>
          <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Progresszív JPEG</FormLabel>
                <Switch
                  isChecked={settings.image?.compression?.progressive || true}
                  onChange={(e) => handleSettingChange('image.compression.progressive', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Metaadatok eltávolítása</FormLabel>
                <Switch
                  isChecked={settings.image?.compression?.stripMetadata || true}
                  onChange={(e) => handleSettingChange('image.compression.stripMetadata', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">EXIF adatok megőrzése</FormLabel>
                <Switch
                  isChecked={settings.image?.compression?.preserveExif || false}
                  onChange={(e) => handleSettingChange('image.compression.preserveExif', e.target.checked)}
                />
              </FormControl>
            </VStack>

            <VStack spacing={4} align="stretch">
              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Agresszív tömörítés</FormLabel>
                <Switch
                  isChecked={settings.image?.compression?.aggressive || false}
                  onChange={(e) => handleSettingChange('image.compression.aggressive', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Eredeti fájl megőrzése</FormLabel>
                <Switch
                  isChecked={settings.image?.formats?.preserveOriginal || false}
                  onChange={(e) => handleSettingChange('image.formats.preserveOriginal', e.target.checked)}
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Web Workers használata</FormLabel>
                <Switch
                  isChecked={settings.performance?.useWebWorkers || true}
                  onChange={(e) => handleSettingChange('performance.useWebWorkers', e.target.checked)}
                />
              </FormControl>
            </VStack>
          </Grid>
        </CardBody>
      </Card>

      {/* Test Results */}
      {testResults && (
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Teszt eredmények</Heading>
              <Badge colorScheme="green" variant="solid">
                Sikeres teszt
              </Badge>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={6} align="stretch">
              {/* Summary Stats */}
              <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
                <Box textAlign="center" p={4} bg="blue.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {testResults.averageCompression}%
                  </Text>
                  <Text fontSize="sm" color="blue.700">Átlagos tömörítés</Text>
                </Box>
                <Box textAlign="center" p={4} bg="green.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="green.600">
                    {testResults.averageProcessingTime}s
                  </Text>
                  <Text fontSize="sm" color="green.700">Átlagos idő</Text>
                </Box>
                <Box textAlign="center" p={4} bg="purple.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                    {testResults.qualityScore}
                  </Text>
                  <Text fontSize="sm" color="purple.700">Minőségi pontszám</Text>
                </Box>
                <Box textAlign="center" p={4} bg="orange.50" borderRadius="md">
                  <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                    {testResults.storageReduction}
                  </Text>
                  <Text fontSize="sm" color="orange.700">Becsült megtakarítás</Text>
                </Box>
              </Grid>

              {/* Sample Results */}
              <Box>
                <Text fontWeight="medium" mb={3}>Minta képek eredményei</Text>
                <VStack spacing={3} align="stretch">
                  {testResults.samples.map((sample, index) => (
                    <HStack key={index} p={3} bg="gray.50" borderRadius="md" justify="space-between">
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium">{sample.name}</Text>
                        <Text fontSize="xs" color="gray.600">
                          {sample.originalSize} → {sample.optimizedSize}
                        </Text>
                      </VStack>
                      <HStack spacing={3}>
                        <Badge colorScheme="green" variant="solid">
                          {sample.compression}
                        </Badge>
                        <Badge colorScheme="blue" variant="outline">
                          {sample.quality}
                        </Badge>
                      </HStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Recommendations */}
      <Alert status="info">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">Optimalizálási javaslatok:</Text>
          <Text fontSize="sm">
            • WebP formátum használata 20-35% kisebb fájlméretet eredményez<br/>
            • Közepes minőség (80%) optimális egyensúlyt biztosít a méret és minőség között<br/>
            • Progresszív JPEG javítja a betöltési élményt lassú kapcsolatokon<br/>
            • Metaadatok eltávolítása további 2-5% méretcsökkentést eredményez
          </Text>
        </VStack>
      </Alert>
    </VStack>
  );
};

export default OptimizationSettings;