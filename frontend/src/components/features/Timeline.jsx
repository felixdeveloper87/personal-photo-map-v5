import React, { useContext, lazy, Suspense, useState, useMemo } from 'react';
import {
  Box,
  Flex,
  Text,
  Spinner,
  VStack,
  HStack,
  IconButton,
  Collapse,
  useBreakpointValue,
  useDisclosure,
  Switch,
  FormControl,
  FormLabel,
  Icon,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CountriesContext } from '../../context/CountriesContext';
import { AuthContext } from '../../context/AuthContext';
import ConversionModal from '../modals/ConversionModal';
import TimelineVideoModal from '../modals/TimelineVideoModal';
import VideoGeneratorButton from './photos/VideoGeneratorButton';
import { useLandingTokens, LandingButton } from './landing/landingUI';

import { FaGlobe, FaCamera, FaHistory } from 'react-icons/fa';

// Lazy loading of PhotoGallery
const LazyPhotoGallery = lazy(() => import('./photos/PhotoGallery'));

import { buildApiUrl, buildImageUrl } from '../../utils/apiConfig';

const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

// Fetch photos with error handling
const fetchAllPictures = async (year) => {
  let url = buildApiUrl('/api/images/allPictures');
  if (year) url += `?year=${year}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch photos: ${response.statusText}`);
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((image) => ({
    url: buildImageUrl(image.filePath || ''),
    id: image.id,
    year: image.year,
    countryId: image.countryId,
  }));
};

const Timeline = ({ selectedYear }) => {
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const { isLoggedIn, fullname } = useContext(AuthContext);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [viewByYear, setViewByYear] = useState(true); // Toggle state: true = by year, false = show all
  const t = useLandingTokens();

  // Extrair o primeiro nome do usuário
  const getFirstName = () => {
    if (!fullname) return 'Your';
    const firstName = fullname.trim().split(' ')[0];
    return firstName || 'Your';
  };
  const conversionModal = useDisclosure();
  const videoModal = useDisclosure();

  // Responsive values
  const padding = useBreakpointValue({ base: 3, md: 4, lg: 5 });

  // Fetch photos with React Query
  const { data: images = [], isLoading, error } = useQuery({
    queryKey: ['allPictures', selectedYear],
    queryFn: () => fetchAllPictures(selectedYear),
    staleTime: 5 * 60 * 1000,
    onSuccess: () => refreshCountriesWithPhotos?.(),
    enabled: isLoggedIn, // Only fetch when user is logged in
  });

  // Memoize grouped images to prevent unnecessary re-renders
  const groupedByYear = useMemo(() => {
    const sortedImages = [...images].sort((a, b) => b.year - a.year);
    return sortedImages.reduce((acc, image) => {
      if (!acc[image.year]) acc[image.year] = [];
      acc[image.year].push(image);
      return acc;
    }, {});
  }, [images]);

  // Sort years in descending order (most recent to oldest)
  const sortedYears = Object.keys(groupedByYear).sort((a, b) => Number(b) - Number(a));

  // Memoize sorted images for "Show All" mode (newest to oldest)
  const sortedAllImages = useMemo(() => {
    return [...images].sort((a, b) => {
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      return b.id - a.id;
    });
  }, [images]);

  // Toggle year collapse state
  const toggleYear = (year) => {
    setCollapsedYears((prev) => ({
      ...prev,
      [year]: !prev[year],
    }));
  };

  // Loading state - only show when logged in and actually loading
  if (isLoggedIn && isLoading) {
    return (
      <Box bg={t.bg} minH="100vh" display="flex" justifyContent="center" alignItems="center" p={padding}>
        <VStack spacing={4}>
          <Spinner size="xl" color={t.primary} thickness="3px" speed="0.7s" />
          <Text fontFamily={MONO} fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" color={t.textMuted}>
            Loading your timeline…
          </Text>
        </VStack>
      </Box>
    );
  }

  // Error state - only show when logged in and there's an error
  if (isLoggedIn && error) {
    return (
      <Box bg={t.bg} minH="100vh" display="flex" justifyContent="center" alignItems="center" p={padding}>
        <Text color={t.rose} fontSize="lg" fontWeight="600">
          Error: {error.message}
        </Text>
      </Box>
    );
  }

  // Don't render timeline content if user is not logged in
  if (!isLoggedIn) {
    return (
      <Box bg={t.bg} minH="100vh" p={padding}>
        <VStack spacing={6} align="center" justify="center" minH="60vh" maxW="560px" mx="auto" textAlign="center">
          <HStack spacing={2.5}>
            <Box w="22px" h="2px" borderRadius="full" bg={t.primary} />
            <Text fontFamily={MONO} fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={t.primary}>
              Your atlas of memories
            </Text>
          </HStack>
          <Text as="h1" fontFamily={SERIF} fontWeight="400" fontSize={{ base: '2.4rem', md: '3.4rem' }} lineHeight="1.04" color={t.text}>
            Timeline
          </Text>
          <Text color={t.textSoft} fontSize="lg" lineHeight="1.7">
            Please log in to view your photo timeline and organize your travel memories.
          </Text>
          <LandingButton leftIcon={<FaGlobe />} onClick={conversionModal.onOpen}>
            Learn More About Timeline Features
          </LandingButton>
        </VStack>

        {/* Authentication Modals - Must be rendered even when not logged in */}
        <ConversionModal isOpen={conversionModal.isOpen} onClose={conversionModal.onClose} />
      </Box>
    );
  }

  const stats = [
    { icon: FaCamera, label: 'Total Photos', value: images.length, tone: t.primary },
    { icon: FaHistory, label: 'Years', value: sortedYears.length, tone: t.accent },
    {
      icon: FaGlobe,
      label: 'Period',
      value: selectedYear
        ? selectedYear
        : sortedYears.length > 1
        ? `${sortedYears[sortedYears.length - 1]}–${sortedYears[0]}`
        : sortedYears[0],
      tone: t.rose,
    },
  ];

  return (
    <Box bg={t.bg} minH="100vh" p={padding}>
      <VStack spacing={5} align="stretch">
        {/* Header Section */}
        <Box
          position="relative"
          borderRadius="16px"
          border="1px solid"
          borderColor={t.hairline}
          bg={t.surface}
          boxShadow={t.shadowMd}
          p={{ base: 4, md: 6 }}
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
          <Flex
            direction={{ base: 'column', md: 'row' }}
            align={{ base: 'stretch', md: 'center' }}
            justify="space-between"
            gap={{ base: 5, md: 4 }}
          >
            {/* Title Section */}
            <VStack align={{ base: 'center', md: 'start' }} spacing={1.5}>
              <HStack spacing={2.5}>
                <Box w="22px" h="2px" borderRadius="full" bg={t.primary} />
                <Text fontFamily={MONO} fontSize="xs" fontWeight="700" textTransform="uppercase" letterSpacing="0.08em" color={t.primary}>
                  Your journey through memories
                </Text>
              </HStack>
              <Text as="h1" fontFamily={SERIF} fontWeight="400" fontSize={{ base: '2rem', md: '2.8rem' }} lineHeight="1.04" color={t.text}>
                {selectedYear ? `Timeline ${selectedYear}` : `${getFirstName()}'s Timeline`}
              </Text>
            </VStack>

            {/* Statistics */}
            {sortedYears.length > 0 ? (
              <HStack spacing={{ base: 3, md: 3 }} justify={{ base: 'space-between', md: 'flex-end' }} flexWrap="wrap">
                {stats.map((stat) => (
                  <HStack
                    key={stat.label}
                    spacing={2.5}
                    px={3.5}
                    py={2.5}
                    borderRadius="12px"
                    bg={t.surfaceSubtle}
                    border="1px solid"
                    borderColor={t.hairline}
                    minW={{ base: '0', md: '120px' }}
                  >
                    <Icon as={stat.icon} color={stat.tone} boxSize={4} />
                    <VStack align="start" spacing={0}>
                      <Text fontFamily={MONO} fontSize="9px" fontWeight="700" textTransform="uppercase" letterSpacing="0.1em" color={t.textMuted}>
                        {stat.label}
                      </Text>
                      <Text fontFamily={MONO} fontSize={{ base: 'lg', md: 'xl' }} fontWeight="700" color={t.text} lineHeight="1.1">
                        {stat.value}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </HStack>
            ) : (
              <Text color={t.textMuted} fontSize="md" textAlign="center" py={2}>
                No photos found. Start capturing your journey!
              </Text>
            )}
          </Flex>
        </Box>

        {/* View Toggle - Above Photos */}
        {sortedYears.length > 0 && (
          <Box
            bg={t.surface}
            borderRadius="12px"
            boxShadow={t.shadowSm}
            p={2.5}
            px={4}
            border="1px solid"
            borderColor={t.hairline}
            maxW="fit-content"
            mx="auto"
          >
            <HStack justify="center" align="center" spacing={4} flexWrap="wrap">
              <FormControl display="flex" alignItems="center" justifyContent="center" w="auto">
                <FormLabel htmlFor="view-toggle" mb="0" fontSize="sm" fontWeight="600" color={t.textSoft}>
                  {viewByYear ? 'Viewing by Year' : 'Showing All Photos'}
                </FormLabel>
                <Switch
                  id="view-toggle"
                  size="md"
                  isChecked={viewByYear}
                  onChange={() => setViewByYear(!viewByYear)}
                  sx={{
                    '.chakra-switch__track[data-checked]': { bg: t.primary },
                    '.chakra-switch__track': { bg: t.hairlineStrong },
                  }}
                />
              </FormControl>

              {/* Generate Video Button - Only show when viewing all photos */}
              {!viewByYear && sortedAllImages.length >= 2 && (
                <VideoGeneratorButton
                  images={sortedAllImages}
                  context="timeline"
                  contextName="Timeline"
                  contextYear={selectedYear}
                />
              )}
            </HStack>
          </Box>
        )}

        {sortedYears.length > 0 ? (
          viewByYear ? (
            // View by Year - Grouped by years with collapse
            <VStack spacing={3} align="stretch">
              <AnimatePresence>
                {sortedYears.map((year) => (
                  <motion.div
                    key={year}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Box
                      borderRadius="14px"
                      border="1px solid"
                      borderColor={t.hairline}
                      bg={t.surface}
                      boxShadow={t.shadowSm}
                      p={4}
                      position="relative"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '20px',
                        top: '54px',
                        bottom: '20px',
                        width: '2px',
                        bgGradient: `linear(to-b, ${t.primary}, transparent)`,
                        borderRadius: 'full',
                        display: { base: 'none', md: 'block' },
                      }}
                    >
                      <HStack justify="space-between" align="center" cursor="pointer" onClick={() => toggleYear(year)}>
                        <HStack spacing={3} align="center">
                          <Box w="9px" h="9px" borderRadius="full" bg={t.primary} boxShadow={`0 0 0 4px ${t.primarySoftBg}`} />
                          <Text
                            fontFamily={SERIF}
                            fontSize="1.9rem"
                            fontWeight="400"
                            color={t.text}
                            _hover={{ color: t.primary }}
                            transition="color 0.2s ease"
                            lineHeight="1"
                          >
                            {year}
                          </Text>
                          <Text fontFamily={MONO} fontSize="11px" color={t.textMuted}>
                            {`${(groupedByYear[year] || []).length} photos`}
                          </Text>
                        </HStack>
                        <HStack spacing={2}>
                          {/* Botão de vídeo para o ano */}
                          <VideoGeneratorButton
                            images={groupedByYear[year] || []}
                            context="year"
                            contextName="Timeline"
                            contextYear={year}
                          />
                          <IconButton
                            aria-label={`Toggle photos for ${year}`}
                            icon={collapsedYears[year] ? <ChevronDownIcon /> : <ChevronUpIcon />}
                            size="sm"
                            variant="ghost"
                            borderRadius="10px"
                            color={t.textSoft}
                            _hover={{ bg: t.primarySoftBg, color: t.primary }}
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              toggleYear(year);
                            }}
                          />
                        </HStack>
                      </HStack>
                      <Collapse in={!collapsedYears[year]} animateOpacity>
                        <Box mt={3} pl={{ base: 0, md: '32px' }}>
                          <Suspense fallback={<Spinner size="md" color={t.primary} />}>
                            <LazyPhotoGallery images={groupedByYear[year] || []} />
                          </Suspense>
                        </Box>
                      </Collapse>
                    </Box>
                  </motion.div>
                ))}
              </AnimatePresence>
            </VStack>
          ) : (
            // Show All - Single gallery with all photos (sorted newest to oldest)
            <Box bg={t.surface} borderRadius="14px" border="1px solid" borderColor={t.hairline} boxShadow={t.shadowSm} p={4}>
              <Suspense fallback={<Spinner size="xl" color={t.primary} />}>
                <LazyPhotoGallery images={sortedAllImages} />
              </Suspense>
            </Box>
          )
        ) : (
          <Text color={t.textSoft} fontSize="lg" textAlign="center" mt={8}>
            No photos to display yet. Start capturing your journey!
          </Text>
        )}
      </VStack>

      {/* Authentication Modals */}
      <ConversionModal isOpen={conversionModal.isOpen} onClose={conversionModal.onClose} />

      {/* Video Generator Modal */}
      <TimelineVideoModal isOpen={videoModal.isOpen} onClose={videoModal.onClose} />
    </Box>
  );
};

export default Timeline;
