import React, { memo, useId, useCallback, useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  useColorModeValue,
  useBreakpointValue,
  usePrefersReducedMotion,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { FaRocket, FaWikipediaW } from 'react-icons/fa';
import { motion } from 'framer-motion';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';
import { fetchWikipediaData } from '../CountryDetails/services';
import { getName } from 'i18n-iso-countries';

const MotionButton = motion.create(Button);

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // States
  const [wikipediaData, setWikipediaData] = useState(null);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = useState(false);
  const [wikipediaError, setWikipediaError] = useState(null);

  const countryName = getName(countryId?.toUpperCase(), 'en') || countryId?.toUpperCase() || 'this country';

  const titleId = useId();
  const descId = useId();

  // Fetch Wikipedia data
  useEffect(() => {
    const loadWikipediaData = async () => {
      if (!countryId) return;
      setIsLoadingWikipedia(true);
      setWikipediaError(null);

      try {
        const data = await fetchWikipediaData(countryId);
        setWikipediaData(data);
      } catch (error) {
        console.warn('Erro ao carregar dados da Wikipedia:', error);
        setWikipediaError('Unable to load country information');
      } finally {
        setIsLoadingWikipedia(false);
      }
    };
    loadWikipediaData();
  }, [countryId]);

  // Accessibility: open with keyboard
  const handleKeyOpen = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen();
      }
    },
    [onOpen]
  );

  // Theme + motion prefs
  const prefersReducedMotion = usePrefersReducedMotion();

  // Tokens
  const bgGradient = useColorModeValue(
    'linear(135deg, #f8fafc 0%, #e2e8f0 100%)',
    'linear(135deg, #0f172a 0%, #1e293b 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const accentColor = useColorModeValue('blue.600', 'blue.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const buttonGradient = useColorModeValue(
    'linear(135deg, #3B82F6 0%, #2563EB 100%)',
    'linear(135deg, #60A5FA 0%, #3B82F6 100%)'
  );

  const wikiHeadingGradient = useColorModeValue(
    'linear(to-r, blue.600, purple.600, pink.500)',
    'linear(to-r, blue.300, purple.300, pink.300)'
  );
  const wikiBoxBg = useColorModeValue('blue.50', 'blue.900');
  const wikiBoxBorderColor = useColorModeValue('blue.200', 'blue.700');
  const wikiSmallIconBg = useColorModeValue('blue.100', 'blue.800');
  const wikiPromptTextColor = useColorModeValue('gray.600', 'gray.300');
  const wikiUnavailableColor = useColorModeValue('gray.500', 'gray.400');
  const wikiUnavailableBg = useColorModeValue('gray.100', 'gray.700');
  const wikiUnavailableBorder = useColorModeValue('gray.200', 'gray.600');

  const wikiLinkBg = useColorModeValue('white', 'gray.600');
  const wikiLinkBorderColor = useColorModeValue('gray.200', 'gray.500');
  const wikiLinkHoverBg = useColorModeValue('gray.50', 'gray.500');
  const wikiLinkHoverShadow = useColorModeValue(
    '0 4px 12px rgba(0,0,0,0.1)',
    '0 4px 12px rgba(0,0,0,0.3)'
  );

  const heroShadow = useColorModeValue(
    '0 10px 40px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
    '0 10px 40px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)'
  );
  const infoCardShadow = useColorModeValue(
    '0 4px 12px rgba(0,0,0,0.06)',
    '0 4px 12px rgba(0,0,0,0.25)'
  );
  const wikiSummaryCardShadow = useColorModeValue(
    '0 10px 30px rgba(0,0,0,0.08)',
    '0 10px 30px rgba(0,0,0,0.3)'
  );
  const ctaShadow = useColorModeValue(
    '0 4px 14px rgba(59, 130, 246, 0.4)',
    '0 4px 14px rgba(96, 165, 250, 0.3)'
  );
  const ctaHoverShadow = useColorModeValue(
    '0 6px 20px rgba(59, 130, 246, 0.5)',
    '0 6px 20px rgba(96, 165, 250, 0.4)'
  );

  // Responsiveness
  const containerPy = useBreakpointValue({ base: 6, sm: 8, md: 10, lg: 12 });
  const containerPx = useBreakpointValue({ base: 4, sm: 6, md: 8 });
  const ctaSize = useBreakpointValue({ base: 'sm', sm: 'md', md: 'lg' });
  const maxWidth = useBreakpointValue({
    base: '100%',
    sm: '95%',
    md: '90%',
    lg: '900px',
  });

  return (
    <>
      <Box
        role="region"
        aria-labelledby={titleId}
        aria-describedby={descId}
        textAlign="center"
        py={containerPy}
        px={containerPx}
        bgGradient={bgGradient}
        borderRadius="2xl"
        position="relative"
        overflow="hidden"
        mb={8}
        boxShadow={heroShadow}
        border="1px solid"
        borderColor={borderColor}
      >
        <Box position="relative" zIndex={2} maxW={maxWidth} mx="auto">
          {isLoadingWikipedia ? (
            <Box textAlign="center" py={6} mb={8}>
              <VStack spacing={4}>
                <Spinner size="lg" color={accentColor} thickness="4px" />
                <Text fontSize="sm" color={textColor} fontWeight="medium">
                  Loading country information...
                </Text>
              </VStack>
            </Box>
          ) : wikipediaError ? (
            <Box mb={8} maxW="720px" mx="auto">
              <Alert status="info" borderRadius="xl" variant="subtle">
                <AlertIcon />
                <Text fontSize="sm" color={textColor}>
                  {wikipediaError}
                </Text>
              </Alert>
            </Box>
          ) : wikipediaData?.summary ? (
            <Box mb={8} maxW="900px" mx="auto">
              <Box
                bg={cardBg}
                borderRadius="2xl"
                p={6}
                border="1px solid"
                borderColor={borderColor}
                boxShadow={wikiSummaryCardShadow}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  bgGradient: 'linear(to-r, blue.400, purple.400, pink.400)',
                }}
              >
                <VStack spacing={4} align="stretch">
                  <Box textAlign="center" mb={2}>
                    <Text
                      fontSize="2xl"
                      fontWeight="bold"
                      bgGradient={wikiHeadingGradient}
                      bgClip="text"
                      lineHeight="1.2"
                    >
                      {countryName} is waiting for you
                    </Text>
                  </Box>

                  <Box
                    display="flex"
                    alignItems="center"
                    mb={5}
                    p={4}
                    bg={wikiBoxBg}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={wikiBoxBorderColor}
                  >
                    <HStack spacing={3} align="center" w="100%">
                      <Box
                        p={2}
                        bg={wikiSmallIconBg}
                        borderRadius="lg"
                        flexShrink={0}
                      >
                        <Icon as={FaWikipediaW} color="blue.500" boxSize={5} />
                      </Box>
                      <HStack spacing={3} align="center" flex={1}>
                        <Text
                          fontSize="xl"
                          fontWeight="black"
                          bgGradient={wikiHeadingGradient}
                          bgClip="text"
                        >
                          About {countryName}
                        </Text>
                        <Text
                          fontSize="xs"
                          color={accentColor}
                          fontWeight="medium"
                        >
                          • Knowledge from Wikipedia
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>

                  <Divider borderColor={borderColor} />

                  <Text
                    fontSize="md"
                    color={textColor}
                    lineHeight="1.7"
                    textAlign="justify"
                  >
                    {wikipediaData.summary}
                  </Text>

                  <Box
                    mt={4}
                    p={4}
                    bg={wikiBoxBg}
                    borderRadius="xl"
                    border="1px solid"
                    borderColor={wikiBoxBorderColor}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      flexDirection={{ base: 'column', sm: 'row' }}
                      gap={3}
                    >
                      <Text
                        fontSize="sm"
                        color={wikiPromptTextColor}
                        fontWeight="medium"
                      >
                        Want to learn more?
                      </Text>
                      {wikipediaData.content_urls?.desktop?.page ? (
                        <Text
                          as="a"
                          href={wikipediaData.content_urls.desktop.page}
                          target="_blank"
                          rel="noopener noreferrer"
                          fontSize="sm"
                          fontWeight="bold"
                          color={accentColor}
                          px={4}
                          py={2}
                          bg={wikiLinkBg}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor={wikiLinkBorderColor}
                          _hover={{
                            bg: wikiLinkHoverBg,
                            transform: 'translateY(-1px)',
                            boxShadow: wikiLinkHoverShadow,
                          }}
                          transition="all 0.2s ease"
                          textAlign="center"
                        >
                          Read on Wikipedia →
                        </Text>
                      ) : (
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color={wikiUnavailableColor}
                          px={4}
                          py={2}
                          bg={wikiUnavailableBg}
                          borderRadius="lg"
                          border="1px solid"
                          borderColor={wikiUnavailableBorder}
                          textAlign="center"
                        >
                          Link unavailable
                        </Text>
                      )}
                    </Box>
                  </Box>
                </VStack>
              </Box>
            </Box>
          ) : (
            <Text
              id={descId}
              fontSize="md"
              color={textColor}
              mb={8}
              lineHeight="1.7"
              maxW="720px"
              mx="auto"
            >
              Begin documenting your travels in {countryName}. Upload photos to
              create a visual timeline of your experiences and discoveries.
            </Text>
          )}

          <Box px={2}>
            <MotionButton
              size={ctaSize}
              leftIcon={<Icon as={FaRocket} boxSize={5} aria-hidden="true" />}
              onClick={onOpen}
              onKeyDown={handleKeyOpen}
              px={10}
              py={6}
              fontSize="lg"
              fontWeight="semibold"
              borderRadius="xl"
              bgGradient={buttonGradient}
              color="white"
              role="button"
              aria-label="Start your journey by uploading your first photo"
              boxShadow={ctaShadow}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: ctaHoverShadow,
              }}
              transition="all 0.2s ease"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              width={{ base: '100%', sm: 'auto' }}
            >
              Upload Your First Photo
            </MotionButton>
          </Box>

          <Box
            mt={8}
            p={6}
            bg={cardBg}
            borderRadius="xl"
            border="1px solid"
            borderColor={borderColor}
            maxW="720px"
            mx="auto"
            boxShadow={infoCardShadow}
          >
            <Text
              fontSize="md"
              color={textColor}
              textAlign="center"
              lineHeight="1.7"
            >
              Every photo tells a story. Share your unique perspective and build
              your personal travel collection.
            </Text>
          </Box>
        </Box>
      </Box>

      <EnhancedImageUploaderModal
        countryId={countryId}
        onUploadSuccess={onUploadSuccess}
        isOpen={isOpen}
        onClose={onClose}
      />
    </>
  );
};

export default memo(JourneyStarterSection);
