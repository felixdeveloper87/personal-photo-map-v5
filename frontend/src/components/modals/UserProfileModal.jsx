import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CountriesContext } from '../../context/CountriesContext';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { motion } from 'framer-motion';
import {
  Box,
  Heading,
  Text,
  Avatar,
  Flex,
  Grid,
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  Progress,
  SimpleGrid,
  Circle,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Button,
  useBreakpointValue,
  Divider,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FaMapMarkerAlt,
  FaCamera,
  FaGlobe,
  FaCalendarAlt,
  FaMedal,
  FaHeart,
  FaFlag,
  FaRoute,
  FaTrophy,
  FaStar,
  FaFire,
  FaCompass,
  FaUser,
  FaEnvelope,
  FaCrown,
  FaEdit,
} from 'react-icons/fa';
import BaseModal from './BaseModal';
import EnhancedFlag from '../features/CountryDetails/EnhancedFlag';

// Configuring the ISO country library to use English as the default locale
countries.registerLocale(en);

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

const UserProfileModal = ({ isOpen, onClose }) => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);
  const [userStats, setUserStats] = useState({
    totalPhotos: 0,
    countriesVisited: 0,
    joinDate: new Date().getFullYear(),
    favoriteContinent: 'Unknown',
    travelScore: 0
  });
  const [continentCount, setContinentCount] = useState(0);

  // Responsive values
  const gridColumns = useBreakpointValue({ base: 2, sm: 2, md: 4, lg: 4 });
  const countryGridColumns = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 6 });

  // Theme colors
  const cardBg = useColorModeValue("rgba(255, 255, 255, 0.9)", "rgba(26, 32, 44, 0.9)");
  const cardBorder = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.1)");
  const textColor = useColorModeValue("gray.700", "gray.100");
  const headingColor = useColorModeValue("gray.800", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const premiumGradient = "linear-gradient(135deg, #fbbf24, #f59e0b)";

  useEffect(() => {
    if (isLoggedIn) {
      setUserStats({
        totalPhotos: photoCount || 0,
        countriesVisited: countryCount || 0,
        joinDate: new Date().getFullYear(),
        favoriteContinent: getFavoriteContinent(),
        travelScore: calculateTravelScore()
      });
    }
  }, [isLoggedIn, photoCount, countryCount, countriesWithPhotos]);

  // Load continent count when countries data changes
  useEffect(() => {
    if (isLoggedIn && countriesWithPhotos && countriesWithPhotos.length > 0) {
      getContinentCount().then(count => {
        setContinentCount(count);
      }).catch(error => {
        console.error('Error loading continent count:', error);
        setContinentCount(0);
      });
    } else {
      setContinentCount(0);
    }
  }, [isLoggedIn, countriesWithPhotos]);

  const getFavoriteContinent = () => {
    const continentMap = {
      'US': 'North America', 'CA': 'North America', 'MX': 'North America',
      'BR': 'South America', 'AR': 'South America', 'CL': 'South America',
      'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'UK': 'Europe',
      'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'TH': 'Asia', 'KR': 'Asia',
      'AU': 'Oceania', 'NZ': 'Oceania',
      'EG': 'Africa', 'ZA': 'Africa', 'MA': 'Africa', 'KE': 'Africa'
    };

    if (!countriesWithPhotos || countriesWithPhotos.length === 0) return 'World Explorer';

    const continentCounts = {};
    countriesWithPhotos.forEach(item => {
      let countryCode = '';
      if (typeof item === 'object' && item !== null) {
        countryCode = String(item.id || '').toUpperCase();
      } else {
        countryCode = String(item || '').toUpperCase();
      }
      const continent = continentMap[countryCode] || 'Other';
      continentCounts[continent] = (continentCounts[continent] || 0) + 1;
    });

    return Object.keys(continentCounts).reduce((a, b) =>
      continentCounts[a] > continentCounts[b] ? a : b
    ) || 'World Explorer';
  };

  const getContinentCount = async () => {
    if (!countriesWithPhotos || countriesWithPhotos.length === 0) return 0;

    const continents = new Set();
    
    // Process countries in batches to avoid overwhelming the API
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < countriesWithPhotos.length; i += batchSize) {
      batches.push(countriesWithPhotos.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (item) => {
        let countryCode = '';
        if (typeof item === 'object' && item !== null) {
          countryCode = String(item.countryId || item.id || item.code || '').toUpperCase();
        } else {
          countryCode = String(item || '').toUpperCase();
        }
        
        // Skip if country code is empty or invalid
        if (!countryCode || countryCode === 'UNKNOWN' || countryCode === 'NULL') return null;

        try {
          const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
          if (!response.ok) return null;
          
          const data = await response.json();
          const country = data[0];
          
          // Get continent from region or subregion
          const region = country.region || '';
          const subregion = country.subregion || '';
          
          // Map regions to continents
          if (region === 'Americas') {
            if (subregion === 'South America') return 'South America';
            return 'North America';
          } else if (region === 'Europe') {
            return 'Europe';
          } else if (region === 'Asia') {
            return 'Asia';
          } else if (region === 'Africa') {
            return 'Africa';
          } else if (region === 'Oceania') {
            return 'Oceania';
          } else if (region === 'Antarctic') {
            return 'Antarctica';
          }
          
          return region || 'Unknown';
        } catch (error) {
          console.warn(`Failed to fetch continent for ${countryCode}:`, error);
          return null;
        }
      });

      const results = await Promise.all(promises);
      results.forEach(continent => {
        if (continent) continents.add(continent);
      });
    }

    return continents.size;
  };

  const calculateTravelScore = () => {
    const photosScore = Math.min((photoCount || 0) * 2, 200);
    const countriesScore = Math.min((countryCount || 0) * 10, 300);
    return photosScore + countriesScore;
  };

  const getTravelBadges = () => {
    const badges = [];
    if (countryCount >= 10) badges.push({ name: "Globe Trotter", icon: FaGlobe, color: "blue" });
    if (countryCount >= 25) badges.push({ name: "World Explorer", icon: FaCompass, color: "purple" });
    if (countryCount >= 50) badges.push({ name: "Travel Master", icon: FaTrophy, color: "gold" });
    if (photoCount >= 100) badges.push({ name: "Photo Enthusiast", icon: FaCamera, color: "green" });
    if (photoCount >= 500) badges.push({ name: "Memory Keeper", icon: FaHeart, color: "red" });
    if (isPremium) badges.push({ name: "Premium Explorer", icon: FaStar, color: "yellow" });

    return badges;
  };

  const countryNamesList = countriesWithPhotos?.map((item) => {
    if (typeof item === 'object' && item !== null) {
      return {
        code: String(item.countryId || '').toUpperCase(),
        name: item.countryName || String(item.countryId || '').toUpperCase(),
        photoCount: item.photoCount || 0
      };
    } else {
      const countryCode = String(item || '').toUpperCase();
      const countryName = countries.getName(countryCode, 'en');
      return { code: countryCode, name: countryName || countryCode, photoCount: 0 };
    }
  }) || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      icon={FaUser}
      size={{ base: "full", sm: "md", md: "lg", lg: "xl", xl: "2xl" }}
    >
      <VStack spacing={{ base: 4, sm: 5, md: 6 }} align="stretch">
        <MotionBox
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Profile Header Section */}
          <MotionBox variants={itemVariants} mb={{ base: 4, sm: 5, md: 6 }}>
            <Box
              p={{ base: 4, sm: 5, md: 6 }}
              borderRadius="xl"
              bg={useColorModeValue("blue.50", "blue.900")}
              border="1px solid"
              borderColor={useColorModeValue("blue.200", "blue.700")}
              position="relative"
              overflow="hidden"
            >
              {/* Premium Background Pattern */}
              {isPremium && (
                <Box
                  position="absolute"
                  top={0}
                  right={0}
                  w="100px"
                  h="100px"
                  bg="linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1))"
                  borderRadius="full"
                  transform="translate(30px, -30px)"
                />
              )}

              <Flex align="center" justify="space-between" position="relative" direction={{ base: "column", sm: "row" }} gap={{ base: 3, sm: 0 }}>
                <HStack spacing={{ base: 3, sm: 4 }}>
                  <Box position="relative">
                    <Avatar
                      size={{ base: "lg", sm: "xl" }}
                      name={fullname}
                      bg={isPremium ? premiumGradient : accentColor}
                      color="white"
                      ring="3px"
                      ringColor={isPremium ? "yellow.400" : accentColor}
                    />
                    {isPremium && (
                      <Circle
                        size="24px"
                        bg={premiumGradient}
                        position="absolute"
                        bottom="-2px"
                        right="-2px"
                        border="3px solid white"
                      >
                        <Icon as={FaCrown} color="white" w={3} h={3} />
                      </Circle>
                    )}
                  </Box>

                  <VStack spacing={{ base: 1.5, sm: 2 }} align="start">
                    <HStack spacing={{ base: 2, sm: 3 }} align="center" flexWrap="wrap">
                      <Heading as="h2" size={{ base: "md", sm: "lg" }} color={headingColor}>
                        {fullname}
                      </Heading>
                      {isPremium && (
                        <Badge
                          colorScheme="yellow"
                          px={{ base: 2, sm: 3 }}
                          py={1}
                          borderRadius="full"
                          fontSize={{ base: "xs", sm: "sm" }}
                          fontWeight="bold"
                          bg={premiumGradient}
                          color="white"
                        >
                          <Icon as={FaStar} mr={1} w={3} h={3} />
                          PREMIUM
                        </Badge>
                      )}
                    </HStack>

                    <HStack spacing={2} align="center">
                      <Icon as={FaEnvelope} color={textColor} w={{ base: 3, sm: 4 }} h={{ base: 3, sm: 4 }} />
                      <Text color={textColor} fontSize={{ base: "xs", sm: "sm" }}>
                        {email}
                      </Text>
                    </HStack>

                    <HStack spacing={2} align="center">
                      <Icon as={FaMapMarkerAlt} color={textColor} w={{ base: 3, sm: 4 }} h={{ base: 3, sm: 4 }} />
                      <Text color={textColor} fontSize={{ base: "xs", sm: "sm" }}>
                        {userStats.favoriteContinent}
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>

                <Tooltip label="Edit Profile" hasArrow>
                  <IconButton
                    aria-label="Edit Profile"
                    icon={<FaEdit />}
                    size="sm"
                    variant="ghost"
                    color={textColor}
                    _hover={{ bg: "rgba(255, 255, 255, 0.1)" }}
                  />
                </Tooltip>
              </Flex>
            </Box>
          </MotionBox>

          {/* Statistics Cards */}
          <MotionBox variants={itemVariants} mb={{ base: 4, sm: 5, md: 6 }}>
            <Heading as="h3" size={{ base: "sm", sm: "md" }} mb={{ base: 3, sm: 4 }} color={headingColor}>
              <Icon as={FaTrophy} mr={2} color="yellow.400" />
              Travel Statistics
            </Heading>
            <SimpleGrid columns={gridColumns} spacing={{ base: 2, sm: 3, md: 4 }}>
              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={{ base: 3, sm: 4 }}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaCamera} w={{ base: 4, sm: 5 }} h={{ base: 4, sm: 5 }} color="blue.400" mb={2} />
                <Stat>
                  <StatNumber fontSize={{ base: "lg", sm: "xl" }} color={headingColor}>{userStats.totalPhotos}</StatNumber>
                  <StatLabel color={textColor} fontSize={{ base: "xs", sm: "sm" }}>Photos</StatLabel>
                </Stat>
              </Box>

              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={{ base: 3, sm: 4 }}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaGlobe} w={{ base: 4, sm: 5 }} h={{ base: 4, sm: 5 }} color="green.400" mb={2} />
                <Stat>
                  <StatNumber fontSize={{ base: "lg", sm: "xl" }} color={headingColor}>{userStats.countriesVisited}</StatNumber>
                  <StatLabel color={textColor} fontSize={{ base: "xs", sm: "sm" }}>Countries</StatLabel>
                  <StatHelpText fontSize={{ base: "2xs", sm: "xs" }} lineHeight="1.2">
                    {((userStats.countriesVisited / 195) * 100).toFixed(1)}% of world
                  </StatHelpText>
                </Stat>
              </Box>


              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={{ base: 3, sm: 4 }}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaGlobe} w={{ base: 4, sm: 5 }} h={{ base: 4, sm: 5 }} color="teal.400" mb={2} />
                <Stat>
                  <StatNumber fontSize={{ base: "lg", sm: "xl" }} color={headingColor}>{continentCount}</StatNumber>
                  <StatLabel color={textColor} fontSize={{ base: "xs", sm: "sm" }}>Continents</StatLabel>
                </Stat>
              </Box>

              <Box
                bg={bgColor}
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={{ base: 3, sm: 4 }}
                textAlign="center"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                transition="all 0.2s"
              >
                <Icon as={FaCalendarAlt} w={{ base: 4, sm: 5 }} h={{ base: 4, sm: 5 }} color="purple.400" mb={2} />
                <Stat>
                  <StatNumber fontSize={{ base: "lg", sm: "xl" }} color={headingColor}>{userStats.joinDate}</StatNumber>
                  <StatLabel color={textColor} fontSize={{ base: "xs", sm: "sm" }}>Member Since</StatLabel>
                </Stat>
              </Box>
            </SimpleGrid>
          </MotionBox>

          {/* Countries Section */}
          <MotionBox variants={itemVariants} mb={{ base: 4, sm: 5, md: 6 }}>
            <Heading as="h3" size={{ base: "sm", sm: "md" }} mb={{ base: 3, sm: 4 }} color={headingColor}>
              <Icon as={FaFlag} mr={2} color="blue.400" />
              Countries Explored
            </Heading>
            <Box
              p={{ base: 3, sm: 4 }}
              borderRadius="lg"
              bg={bgColor}
              border="1px solid"
              borderColor={borderColor}
            >
              {countryNamesList.length > 0 ? (
                <>
                  <Progress
                    value={(countryNamesList.length / 195) * 100}
                    colorScheme="blue"
                    size="md"
                    borderRadius="full"
                    mb={4}
                  />
                  <Text textAlign="center" color={textColor} mb={{ base: 3, sm: 4 }} fontSize={{ base: "xs", sm: "sm" }}>
                    {countryNamesList.length} / 195 countries ({((countryNamesList.length / 195) * 100).toFixed(1)}%)
                  </Text>
                  <SimpleGrid columns={countryGridColumns} spacing={{ base: 2, sm: 3 }}>
                    {countryNamesList
                      .filter(country => country.name && country.name !== 'UNKNOWN') // Filter out invalid countries
                      .slice(0, 12)
                      .map((country, index) => {
                        // Get photo count from the country data
                        const photoCount = country.photoCount || 0;

                        return (
                          <MotionBox
                            key={country.code || index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            bg="linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))"
                            color={headingColor}
                            p={3}
                            borderRadius="md"
                            textAlign="center"
                            border="1px solid"
                            borderColor="rgba(59, 130, 246, 0.2)"
                            _hover={{
                              bg: "linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                              transform: 'scale(1.05)'
                            }}
                            cursor="pointer"
                            fontSize="sm"
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            minH="70px"
                            gap={2}
                          >
                            {/* Flag */}
                            <Box
                              width="48px"
                              height="36px"
                              borderRadius="sm"
                              overflow="hidden"
                              border="1px solid"
                              borderColor="rgba(255, 255, 255, 0.3)"
                              boxShadow="sm"
                            >
                              <EnhancedFlag countryCode={country.code} />
                            </Box>

                            {/* Photo Count */}
                            <HStack spacing={1} align="center">
                              <Icon as={FaCamera} w={3} h={3} color="blue.400" />
                              <Text fontSize="xs" fontWeight="bold" color={textColor}>
                                {photoCount}
                              </Text>
                            </HStack>
                          </MotionBox>
                        );
                      })}
                    {countryNamesList.length > 12 && (
                      <Box
                        bg="gray.100"
                        color="gray.600"
                        p={3}
                        borderRadius="md"
                        textAlign="center"
                        fontSize="sm"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        gap={1}
                      >
                        <Text fontWeight="bold">+{countryNamesList.length - 12} more</Text>
                        <HStack spacing={1}>
                          <Icon as={FaCamera} w={3} h={3} color="gray.500" />
                          <Text fontSize="xs">
                            {countryNamesList
                              .slice(12)
                              .reduce((total, country) => total + (country.photoCount || 0), 0)} photos
                          </Text>
                        </HStack>
                      </Box>
                    )}
                  </SimpleGrid>
                </>
              ) : (
                <VStack spacing={3} py={6} textAlign="center">
                  <Icon as={FaRoute} w={10} h={10} color="gray.400" />
                  <Text color={textColor} fontSize="md">
                    Start uploading photos to see your countries! ✈️
                  </Text>
                </VStack>
              )}
            </Box>
          </MotionBox>

          {/* Action Buttons */}
          <Flex justify="center" gap={{ base: 2, sm: 4 }}>
            <Button
              colorScheme="blue"
              size={{ base: "sm", sm: "md" }}
              onClick={onClose}
              leftIcon={<FaCompass />}
              _hover={{ transform: 'translateY(-2px)' }}
              transition="all 0.2s"
              w={{ base: "full", sm: "auto" }}
            >
              Continue Exploring
            </Button>
          </Flex>
        </MotionBox>
      </VStack>
    </BaseModal>
  );
};

export default UserProfileModal;
