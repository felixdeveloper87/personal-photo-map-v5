import React, { memo, useId, useCallback, useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  useColorModeValue,
  useColorMode,
  useBreakpointValue,
  usePrefersReducedMotion,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Select,
  useToast,
} from '@chakra-ui/react';
import { FaRocket } from 'react-icons/fa';
import { motion } from 'framer-motion';
import EnhancedImageUploaderModal from '../../modals/EnhancedImageUploaderModal';
import { fetchCountryCuriosities, fetchWikipediaData } from './services';
import { getName } from 'i18n-iso-countries';
import darkThemeImage from '../../../assets/darkTheme.jpg';
import lightThemeImage from '../../../assets/lightTheme.jpg';

const MotionButton = motion.create(Button);

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // States
  const [wikipediaData, setWikipediaData] = useState(null);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = useState(false);
  const [wikipediaError, setWikipediaError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const countryName = getName(countryId?.toUpperCase(), 'en') || countryId?.toUpperCase() || 'this country';

  const titleId = useId();
  const descId = useId();

  // Fetch curiosities (AI-generated) or Wikipedia fallback
  useEffect(() => {
    const loadCountryInfo = async () => {
      if (!countryId) return;
      setIsLoadingWikipedia(true);
      setWikipediaError(null);

      try {
        // Callback para quando o limite de tradução for excedido
        const handleLimitExceeded = () => {
          toast({
            title: 'Limite de tradução excedido',
            description: 'O limite diário de 10.000 caracteres foi atingido. O texto será exibido em inglês. Tente novamente amanhã.',
            status: 'warning',
            duration: 8000,
            isClosable: true,
            position: 'top',
          });
        };

        // Primeiro tenta buscar curiosidades geradas por IA do backend (sempre em inglês)
        let data = await fetchCountryCuriosities(countryId, selectedLanguage, handleLimitExceeded);
        
        // Se não encontrar, usa Wikipedia como fallback (apenas em inglês)
        if (!data || !data.summary) {
          console.log('⚠️ [Summary] AI curiosities not available yet, using Wikipedia as temporary fallback...');
          console.log('💡 [Tip] The backend will generate AI text on the next request. This may take 5-10 seconds.');
          data = await fetchWikipediaData(countryId);
        }
        
        // Log para debug
        if (data?.source === 'ai') {
          console.log(`✅ [Summary] Using AI-generated curiosities (OpenAI GPT, lang: ${selectedLanguage})`);
        } else if (data?.source === 'wikipedia') {
          console.log('📚 [Summary] Using Wikipedia summary (temporary fallback - AI will generate on next request)');
        }
        
        setWikipediaData(data);
      } catch (error) {
        console.warn('Erro ao carregar informações do país:', error);
        setWikipediaError('Unable to load country information');
      } finally {
        setIsLoadingWikipedia(false);
      }
    };
    loadCountryInfo();
  }, [countryId, selectedLanguage, toast]);

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
  const { colorMode } = useColorMode();

  const cardBg = useColorModeValue('white', 'black');
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

  const wikiBoxBorderColor = useColorModeValue('blue.200', 'blue.700');
  const wikiSmallIconBg = useColorModeValue('blue.100', 'blue.800');

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

  const ctaSize = useBreakpointValue({ base: 'sm', sm: 'md', md: 'lg' });
  const maxWidth = useBreakpointValue({ base: '100%', lg: '1600px', xl: '2200px', '2xl': '2600px' });
  
  // Overlay background for better text readability
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.80)', 'rgba(0, 0, 0, 0.90)');
  const backgroundImage = colorMode === 'dark' ? `url(${darkThemeImage})` : `url(${lightThemeImage})`;

  return (
    <>
      <Box
        position="relative"
        zIndex={2}
        maxW={maxWidth}
        mx="auto"
        bg="transparent"
        bgImage={backgroundImage}
        borderRadius="2xl"
        overflow="hidden"
        backdropFilter="blur(12px)"
        _before={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: overlayBg,
          zIndex: 0,
          borderRadius: 'lg',
        }}
      >
        <Box position="relative" zIndex={1}>
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
          <Box mb={8} maxW={maxWidth}>
            <Box
              borderRadius="2xl"
              py={5}
              px={1}
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
                <HStack
                  justify="center"
                  spacing={{ base: 3, md: 5 }}
                  flexWrap="wrap"
                  px={2}
                >
                  <Box
                    as="span"
                    display="inline-block"
                    filter={useColorModeValue(
                      'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 8px rgba(255, 255, 255, 0.9))',
                      'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9)) drop-shadow(0 0 10px rgba(0, 0, 0, 0.7))'
                    )}
                  >
                    <Text
                      fontSize={{ base: "xl", sm: "2xl" }}
                      fontWeight="bold"
                      bgGradient={wikiHeadingGradient}
                      bgClip="text"
                      lineHeight="1.2"
                      textAlign="center"
                      position="relative"
                      zIndex={1}
                    >
                      {countryName} is waiting for you
                    </Text>
                  </Box>

                  <MotionButton
                    size={ctaSize}
                    leftIcon={<Icon as={FaRocket} boxSize={5} aria-hidden="true" />}
                    onClick={onOpen}
                    onKeyDown={handleKeyOpen}
                    px={8}
                    py={5}
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
                </HStack>

                <Box
                  display="flex"
                  alignItems="center"
                  mb={3}
                  p={1}
                  bg={cardBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={wikiBoxBorderColor}
                  flexDirection="column"
                >
                  <HStack spacing={3} align="center" w="100%" mb={3} flexWrap="wrap">
                    <HStack spacing={3} align="center" flex={1} minW="100px">
                      <Text
                        p={2}
                        fontSize="xl"
                        fontWeight="black"
                        bgGradient={wikiHeadingGradient}
                        bgClip="text"
                      >
                        Guide
                      </Text>
                      <Text
                        fontSize="xs"
                        color={accentColor}
                        fontWeight="medium"
                      >
                        {wikipediaData?.source === 'ai' 
                          ? '• Generated by AI' 
                          : '• Knowledge from Wikipedia'}
                      </Text>
                    </HStack>
                    <Select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      size="sm"
                      maxW="150px"
                      bg={cardBg}
                      borderColor={borderColor}
                      _hover={{ borderColor: accentColor }}
                      _focus={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}` }}
                      fontSize="sm"
                    >
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                      <option value="it">Italiano</option>
                      <option value="ru">Русский</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                      <option value="ko">한국어</option>
                      <option value="ar">العربية</option>
                    </Select>
                  </HStack>

                  <Box fontSize="md" color={textColor} lineHeight="1.8" px={1}>
                    {wikipediaData.summary.split('\n').map((line, index) => {
                      const trimmedLine = line.trim();
                      
                      // Detecta títulos em markdown (**texto** ou **texto:**)
                      const boldMatch = trimmedLine.match(/^\*\*(.+?)\*\*:?\s*$/);
                      if (boldMatch) {
                        const titleText = boldMatch[1];
                        return (
                          <Text
                            key={index}
                            as="h3"
                            fontSize="xl"
                            fontWeight="bold"
                            color={accentColor}
                            mt={index > 0 ? 6 : 0}
                            mb={3}
                          >
                            {titleText}
                          </Text>
                        );
                      }
                      
                      // Detecta títulos de seção (funciona em múltiplos idiomas)
                      // Procura por linhas que terminam com ':' e contêm palavras-chave relacionadas a atrações/experiências
                      const isSectionTitle = trimmedLine.endsWith(':') && (
                        /top\s*\d+/i.test(trimmedLine) || // "Top 5", "Top 10", etc.
                        /(attractions?|atrações?|atracciones?|attractions?|attrazioni?)/i.test(trimmedLine) || // Attractions em vários idiomas
                        /(experiences?|experiências?|experiencias?|expériences?|erlebnisse?)/i.test(trimmedLine) || // Experiences em vários idiomas
                        /(tourist|turista|turístico|turiste|touriste)/i.test(trimmedLine) || // Tourist em vários idiomas
                        /(destinations?|destinos?|destinations?|destinazioni?)/i.test(trimmedLine) || // Destinations em vários idiomas
                        /(opening|closing|paragraph|parágrafo|párrafo)/i.test(trimmedLine) // Opening/Closing paragraph
                      );
                      
                      if (isSectionTitle) {
                        return (
                          <Text
                            key={index}
                            as="h3"
                            fontSize="xl"
                            fontWeight="bold"
                            color={accentColor}
                            mt={index > 0 ? 2 : 0}
                            mb={1}
                          >
                            {trimmedLine}
                          </Text>
                        );
                      }
                      
                      // Detecta bullet points (-, •, *, ou - seguido de espaço)
                      const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
                      if (bulletMatch) {
                        const bulletText = bulletMatch[1];
                        return (
                          <HStack
                            key={index}
                            align="flex-start"
                            spacing={4}
                            mb={3}
                            pl={1}
                          >
                            <Box
                              w="8px"
                              h="8px"
                              borderRadius="full"
                              bgGradient={useColorModeValue(
                                'linear(to-br, blue.500, purple.500)',
                                'linear(to-br, blue.400, purple.400)'
                              )}
                              mt={2.5}
                              flexShrink={0}
                              boxShadow={useColorModeValue(
                                '0 2px 4px rgba(59, 130, 246, 0.3)',
                                '0 2px 6px rgba(96, 165, 250, 0.4)'
                              )}
                            />
                            <Text
                              fontSize="md"
                              color={textColor}
                              lineHeight="1.8"
                              flex={1}
                              fontWeight="medium"
                            >
                              {bulletText}
                            </Text>
                          </HStack>
                        );
                      }
                      
                      // Detecta itens numerados (1), 2), etc.)
                      if (/^\d+\)/.test(trimmedLine)) {
                        return (
                          <HStack
                            key={index}
                            align="flex-start"
                            spacing={4}
                            mb={3}
                            pl={1}
                          >
                            <Box
                              w="8px"
                              h="8px"
                              borderRadius="full"
                              bgGradient={useColorModeValue(
                                'linear(to-br, blue.500, purple.500)',
                                'linear(to-br, blue.400, purple.400)'
                              )}
                              mt={2.5}
                              flexShrink={0}
                              boxShadow={useColorModeValue(
                                '0 2px 4px rgba(59, 130, 246, 0.3)',
                                '0 2px 6px rgba(96, 165, 250, 0.4)'
                              )}
                            />
                            <Text
                              fontSize="md"
                              color={textColor}
                              lineHeight="1.8"
                              flex={1}
                              fontWeight="medium"
                            >
                              {trimmedLine.replace(/^\d+\)\s*/, '')}
                            </Text>
                          </HStack>
                        );
                      }
                      
                      // Linha em branco
                      if (trimmedLine === '') {
                        return <Box key={index} h={4} />;
                      }
                      
                      // Texto normal (parágrafos)
                      return (
                        <Text
                          key={index}
                          as="p"
                          display="block"
                          mb={3}
                          textAlign="justify"
                          color={textColor}
                          lineHeight="1.9"
                        >
                          {trimmedLine}
                        </Text>
                      );
                    })}
                  </Box>
                </Box>

                <Box
                  p={4}
                  mx="auto"
                  bg={cardBg}
                  boxShadow={infoCardShadow}
                  position="relative"
                  overflow="hidden"
                  _before={{
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    bgGradient: 'linear(to-r, blue.400, purple.500, pink.500)',
                  }}
                >
                  <VStack spacing={4} align="center">
                    <Box textAlign="center">
                      <Text
                        fontSize={{ base: "xl", md: "2xl" }}
                        fontWeight="black"
                        bgGradient={useColorModeValue(
                          'linear(to-r, blue.600, purple.600, pink.600)',
                          'linear(to-r, blue.300, purple.300, pink.300)'
                        )}
                        bgClip="text"
                        lineHeight="1.3"
                        letterSpacing="tight"
                      >
                        Every photo tells a story.
                      </Text>
                      <Text
                        fontSize={{ base: "lg", md: "xl" }}
                        fontWeight="semibold"
                        color={useColorModeValue('gray.700', 'gray.200')}
                        mt={2}
                        lineHeight="1.4"
                      >
                        Share your unique perspective and build your personal travel collection.
                      </Text>
                    </Box>
                  </VStack>
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
