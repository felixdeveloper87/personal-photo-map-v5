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
  VStack,
  HStack,
  Badge,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Circle,
  Button,
  Divider,
  IconButton,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import {
  FaUser,
  FaEnvelope,
  FaCamera,
  FaGlobe,
  FaCalendarAlt,
  FaFlag,
  FaTrophy,
  FaRoute,
  FaCompass,
  FaStar,
  FaEdit,
  FaCrown
} from 'react-icons/fa';
import BaseModal from './BaseModal';
import EnhancedFlag from '../features/CountryDetails/EnhancedFlag';

countries.registerLocale(en);
const MotionBox = motion.create(Box);

const UserProfileModal = ({ isOpen, onClose }) => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);
  const [userStats, setUserStats] = useState({
    totalPhotos: 0,
    countriesVisited: 0,
    joinDate: new Date().getFullYear(),
    favoriteContinent: 'Unknown',
  });
  const [continentCount, setContinentCount] = useState(0);

  const textColor = useColorModeValue("gray.700", "gray.100");
  const headingColor = useColorModeValue("black", "white");
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const borderColor = useColorModeValue("rgba(0,0,0,0.08)", "rgba(255,255,255,0.12)");
  const cardBg = useColorModeValue("rgba(255,255,255,0.65)", "rgba(0,0,0,0.55)");
  const premiumGradient = "linear-gradient(135deg, #fbbf24, #f59e0b)";

  useEffect(() => {
    if (isLoggedIn) {
      setUserStats({
        totalPhotos: photoCount || 0,
        countriesVisited: countryCount || 0,
        joinDate: new Date().getFullYear(),
        favoriteContinent: getFavoriteContinent(),
      });
    }
  }, [isLoggedIn, photoCount, countryCount, countriesWithPhotos]);

  useEffect(() => {
    if (isLoggedIn && countriesWithPhotos?.length > 0) {
      getContinentCount().then(setContinentCount).catch(() => setContinentCount(0));
    } else {
      setContinentCount(0);
    }
  }, [isLoggedIn, countriesWithPhotos]);

  const getFavoriteContinent = () => {
    const map = {
      'US': 'North America', 'CA': 'North America', 'MX': 'North America',
      'BR': 'South America', 'AR': 'South America', 'CL': 'South America',
      'FR': 'Europe', 'DE': 'Europe', 'IT': 'Europe', 'ES': 'Europe', 'UK': 'Europe',
      'JP': 'Asia', 'CN': 'Asia', 'IN': 'Asia', 'TH': 'Asia', 'KR': 'Asia',
      'AU': 'Oceania', 'NZ': 'Oceania',
      'EG': 'Africa', 'ZA': 'Africa', 'MA': 'Africa', 'KE': 'Africa'
    };

    if (!countriesWithPhotos?.length) return 'World Explorer';
    const counts = {};
    countriesWithPhotos.forEach((item) => {
      const code = typeof item === 'object' ? String(item.id || '').toUpperCase() : String(item).toUpperCase();
      const c = map[code] || 'Other';
      counts[c] = (counts[c] || 0) + 1;
    });
    return Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), 'World Explorer');
  };

  const getContinentCount = async () => {
    if (!countriesWithPhotos?.length) return 0;
    const set = new Set();
    const batchSize = 5;

    for (let i = 0; i < countriesWithPhotos.length; i += batchSize) {
      const batch = countriesWithPhotos.slice(i, i + batchSize);
      const results = await Promise.all(batch.map(async (item) => {
        const code = typeof item === 'object'
          ? String(item.countryId || item.id || item.code || '').toUpperCase()
          : String(item || '').toUpperCase();
        if (!code || code === 'UNKNOWN') return null;
        try {
          const r = await fetch(`https://restcountries.com/v3.1/alpha/${code}`);
          if (!r.ok) return null;
          const data = await r.json();
          return data[0]?.region || 'Unknown';
        } catch {
          return null;
        }
      }));
      results.forEach((r) => r && set.add(r));
    }

    return set.size;
  };

  const countryNamesList = countriesWithPhotos?.map((item) => {
    const code = typeof item === 'object' ? String(item.countryId || '').toUpperCase() : String(item).toUpperCase();
    const name = typeof item === 'object' ? item.countryName || code : countries.getName(code, 'en');
    return { code, name: name || code, photoCount: item.photoCount || 0 };
  }) || [];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      icon={FaUser}
      size={{ base: "full", sm: "md", md: "lg", lg: "xl" }}
    >
      <VStack spacing={{ base: 5, sm: 6, md: 8 }} align="stretch">

        {/* Header */}
        <Box
          p={{ base: 4, sm: 5, md: 6 }}
          borderRadius="xl"
          bg={cardBg}
          backdropFilter="blur(8px)"
          border="1px solid"
          borderColor={borderColor}
          boxShadow={useColorModeValue(
            "0 1px 3px rgba(0,0,0,0.05)",
            "0 1px 3px rgba(255,255,255,0.05)"
          )}
          position="relative"
        >
          <Flex align="center" justify="space-between" flexDir={{ base: "column", sm: "row" }} gap={3}>
            <HStack spacing={4}>
              <Box position="relative">
                <Avatar
                  size="md"
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
                    border="2px solid white"
                  >
                    <Icon as={FaCrown} color="white" w={3} h={3} />
                  </Circle>
                )}
              </Box>

              <VStack align="start" spacing={1}>
                <HStack>
                  <Heading size="md" color={headingColor}>
                    {fullname}
                  </Heading>
                  {isPremium && (
                    <Badge
                      px={2.5}
                      py={1}
                      borderRadius="full"
                      fontSize="xs"
                      fontWeight="bold"
                      bg={premiumGradient}
                      color="white"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FaStar} w={3} h={3} />
                      PREMIUM
                    </Badge>
                  )}
                </HStack>
                <HStack spacing={2}>
                  <Icon as={FaEnvelope} color={textColor} w={3.5} h={3.5} />
                  <Text color={textColor} fontSize="sm">{email}</Text>
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
                _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
              />
            </Tooltip>
          </Flex>
        </Box>

        {/* Statistics */}
        <Box>
          <Heading size="sm" mb={4} color={headingColor}>
            <Icon as={FaTrophy} mr={2} color="yellow.400" />
            Travel Statistics
          </Heading>
          <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={3}>
            {[
              { label: "Photos", value: userStats.totalPhotos, icon: FaCamera, color: "blue.400" },
              { label: "Countries", value: userStats.countriesVisited, icon: FaGlobe, color: "green.400" },
              { label: "Continents", value: continentCount, icon: FaFlag, color: "teal.400" },
              { label: "Member Since", value: userStats.joinDate, icon: FaCalendarAlt, color: "purple.400" },
            ].map((stat, i) => (
              <Box
                key={i}
                bg={cardBg}
                backdropFilter="blur(6px)"
                borderRadius="lg"
                border="1px solid"
                borderColor={borderColor}
                p={4}
                textAlign="center"
                transition="all 0.2s"
                _hover={{
                  transform: "translateY(-2px)",
                  borderColor: useColorModeValue("rgba(59,130,246,0.3)", "rgba(59,130,246,0.4)"),
                }}
              >
                <Icon as={stat.icon} w={5} h={5} color={stat.color} mb={2} />
                <Text fontSize="lg" fontWeight="bold" color={headingColor}>{stat.value}</Text>
                <Text fontSize="sm" color={textColor}>{stat.label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Countries */}
        <Box>
          <Heading size="sm" mb={4} color={headingColor}>
            <Icon as={FaFlag} mr={2} color="blue.400" />
            Countries Explored
          </Heading>
          <Box
            p={4}
            borderRadius="lg"
            bg={cardBg}
            backdropFilter="blur(8px)"
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
                  mb={3}
                />
                <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 6 }} spacing={2}>
                  {countryNamesList.slice(0, 12).map((c, i) => (
                    <MotionBox
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      bg={cardBg}
                      border="1px solid"
                      borderColor={borderColor}
                      borderRadius="md"
                      p={3}
                      cursor="pointer"
                      textAlign="center"
                      _hover={{
                        bg: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(147,51,234,0.2))",
                        transform: "scale(1.05)",
                      }}
                    >
                      <Box width="48px" height="36px" mx="auto" mb={2}>
                        <EnhancedFlag countryCode={c.code} />
                      </Box>
                      <HStack justify="center" spacing={1}>
                        <Icon as={FaCamera} w={3} h={3} color="blue.400" />
                        <Text fontSize="xs" color={textColor}>{c.photoCount}</Text>
                      </HStack>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              </>
            ) : (
              <VStack py={6}>
                <Icon as={FaRoute} w={10} h={10} color="gray.400" />
                <Text color={textColor} fontSize="sm">
                  Start uploading photos to see your countries! ✈️
                </Text>
              </VStack>
            )}
          </Box>
        </Box>

        {/* Action */}
        <Flex justify="center">
          <Button
            colorScheme="blue"
            onClick={onClose}
            leftIcon={<FaCompass />}
            _hover={{ transform: "translateY(-2px)" }}
            transition="all 0.2s"
          >
            Continue Exploring
          </Button>
        </Flex>

      </VStack>
    </BaseModal>
  );
};

export default UserProfileModal;
