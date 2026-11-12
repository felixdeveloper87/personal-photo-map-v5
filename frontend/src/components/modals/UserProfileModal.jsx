import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { CountriesContext } from '../../context/CountriesContext';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { motion } from 'framer-motion';
import { Avatar, Box, Circle, Flex, HStack, Icon, IconButton, SimpleGrid, Text, Tooltip, VStack } from '@chakra-ui/react';
import {
  HiCalendarDays,
  HiCamera,
  HiEnvelope,
  HiFlag,
  HiGlobeAmericas,
  HiMap,
  HiPencilSquare,
  HiSparkles,
  HiUser,
} from 'react-icons/hi2';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { ModalActions, ModalSection, ModalStat, ModalState, Panel, ToneBadge, ToneProgress } from './ModalKit';
import EnhancedFlag from '../features/CountryDetails/EnhancedFlag';
import { color, font, radius, type } from '../../design/tokens';

countries.registerLocale(en);
const MotionBox = motion.create(Box);

const UserProfileModal = ({ isOpen, onClose }) => {
  const { isLoggedIn, fullname, email, isPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);
  const [userStats, setUserStats] = useState({
    totalPhotos: 0,
    countriesVisited: 0,
    joinDate: new Date().getFullYear(),
  });
  const [continentCount, setContinentCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      setUserStats({
        totalPhotos: photoCount || 0,
        countriesVisited: countryCount || 0,
        joinDate: new Date().getFullYear(),
      });
    }
  }, [isLoggedIn, photoCount, countryCount]);

  useEffect(() => {
    if (isLoggedIn && countriesWithPhotos?.length > 0) {
      getContinentCount().then(setContinentCount).catch(() => setContinentCount(0));
    } else {
      setContinentCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, countriesWithPhotos]);

  const getContinentCount = async () => {
    if (!countriesWithPhotos?.length) return 0;
    const set = new Set();
    const batchSize = 5;

    for (let i = 0; i < countriesWithPhotos.length; i += batchSize) {
      const batch = countriesWithPhotos.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(async (item) => {
          const code =
            typeof item === 'object'
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
        })
      );
      results.forEach((r) => r && set.add(r));
    }

    return set.size;
  };

  const countryNamesList =
    countriesWithPhotos?.map((item) => {
      const code = typeof item === 'object' ? String(item.countryId || '').toUpperCase() : String(item).toUpperCase();
      const name = typeof item === 'object' ? item.countryName || code : countries.getName(code, 'en');
      return { code, name: name || code, photoCount: item.photoCount || 0 };
    }) || [];

  const worldPct = Math.min((countryNamesList.length / 195) * 100, 100);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="Your account"
      title="Profile"
      icon={HiUser}
      size={{ base: 'full', sm: 'md', md: 'lg', lg: 'xl' }}
      footer={
        <ModalActions>
          <ModalButton variant="primary" onClick={onClose} leftIcon={<HiMap />}>
            Continue exploring
          </ModalButton>
        </ModalActions>
      }
    >
      <VStack spacing={6} align="stretch">
        {/* Identity */}
        <Panel p={{ base: 4, sm: 5 }}>
          <Flex align="center" justify="space-between" gap={3}>
            <HStack spacing={4} minW={0}>
              <Box position="relative" flexShrink={0}>
                <Avatar
                  size="md"
                  name={fullname}
                  bg={color.primary}
                  color={color.textOnBrand}
                  fontWeight="700"
                  ring="2px"
                  ringOffset="2px"
                  ringOffsetColor={color.surfaceRaised}
                  ringColor={isPremium ? color.primary : color.hairlineMid}
                />
                {isPremium && (
                  <Circle
                    size="22px"
                    bg={color.primary}
                    position="absolute"
                    bottom="-3px"
                    right="-3px"
                    border="2px solid"
                    borderColor={color.surfaceRaised}
                  >
                    <Icon as={HiSparkles} color={color.textOnBrand} boxSize={3} />
                  </Circle>
                )}
              </Box>

              <VStack align="start" spacing={1} minW={0}>
                <HStack spacing={2.5} flexWrap="wrap">
                  <Text fontFamily={font.display} fontSize="1.6rem" color={color.text} lineHeight="1.05" noOfLines={1}>
                    {fullname}
                  </Text>
                  {isPremium && (
                    <ToneBadge tone="brand" icon={HiSparkles}>
                      Premium
                    </ToneBadge>
                  )}
                </HStack>
                <HStack spacing={2} color={color.textSoft} minW={0}>
                  <Icon as={HiEnvelope} boxSize={3.5} flexShrink={0} />
                  <Text fontSize="sm" noOfLines={1}>
                    {email}
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            <Tooltip label="Edit profile" hasArrow>
              <IconButton
                aria-label="Edit profile"
                icon={<HiPencilSquare />}
                size="sm"
                variant="ghost"
                color={color.textSoft}
                borderRadius="10px"
                _hover={{ bg: color.surfaceHover, color: color.text }}
              />
            </Tooltip>
          </Flex>
        </Panel>

        {/* Statistics */}
        <ModalSection title="Travel statistics">
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
            <ModalStat icon={HiCamera} value={userStats.totalPhotos} label="Photos" tone="brand" />
            <ModalStat icon={HiGlobeAmericas} value={userStats.countriesVisited} label="Countries" tone="teal" />
            <ModalStat icon={HiFlag} value={continentCount} label="Continents" tone="rose" />
            <ModalStat icon={HiCalendarDays} value={userStats.joinDate} label="Member since" tone="neutral" />
          </SimpleGrid>
        </ModalSection>

        {/* Countries */}
        <ModalSection
          title="Countries explored"
          action={
            countryNamesList.length > 0 && (
              <Text {...type.label} color={color.primary}>
                {countryNamesList.length} / 195
              </Text>
            )
          }
        >
          {countryNamesList.length > 0 ? (
            <VStack spacing={4} align="stretch">
              <ToneProgress value={worldPct} />
              <SimpleGrid columns={{ base: 3, sm: 4, md: 6 }} spacing={2}>
                {countryNamesList.slice(0, 12).map((c, i) => (
                  <MotionBox
                    key={c.code || i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    p={2.5}
                    borderRadius={radius.md}
                    bg="rgba(236,231,220,0.025)"
                    border="1px solid"
                    borderColor={color.hairline}
                    textAlign="center"
                    title={c.name}
                  >
                    <Box w="44px" h="30px" mx="auto" mb={2}>
                      <EnhancedFlag countryCode={c.code} />
                    </Box>
                    <HStack justify="center" spacing={1} color={color.textMuted}>
                      <Icon as={HiCamera} boxSize={3} />
                      <Text {...type.label} color={color.textSoft}>
                        {c.photoCount}
                      </Text>
                    </HStack>
                  </MotionBox>
                ))}
              </SimpleGrid>
            </VStack>
          ) : (
            <Panel>
              <ModalState kind="empty" icon={HiMap} title="No countries yet" py={6}>
                Start uploading photos to see your countries.
              </ModalState>
            </Panel>
          )}
        </ModalSection>
      </VStack>
    </BaseModal>
  );
};

export default UserProfileModal;
