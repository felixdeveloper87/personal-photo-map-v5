import React, { useContext, lazy, Suspense, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Text,
  Spinner,
  VStack,
  HStack,
  IconButton,
  useColorModeValue,
  Collapse,
  Heading,
  useBreakpointValue,
  useDisclosure,
  Button,
  Badge,
  Divider,
  Icon,
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { CountriesContext } from '../../context/CountriesContext';
import { AuthContext } from '../../context/AuthContext';
import ConversionModal from '../modals/ConversionModal';
import TimelineVideoModal from '../modals/TimelineVideoModal';
import VideoGeneratorButton from './photos/VideoGeneratorButton';
import CacheStatus from '../ui/CacheStatus';
import { FaGlobe, FaCamera, FaHistory } from 'react-icons/fa';

// Lazy loading of PhotoGallery
const LazyPhotoGallery = lazy(() => import('./photos/PhotoGallery'));

import { buildApiUrl, buildImageUrl } from '../../utils/apiConfig';

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
  const navigate = useNavigate();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const { isLoggedIn, fullname } = useContext(AuthContext);
  const [collapsedYears, setCollapsedYears] = useState({});
  const [viewByYear, setViewByYear] = useState(true); // Toggle state: true = by year, false = show all

  // Extrair o primeiro nome do usuário
  const getFirstName = () => {
    if (!fullname) return 'Your';
    const firstName = fullname.trim().split(' ')[0];
    return firstName || 'Your';
  };
  const conversionModal = useDisclosure();
  const videoModal = useDisclosure();

  // Responsive values
  const fontSize = useBreakpointValue({ base: 'lg', md: 'xl', lg: '2xl' });
  const padding = useBreakpointValue({ base: 1, md: 6, lg: 6 });

  // Color scheme
  const textColor = useColorModeValue('black.800', 'white');
  const accentColor = useColorModeValue('black.500', 'white.300');
  const cardBg = useColorModeValue('white', 'black');
  // Precompute theme values used in conditional branches
  const headerBorderColor = useColorModeValue('gray.200', 'gray.700');
  const headerDividerColor = useColorModeValue('gray.300', 'gray.600');
  const viewToggleBorderColor = useColorModeValue('gray.200', 'gray.700');


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
      // Sort by year first (descending)
      if (b.year !== a.year) {
        return b.year - a.year;
      }
      // If same year, sort by id (most recent uploads first)
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
      <Box
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={padding}
      >
        <Spinner size="xl" color={accentColor} thickness="4px" />
      </Box>
    );
  }

  // Error state - only show when logged in and there's an error
  if (isLoggedIn && error) {
    return (
      <Box
        minH="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
        p={padding}
      >
        <Text color="red.500" fontSize="lg" fontWeight="medium">
          Error: {error.message}
        </Text>
      </Box>
    );
  }

  // Don't render timeline content if user is not logged in
  if (!isLoggedIn) {
    return (
      <Box minH="100vh" p={padding}>
        <VStack spacing={6} align="stretch" px={{ base: 0, md: 0 }}>
          <Heading
            as="h1"
            size={fontSize}
            textAlign="center"
            color={textColor}
            fontWeight="bold"
            letterSpacing="tight"
            mb={4}
          >
            {getFirstName()}'s Photo Timeline
          </Heading>
          <Text color={textColor} fontSize="lg" textAlign="center" mt={8}>
            Please log in to view your photo timeline and organize your travel memories.
          </Text>

          <Button
            size="lg"
            colorScheme="blue"
            onClick={conversionModal.onOpen}
            leftIcon={<FaGlobe />}
            mx="auto"
            px={8}
            py={6}
            fontSize="lg"
            fontWeight="bold"
            borderRadius="xl"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'xl'
            }}
            transition="all 0.3s ease"
          >
            Learn More About Timeline Features
          </Button>
        </VStack>

        {/* Authentication Modals - Must be rendered even when not logged in */}
        <ConversionModal
          isOpen={conversionModal.isOpen}
          onClose={conversionModal.onClose}
        />
      </Box>
    );
  }

  return (
    <Box minH="100vh" p={padding}>
      <VStack spacing={6} align="stretch" px={{ base: 0, md: 0 }}>
        {/* Professional Header Section */}
        <Box
          bg={cardBg}
          borderRadius="2xl"
          boxShadow="xl"
          p={{ base: 4, md: 8 }}
          borderWidth="1px"
          borderColor={headerBorderColor}
          position="relative"
          overflow="hidden"
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgGradient: 'linear(to-r, teal.400, blue.500)',
          }}
        >
          <VStack spacing={6} align="stretch">
            {/* Title Section */}
            <HStack spacing={3}>
              <Icon as={FaHistory} color={accentColor} boxSize={{ base: 6, md: 8 }} />
              <VStack align="start" spacing={0}>
                <Heading
                  as="h1"
                  fontSize={{ base: 'xl', md: '3xl' }}
                  color={textColor}
                  fontWeight="bold"
                  letterSpacing="tight"
                >
                  {selectedYear ? `Timeline ${selectedYear}` : `${getFirstName()}'s Photo Timeline`}
                </Heading>
                <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" fontWeight="medium">
                  Your journey through memories
                </Text>
              </VStack>
            </HStack>

            {/* Divider */}
            <Divider borderColor={headerDividerColor} />

            {/* Statistics */}
            {sortedYears.length > 0 && (
              <HStack
                spacing={{ base: 2, md: 6 }}
                justify="space-around"
                flexWrap="wrap"
                align="start"
              >
                {/* Total Photos */}
                <VStack spacing={1}>
                  <HStack spacing={2} color={accentColor}>
                    <Icon as={FaCamera} boxSize={{ base: 4, md: 5 }} />
                    <Text fontSize={{ base: 'xs', md: 'md' }} fontWeight="semibold">
                      Total Photos
                    </Text>
                  </HStack>
                  <Badge
                    fontSize={{ base: 'md', md: 'xl' }}
                    colorScheme="teal"
                    variant="subtle"
                    px={{ base: 3, md: 4 }}
                    py={1}
                    borderRadius="full"
                  >
                    {images.length}
                  </Badge>
                </VStack>

                {/* Years Covered */}
                <VStack spacing={1}>
                  <HStack spacing={2} color={accentColor}>
                    <Icon as={FaHistory} boxSize={{ base: 4, md: 5 }} />
                    <Text fontSize={{ base: 'xs', md: 'md' }} fontWeight="semibold">
                      Years
                    </Text>
                  </HStack>
                  <Badge
                    fontSize={{ base: 'md', md: 'xl' }}
                    colorScheme="blue"
                    variant="subtle"
                    px={{ base: 3, md: 4 }}
                    py={1}
                    borderRadius="full"
                  >
                    {sortedYears.length}
                  </Badge>
                </VStack>

                {/* Time Range */}
                {sortedYears.length > 0 && (
                  <VStack spacing={1}>
                    <HStack spacing={2} color={accentColor}>
                      <Icon as={FaGlobe} boxSize={{ base: 4, md: 5 }} />
                      <Text fontSize={{ base: 'xs', md: 'md' }} fontWeight="semibold">
                        Period
                      </Text>
                    </HStack>
                    <Badge
                      fontSize={{ base: 'md', md: 'xl' }}
                      colorScheme="purple"
                      variant="subtle"
                      px={{ base: 3, md: 4 }}
                      py={1}
                      borderRadius="full"
                    >
                      {selectedYear
                        ? selectedYear
                        : sortedYears.length > 1
                        ? `${sortedYears[sortedYears.length - 1]} - ${sortedYears[0]}`
                        : sortedYears[0]}
                    </Badge>
                  </VStack>
                )}
              </HStack>
            )}

            {/* Empty State */}
            {sortedYears.length === 0 && (
              <Text color="gray.500" fontSize="md" textAlign="center" py={4}>
                No photos found. Start capturing your journey!
              </Text>
            )}
          </VStack>
        </Box>

        {/* Cache Status */}
        <Box px={{ base: 2, sm: 3, md: 4 }}>
          <CacheStatus />
        </Box>

        {/* View Toggle - Above Photos */}
        {sortedYears.length > 0 && (
          <Box
            bg={cardBg}
            borderRadius="lg"
            boxShadow="sm"
            p={4}
            borderWidth="1px"
            borderColor={viewToggleBorderColor}
          >
            <HStack justify="space-between" align="center" spacing={4} flexWrap="wrap">
              <FormControl display="flex" alignItems="center" justifyContent="center" w="auto">
                <FormLabel htmlFor="view-toggle" mb="0" fontSize={{ base: 'sm', md: 'md' }} fontWeight="semibold" color={textColor}>
                  {viewByYear ? 'Viewing by Year' : 'Showing All Photos'}
                </FormLabel>
                <Switch
                  id="view-toggle"
                  size={{ base: 'md', md: 'lg' }}
                  colorScheme="teal"
                  isChecked={viewByYear}
                  onChange={() => setViewByYear(!viewByYear)}
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
                      bg={cardBg}
                      borderRadius="lg"
                      boxShadow="md"
                      p={4}
                      position="relative"
                      _before={{
                        content: '""',
                        position: 'absolute',
                        left: '20px',
                        top: '50px',
                        bottom: '20px',
                        width: '4px',
                        bg: accentColor,
                        borderRadius: 'full',
                        display: { base: 'none', md: 'block' },
                      }}
                    >
                      <HStack justify="space-between" align="center" cursor="pointer" onClick={() => toggleYear(year)}>
                        <Text
                          fontSize="xl"
                          fontWeight="semibold"
                          color={textColor}
                          _hover={{ color: 'blue.500' }}
                          transition="color 0.3s ease"
                        >
                          {year}
                        </Text>
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
                            color={textColor}
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              toggleYear(year);
                            }}
                          />
                        </HStack>
                      </HStack>
                      <Collapse in={!collapsedYears[year]} animateOpacity>
                        <Box mt={2}>
                          <Suspense fallback={<Spinner size="md" color={accentColor} />}>
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
            <Box
              bg={cardBg}
              borderRadius="lg"
              boxShadow="md"
              p={4}
            >
              <Suspense fallback={<Spinner size="xl" color={accentColor} />}>
                <LazyPhotoGallery images={sortedAllImages} />
              </Suspense>
            </Box>
          )
        ) : (
          <Text color={textColor} fontSize="lg" textAlign="center" mt={8}>
            No photos to display yet. Start capturing your journey!
          </Text>
        )}
      </VStack>

      {/* Authentication Modals */}
      <ConversionModal
        isOpen={conversionModal.isOpen}
        onClose={conversionModal.onClose}
      />

      {/* Video Generator Modal */}
      <TimelineVideoModal
        isOpen={videoModal.isOpen}
        onClose={videoModal.onClose}
      />
    </Box>
  );
};

export default Timeline;

