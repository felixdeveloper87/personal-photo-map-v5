import React, { memo, useId, useCallback, useState, useEffect } from 'react';
import {
  Box,
  Text,
  Button,
  Icon,
  useDisclosure,
  useBreakpointValue,
  usePrefersReducedMotion,
  Spinner,
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
import { useLandingTokens } from '../landing/landingUI';

const MotionButton = motion.create(Button);

const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

const LANGUAGES = [
  ['en', 'English'],
  ['pt', 'Português'],
  ['es', 'Español'],
  ['fr', 'Français'],
  ['de', 'Deutsch'],
  ['it', 'Italiano'],
  ['ru', 'Русский'],
  ['zh', '中文'],
  ['ja', '日本語'],
  ['ko', '한국어'],
  ['ar', 'العربية'],
];

const JourneyStarterSection = ({ countryId, onUploadSuccess }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const t = useLandingTokens();

  // States
  const [wikipediaData, setWikipediaData] = useState(null);
  const [isLoadingWikipedia, setIsLoadingWikipedia] = useState(false);
  const [wikipediaError, setWikipediaError] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const countryName = getName(countryId?.toUpperCase(), 'en') || countryId?.toUpperCase() || 'this country';

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

  const prefersReducedMotion = usePrefersReducedMotion();
  const ctaSize = useBreakpointValue({ base: 'sm', sm: 'md', md: 'lg' });

  // Shared select styling for the dark cartographic surface
  const selectSx = {
    '& option': { background: t.surfaceSolid, color: t.text },
  };

  // Renders the AI / Wikipedia summary into themed blocks
  const renderSummary = (summary) =>
    summary.split('\n').map((line, index) => {
      const trimmedLine = line.trim();

      // Títulos em markdown (**texto** ou **texto:**)
      const boldMatch = trimmedLine.match(/^\*\*(.+?)\*\*:?\s*$/);
      if (boldMatch) {
        return (
          <Text
            key={index}
            as="h3"
            fontFamily={SERIF}
            fontSize="1.7rem"
            fontWeight="400"
            color={t.primary}
            lineHeight="1.1"
            mt={index > 0 ? 7 : 0}
            mb={3}
          >
            {boldMatch[1]}
          </Text>
        );
      }

      // Títulos de seção (multi-idioma): linhas terminando em ':' com palavras-chave
      const isSectionTitle =
        trimmedLine.endsWith(':') &&
        (/top\s*\d+/i.test(trimmedLine) ||
          /(attractions?|atrações?|atracciones?|attrazioni?)/i.test(trimmedLine) ||
          /(experiences?|experiências?|experiencias?|expériences?|erlebnisse?)/i.test(trimmedLine) ||
          /(tourist|turista|turístico|turiste|touriste)/i.test(trimmedLine) ||
          /(destinations?|destinos?|destinazioni?)/i.test(trimmedLine) ||
          /(opening|closing|paragraph|parágrafo|párrafo)/i.test(trimmedLine));

      if (isSectionTitle) {
        return (
          <Text
            key={index}
            as="h3"
            fontFamily={SERIF}
            fontSize="1.7rem"
            fontWeight="400"
            color={t.primary}
            lineHeight="1.1"
            mt={index > 0 ? 6 : 0}
            mb={2}
          >
            {trimmedLine}
          </Text>
        );
      }

      // Bullet points (-, •, *)
      const bulletMatch = trimmedLine.match(/^[-•*]\s+(.+)$/);
      const numberedMatch = /^\d+\)/.test(trimmedLine);
      if (bulletMatch || numberedMatch) {
        const itemText = bulletMatch ? bulletMatch[1] : trimmedLine.replace(/^\d+\)\s*/, '');
        return (
          <HStack key={index} align="flex-start" spacing={3.5} mb={3} pl={1}>
            <Box
              w="7px"
              h="7px"
              borderRadius="full"
              bg={t.accent}
              mt={2.5}
              flexShrink={0}
              boxShadow={`0 0 0 4px ${t.accentSoftBg}`}
            />
            <Text fontSize="md" color={t.textSoft} lineHeight="1.8" flex={1}>
              {itemText}
            </Text>
          </HStack>
        );
      }

      // Linha em branco
      if (trimmedLine === '') {
        return <Box key={index} h={3} />;
      }

      // Parágrafo normal
      return (
        <Text key={index} as="p" mb={3} color={t.textSoft} lineHeight="1.9">
          {trimmedLine}
        </Text>
      );
    });

  return (
    <>
      <Box
        position="relative"
        borderRadius="16px"
        border="1px solid"
        borderColor={t.hairline}
        bg={t.surface}
        boxShadow={t.shadowMd}
        overflow="hidden"
        _after={{
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          bg: t.primary,
        }}
      >
        <Box p={{ base: 4, sm: 5, md: 6 }}>
          {isLoadingWikipedia ? (
            <VStack spacing={4} py={8}>
              <Spinner size="lg" color={t.primary} thickness="3px" speed="0.7s" />
              <Text fontFamily={MONO} fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" color={t.textMuted}>
                Triangulating memories…
              </Text>
            </VStack>
          ) : wikipediaError ? (
            <HStack
              spacing={3}
              p={4}
              borderRadius="12px"
              bg={t.surfaceSubtle}
              border="1px solid"
              borderColor={t.hairline}
            >
              <Box w="8px" h="8px" borderRadius="full" bg={t.rose} flexShrink={0} />
              <Text fontSize="sm" color={t.textSoft}>
                {wikipediaError}
              </Text>
            </HStack>
          ) : wikipediaData?.summary ? (
            <VStack spacing={5} align="stretch">
              {/* Header: title + CTA */}
              <HStack
                justify="space-between"
                align="center"
                spacing={{ base: 4, md: 6 }}
                flexWrap="wrap"
              >
                <VStack align="start" spacing={2} flex={1} minW="220px">
                  <HStack spacing={2.5}>
                    <Box w="22px" h="2px" borderRadius="full" bg={t.primary} />
                    <Text
                      fontFamily={MONO}
                      fontSize="xs"
                      fontWeight="700"
                      textTransform="uppercase"
                      letterSpacing="0.08em"
                      color={t.primary}
                    >
                      Your next chapter
                    </Text>
                  </HStack>
                  <Text
                    fontFamily={SERIF}
                    fontWeight="400"
                    fontSize={{ base: '2rem', md: '2.6rem' }}
                    lineHeight="1.04"
                    color={t.text}
                  >
                    {countryName} is waiting for you
                  </Text>
                </VStack>

                <MotionButton
                  size={ctaSize}
                  leftIcon={<Icon as={FaRocket} boxSize={4} aria-hidden="true" />}
                  onClick={onOpen}
                  onKeyDown={handleKeyOpen}
                  px={7}
                  h="52px"
                  fontSize="md"
                  fontWeight="600"
                  borderRadius="10px"
                  bg={t.primary}
                  color="#0A0C11"
                  aria-label="Start your journey by uploading your first photo"
                  boxShadow="0 12px 32px rgba(235,181,114,0.18)"
                  _hover={{ bg: t.primaryHover, transform: 'translateY(-1px)', boxShadow: t.shadowMd }}
                  _active={{ bg: t.primaryActive, transform: 'translateY(0)' }}
                  transition="all 0.2s ease"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  width={{ base: '100%', sm: 'auto' }}
                >
                  Upload Your First Photo
                </MotionButton>
              </HStack>

              {/* Guide card */}
              <Box
                borderRadius="12px"
                border="1px solid"
                borderColor={t.hairline}
                bg={t.surfaceSubtle}
                p={{ base: 4, md: 5 }}
              >
                <HStack
                  justify="space-between"
                  align="center"
                  spacing={3}
                  flexWrap="wrap"
                  mb={4}
                  pb={4}
                  borderBottom="1px solid"
                  borderColor={t.hairline}
                >
                  <HStack spacing={3} align="baseline">
                    <Text fontFamily={SERIF} fontSize="1.8rem" fontWeight="400" color={t.text} lineHeight="1">
                      Guide
                    </Text>
                    <Text fontFamily={MONO} fontSize="11px" letterSpacing="0.04em" color={t.textMuted}>
                      {wikipediaData?.source === 'ai' ? '· Generated by AI' : '· From Wikipedia'}
                    </Text>
                  </HStack>

                  <Select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    size="sm"
                    maxW="160px"
                    borderRadius="8px"
                    bg={t.surfaceSolid}
                    color={t.text}
                    borderColor={t.hairlineStrong}
                    fontSize="sm"
                    _hover={{ borderColor: t.primary }}
                    _focus={{ borderColor: t.primary, boxShadow: `0 0 0 1px ${t.primary}` }}
                    sx={selectSx}
                  >
                    {LANGUAGES.map(([code, label]) => (
                      <option key={code} value={code}>
                        {label}
                      </option>
                    ))}
                  </Select>
                </HStack>

                <Box fontSize="md">{renderSummary(wikipediaData.summary)}</Box>
              </Box>

              {/* Closing statement */}
              <Box
                position="relative"
                borderRadius="12px"
                border="1px solid"
                borderColor={t.hairline}
                bg={t.surfaceSubtle}
                p={{ base: 5, md: 6 }}
                textAlign="center"
                overflow="hidden"
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  bgGradient: `linear(to-r, ${t.primary}, ${t.accent}, ${t.rose})`,
                }}
              >
                <Text
                  fontFamily={SERIF}
                  fontSize={{ base: '1.8rem', md: '2.3rem' }}
                  fontWeight="400"
                  color={t.text}
                  lineHeight="1.1"
                >
                  Every photo tells a story.
                </Text>
                <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} mt={2} lineHeight="1.6">
                  Share your unique perspective and build your personal travel collection.
                </Text>
              </Box>
            </VStack>
          ) : (
            <Text id={descId} fontSize="md" color={t.textSoft} lineHeight="1.7" maxW="720px">
              Begin documenting your travels in {countryName}. Upload photos to create a visual
              timeline of your experiences and discoveries.
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
