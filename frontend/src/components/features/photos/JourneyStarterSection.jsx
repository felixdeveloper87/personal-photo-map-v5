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

const MotionButton = motion(Button);

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const {
    isOpen: isImageUploaderOpen,
    onOpen: onImageUploaderOpen,
    onClose: onImageUploaderClose,
  } = useDisclosure();

  // Estados para dados da Wikipedia
  const [wikipediaData, setWikipediaData] = useState(null);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = useState(false);
  const [wikipediaError, setWikipediaError] = useState(null);

  // Obter nome do país
  const countryName = getName(countryId?.toUpperCase(), 'en') || countryId?.toUpperCase() || 'this country';

  // A11y ids
  const titleId = useId();
  const descId = useId();

  // Buscar dados da Wikipedia quando o countryId mudar
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

  // Respects users who prefer reduced motion
  const prefersReducedMotion = usePrefersReducedMotion();

  // Theme-aware tokens (computed once per render) - Professional palette
  const bgGradient = useColorModeValue(
    'linear(135deg, #f8fafc 0%, #e2e8f0 100%)',
    'linear(135deg, #0f172a 0%, #1e293b 100%)'
  );
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const accentColor = useColorModeValue('blue.600', 'blue.400');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const titleColor = useColorModeValue('gray.900', 'white');
  const subtitleColor = useColorModeValue('gray.700', 'gray.300');

  const buttonGradient = useColorModeValue(
    'linear(135deg, #3B82F6 0%, #2563EB 100%)',
    'linear(135deg, #60A5FA 0%, #3B82F6 100%)'
  );

  // Responsivo - Totalmente adaptável para todas as telas
  const containerPy = useBreakpointValue({ 
    base: 6, 
    sm: 8, 
    md: 10, 
    lg: 12, 
    xl: 14, 
    '2xl': 16 
  });
  const containerPx = useBreakpointValue({ 
    base: 4, 
    sm: 5, 
    md: 6, 
    lg: 8, 
    xl: 10, 
    '2xl': 12 
  });
  const titleSize = useBreakpointValue({ 
    base: 'xl', 
    sm: '3xl', 
    md: '4xl', 
    lg: '4xl',
    xl: '5xl',
    '2xl': '5xl'
  });
  const subtitleSize = useBreakpointValue({ 
    base: 'md', 
    sm: 'lg', 
    md: 'xl', 
    lg: 'xl',
    xl: '2xl',
    '2xl': '2xl'
  });
  const ctaSize = useBreakpointValue({ 
    base: 'sm', 
    sm: 'md', 
    md: 'md',
    lg: 'lg',
    xl: 'lg'
  });
  const maxWidth = useBreakpointValue({
    base: '100%',
    sm: '95%',
    md: '90%',
    lg: '900px',
    xl: '1000px',
    '2xl': '1100px'
  });

  // A11y: abrir via teclado também
  const handleKeyOpen = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onImageUploaderOpen();
      }
    },
    [onImageUploaderOpen]
  );

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
        boxShadow={useColorModeValue(
          '0 10px 40px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
          '0 10px 40px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)'
        )}
        border="1px solid"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
      >

        {/* Main Content */}
        <Box position="relative" zIndex={2} maxW={maxWidth} mx="auto">
          {/* Wikipedia Info Section */}
          {isLoadingWikipedia ? (
            <Box textAlign="center" py={{ base: 4, sm: 5, md: 6 }} mb={{ base: 6, md: 8 }}>
              <VStack spacing={{ base: 3, md: 4 }}>
                <Spinner 
                  size={{ base: 'md', sm: 'lg' }} 
                  color={accentColor} 
                  thickness="4px" 
                />
                <Text 
                  fontSize={{ base: 'xs', sm: 'sm' }} 
                  color={textColor} 
                  fontWeight="medium"
                  px={{ base: 4, sm: 0 }}
                >
                  Loading country information...
                </Text>
              </VStack>
            </Box>
          ) : wikipediaError ? (
            <Box mb={{ base: 6, md: 8 }} maxW={{ base: '100%', sm: '95%', md: '720px' }} mx="auto" px={{ base: 2, sm: 0 }}>
              <Alert status="info" borderRadius={{ base: 'lg', md: 'xl' }} variant="subtle">
                <AlertIcon />
                <Text fontSize={{ base: 'xs', sm: 'sm' }} color={textColor}>
                  {wikipediaError}
                </Text>
              </Alert>
            </Box>
          ) : wikipediaData?.summary ? (
            <Box 
              mb={{ base: 6, md: 8 }} 
              maxW={{ base: '100%', sm: '95%', md: '800px', lg: '850px', xl: '900px' }} 
              mx="auto"
              px={{ base: 2, sm: 0 }}
            >
              {/* Wikipedia Summary Card */}
              <Box
                bg={cardBg}
                borderRadius={{ base: 'xl', md: '2xl' }}
                p={{ base: 4, sm: 5, md: 6, lg: 7, xl: 8 }}
                border="1px solid"
                borderColor={borderColor}
                boxShadow={useColorModeValue(
                  '0 10px 30px rgba(0,0,0,0.08)',
                  '0 10px 30px rgba(0,0,0,0.3)'
                )}
                position="relative"
                overflow="hidden"
                _before={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: { base: '3px', md: '4px' },
                  bgGradient: 'linear(to-r, blue.400, purple.400, pink.400)',
                }}
              >
                <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                  {/* Texto incorporado */}
                  <Box textAlign="center" mb={{ base: 2, md: 3 }}>
                    <Text
                      fontSize={{ base: 'lg', sm: 'xl', md: '2xl' }}
                      fontWeight="bold"
                      bgGradient={useColorModeValue(
                        'linear(to-r, blue.600, purple.600, pink.500)',
                        'linear(to-r, blue.300, purple.300, pink.300)'
                      )}
                      bgClip="text"
                      lineHeight="1.2"
                      letterSpacing="tight"
                      px={{ base: 2, sm: 0 }}
                      textShadow={useColorModeValue(
                        '0 2px 4px rgba(59, 130, 246, 0.2)',
                        '0 2px 4px rgba(0, 0, 0, 0.3)'
                      )}
                    >
                      {countryName} is waiting for you
                    </Text>
                  </Box>

                  {/* Header with enhanced styling */}
                  <Box
                    display="flex"
                    alignItems="center"
                    mb={{ base: 4, sm: 5, md: 6 }}
                    p={{ base: 3, sm: 3.5, md: 4 }}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius={{ base: 'lg', md: 'xl' }}
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                    flexDirection={{ base: 'row', sm: 'row' }}
                  >
                    <HStack spacing={{ base: 2, sm: 3 }} align="center" w="100%">
                      <Box
                        p={{ base: 1.5, sm: 2 }}
                        bg={useColorModeValue('blue.100', 'blue.800')}
                        borderRadius={{ base: 'md', md: 'lg' }}
                        flexShrink={0}
                      >
                        <Icon 
                          as={FaWikipediaW} 
                          color="blue.500" 
                          boxSize={{ base: 4, sm: 5, md: 6 }} 
                        />
                      </Box>
                      <HStack spacing={{ base: 2, sm: 3 }} align="center" flex={1}>
                        <Text
                          fontSize={{ base: 'sm', sm: 'lg', md: '2xl' }}
                          fontWeight="black"
                          bgGradient={useColorModeValue(
                            'linear(to-r, blue.600, purple.600)',
                            'linear(to-r, blue.300, purple.300)'
                          )}
                          bgClip="text"
                          lineHeight="1.2"
                          whiteSpace="nowrap"
                        >
                          About {countryName}
                        </Text>
                        <Text
                          fontSize={{ base: '2xs', sm: 'xs', md: 'sm' }}
                          color={useColorModeValue('blue.600', 'blue.300')}
                          fontWeight="medium"
                          whiteSpace="nowrap"
                        >
                          <Box as="span" display={{ base: 'inline', sm: 'inline' }}>
                            • <Box as="span" display={{ base: 'none', sm: 'inline' }}>Knowledge </Box>from Wikipedia
                          </Box>
                        </Text>
                      </HStack>
                    </HStack>
                  </Box>

                  <Divider borderColor={borderColor} />

                  {/* Summary Content */}
                  <Text
                    fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
                    color={textColor}
                    lineHeight={{ base: '1.6', md: '1.7' }}
                    fontWeight="normal"
                    textAlign={{ base: 'left', md: 'justify' }}
                  >
                    {wikipediaData.summary}
                  </Text>

                  {/* Wikipedia Link */}
                  <Box
                    mt={{ base: 3, md: 4 }}
                    p={{ base: 3, sm: 3.5, md: 4 }}
                    bg={useColorModeValue('blue.50', 'blue.900')}
                    borderRadius={{ base: 'lg', md: 'xl' }}
                    border="1px solid"
                    borderColor={useColorModeValue('blue.200', 'blue.700')}
                  >
                    <Box 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="space-between"
                      flexDirection={{ base: 'column', sm: 'row' }}
                      gap={{ base: 3, sm: 0 }}
                    >
                      <Text
                        fontSize={{ base: 'xs', sm: 'sm' }}
                        color={useColorModeValue('gray.600', 'gray.300')}
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
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          fontWeight="bold"
                          color={accentColor}
                          textDecoration="none"
                          px={{ base: 3, sm: 4 }}
                          py={{ base: 1.5, sm: 2 }}
                          bg={useColorModeValue('white', 'gray.600')}
                          borderRadius={{ base: 'md', md: 'lg' }}
                          border="1px solid"
                          borderColor={useColorModeValue('gray.200', 'gray.500')}
                          _hover={{
                            textDecoration: 'none',
                            bg: useColorModeValue('gray.50', 'gray.500'),
                            transform: 'translateY(-1px)',
                            boxShadow: useColorModeValue(
                              '0 4px 12px rgba(0,0,0,0.1)',
                              '0 4px 12px rgba(0,0,0,0.3)'
                            )
                          }}
                          transition="all 0.2s ease"
                          width={{ base: '100%', sm: 'auto' }}
                          textAlign="center"
                        >
                          Read on Wikipedia →
                        </Text>
                      ) : (
                        <Text
                          fontSize={{ base: 'xs', sm: 'sm' }}
                          fontWeight="bold"
                          color={useColorModeValue('gray.500', 'gray.400')}
                          px={{ base: 3, sm: 4 }}
                          py={{ base: 1.5, sm: 2 }}
                          bg={useColorModeValue('gray.100', 'gray.700')}
                          borderRadius={{ base: 'md', md: 'lg' }}
                          border="1px solid"
                          borderColor={useColorModeValue('gray.200', 'gray.600')}
                          width={{ base: '100%', sm: 'auto' }}
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
            /* Fallback Description */
            <Text
              id={descId}
              fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
              color={textColor}
              mb={{ base: 6, md: 8 }}
              lineHeight="1.7"
              fontWeight="normal"
              maxW={{ base: '100%', sm: '95%', md: '720px' }}
              mx="auto"
              px={{ base: 2, sm: 0 }}
            >
              Begin documenting your travels in {countryName}. Upload photos to create a visual timeline of your experiences and discoveries.
            </Text>
          )}

          {/* CTA */}
          <Box px={{ base: 2, sm: 0 }}>
            <MotionButton
              size={ctaSize}
              leftIcon={<Icon as={FaRocket} boxSize={{ base: 4, sm: 4, md: 5 }} aria-hidden="true" />}
              onClick={onImageUploaderOpen}
              onKeyDown={handleKeyOpen}
              px={{ base: 6, sm: 8, md: 10, lg: 12 }}
              py={{ base: 5, sm: 6, md: 7 }}
              fontSize={{ base: 'sm', sm: 'md', md: 'lg' }}
              fontWeight="semibold"
              borderRadius={{ base: 'lg', md: 'xl' }}
              bgGradient={buttonGradient}
              color="white"
              role="button"
              aria-label="Start your journey by uploading your first photo"
              boxShadow={useColorModeValue(
                '0 4px 14px rgba(59, 130, 246, 0.4)',
                '0 4px 14px rgba(96, 165, 250, 0.3)'
              )}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: useColorModeValue(
                  '0 6px 20px rgba(59, 130, 246, 0.5)',
                  '0 6px 20px rgba(96, 165, 250, 0.4)'
                ),
              }}
              transition="all 0.2s ease"
              whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
              width={{ base: '100%', sm: 'auto' }}
            >
              Upload Your First Photo
            </MotionButton>
          </Box>

          {/* Info Card */}
          <Box
            mt={{ base: 6, sm: 7, md: 8 }}
            p={{ base: 4, sm: 5, md: 6 }}
            bg={cardBg}
            borderRadius={{ base: 'lg', md: 'xl' }}
            border="1px solid"
            borderColor={borderColor}
            maxW={{ base: '100%', sm: '95%', md: '680px', lg: '720px' }}
            mx={{ base: 2, sm: 'auto' }}
            boxShadow={useColorModeValue(
              '0 4px 12px rgba(0,0,0,0.06)',
              '0 4px 12px rgba(0,0,0,0.25)'
            )}
          >
            <Text
              fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
              color={textColor}
              textAlign="center"
              fontWeight="normal"
              lineHeight={{ base: '1.6', md: '1.7' }}
            >
              Every photo tells a story. Share your unique perspective and build your personal travel collection.
            </Text>
          </Box>
        </Box>
      </Box>

      <EnhancedImageUploaderModal
        countryId={countryId}
        onUploadSuccess={onUploadSuccess}
        isOpen={isImageUploaderOpen}
        onClose={onImageUploaderClose}
      />
    </>
  );
};

export default memo(JourneyStarterSection);
