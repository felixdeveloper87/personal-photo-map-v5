import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CountriesContext } from '../../context/CountriesContext';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { motion } from 'framer-motion';
import {
  Box,
  Text,
  Avatar,
  Flex,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  Circle,
  IconButton,
  Tooltip,
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
import ModalButton from './ModalButton';
import EnhancedFlag from '../features/CountryDetails/EnhancedFlag';
import { useLandingTokens } from '../features/landing/landingUI';

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

  const t = useLandingTokens();
  const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";
  const SERIF = "'Instrument Serif', Georgia, serif";
  const textColor = t.textSoft;
  const headingColor = t.text;
  const accentColor = t.primary;
  const borderColor = t.hairline;
  const cardBg = t.surface;

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
          boxShadow={t.shadowSm}
          position="relative"
        >
          <Flex align="center" justify="space-between" flexDir={{ base: "column", sm: "row" }} gap={3}>
            <HStack spacing={4}>
              <Box position="relative">
                <Avatar
                  size="md"
                  name={fullname}
                  bg={isPremium ? t.accent : accentColor}
                  color="white"
                  ring="3px"
                  ringColor={isPremium ? "yellow.400" : accentColor}
                />
                {isPremium && (
                  <Circle
                    size="24px"
                    bg={t.accent}
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
                  <Text fontFamily={SERIF} fontSize="xl" fontWeight="400" color={headingColor} lineHeight="1.1">
                    {fullname}
                  </Text>
                  {isPremium && (
                    <Box
                      px={2}
                      py={0.5}
                      borderRadius="full"
                      bg="rgba(235,181,114,0.14)"
                      border="1px solid rgba(235,181,114,0.32)"
                      display="flex"
                      alignItems="center"
                      gap="4px"
                    >
                      <Icon as={FaStar} w={2.5} h={2.5} color={t.primary} />
                      <Text fontFamily={MONO} fontSize="9px" fontWeight="700" color={t.primary} letterSpacing="0.10em">
                        PREMIUM
                      </Text>
                    </Box>
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
                _hover={{ bg: t.surfaceSubtle, color: t.text }}
              />
            </Tooltip>
          </Flex>
        </Box>

        {/* Statistics */}
        <Box>
          <HStack mb={4} spacing={2}>
            <Icon as={FaTrophy} color={t.accent} boxSize={4} />
            <Text fontFamily={MONO} fontSize="11px" fontWeight="700" color={t.textMuted} textTransform="uppercase" letterSpacing="0.08em">
              Travel Statistics
            </Text>
          </HStack>
          <SimpleGrid columns={{ base: 2, sm: 2, md: 4 }} spacing={3}>
            {[
              { label: "Photos", value: userStats.totalPhotos, icon: FaCamera },
              { label: "Countries", value: userStats.countriesVisited, icon: FaGlobe },
              { label: "Continents", value: continentCount, icon: FaFlag },
              { label: "Member Since", value: userStats.joinDate, icon: FaCalendarAlt },
            ].map((stat, i) => (
              <Box
                key={i}
                bg={cardBg}
                borderRadius="14px"
                border="1px solid"
                borderColor={borderColor}
                boxShadow={t.shadowSm}
                p={4}
                textAlign="center"
                transition="border-color .2s ease, box-shadow .2s ease, transform .2s ease"
                _hover={{
                  transform: "translateY(-2px)",
                  borderColor: t.hairlineStrong,
                  boxShadow: t.shadowMd,
                }}
              >
                <Box display="inline-flex" p={2} borderRadius="10px" bg={t.primarySoftBg} color={t.primary} mb={2}>
                  <Icon as={stat.icon} w={4} h={4} />
                </Box>
                <Text fontFamily={MONO} fontSize="lg" fontWeight="700" color={headingColor} lineHeight="1">{stat.value}</Text>
                <Text fontFamily={MONO} fontSize="10px" color={textColor} textTransform="uppercase" letterSpacing="0.06em" mt={1}>{stat.label}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* Countries */}
        <Box>
          <HStack mb={4} spacing={2}>
            <Icon as={FaFlag} color={t.primary} boxSize={4} />
            <Text fontFamily={MONO} fontSize="11px" fontWeight="700" color={t.textMuted} textTransform="uppercase" letterSpacing="0.08em">
              Countries Explored
            </Text>
          </HStack>
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
                {/* Countries progress bar — amber fill, atlas style */}
                <Box w="full" h="6px" borderRadius="full" bg={t.primarySoftBg} overflow="hidden" mb={3}>
                  <Box
                    h="full"
                    w={`${Math.min((countryNamesList.length / 195) * 100, 100)}%`}
                    borderRadius="full"
                    bg={t.primary}
                    boxShadow="0 0 8px rgba(235,181,114,0.5)"
                    transition="width .6s ease"
                  />
                </Box>
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
                        bg: t.surfaceSubtle,
                        borderColor: t.hairlineStrong,
                        transform: "translateY(-2px)",
                      }}
                    >
                      <Box width="48px" height="36px" mx="auto" mb={2}>
                        <EnhancedFlag countryCode={c.code} />
                      </Box>
                      <HStack justify="center" spacing={1}>
                        <Icon as={FaCamera} w={3} h={3} color={t.primary} />
                        <Text fontSize="xs" color={textColor}>{c.photoCount}</Text>
                      </HStack>
                    </MotionBox>
                  ))}
                </SimpleGrid>
              </>
            ) : (
              <VStack py={6} spacing={2}>
                <Icon as={FaRoute} w={9} h={9} color={t.textMuted} />
                <Text color={textColor} fontSize="sm">
                  Start uploading photos to see your countries.
                </Text>
              </VStack>
            )}
          </Box>
        </Box>

        {/* Action */}
        <Flex justify="center">
          <ModalButton variant="primary" onClick={onClose} leftIcon={<FaCompass />}>
            Continue Exploring
          </ModalButton>
        </Flex>

      </VStack>
    </BaseModal>
  );
};

export default UserProfileModal;
