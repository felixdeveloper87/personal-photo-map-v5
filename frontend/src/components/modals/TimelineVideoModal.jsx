import { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { Box, Collapse, HStack, Icon, IconButton, Image, SimpleGrid, Text, Tooltip, VStack, useToast } from '@chakra-ui/react';
import {
  HiArrowPath,
  HiArrowUturnLeft,
  HiCalendarDays,
  HiChevronDown,
  HiExclamationTriangle,
  HiFilm,
  HiLockClosed,
  HiPhoto,
  HiShieldCheck,
  HiXMark,
} from 'react-icons/hi2';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { buildApiUrl, buildImageUrl } from '../../utils/apiConfig';
import TimelineVideoGenerator from '../features/videos/components/TimelineVideoGeneratorRefactored';
import BaseModal from './BaseModal';
import ModalButton from './ModalButton';
import { CheckItem, Chip, ModalActions, ModalNotice, ModalSection, ModalStat, ModalState, Panel } from './ModalKit';
import { color, radius, tones, type } from '../../design/tokens';

// Fetch photos for video generation with retry logic
const fetchAllPictures = async (retryCount = 0) => {
  const maxRetries = 3;
  const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff

  try {
    const response = await fetch(buildApiUrl('/api/images/allPictures'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      if (response.status >= 500 && retryCount < maxRetries) {
        console.warn(`Server error, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        return fetchAllPictures(retryCount + 1);
      }
      throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn('Invalid data format received from API');
      return [];
    }

    return data.map((image, index) => {
      // Extract the year from filePath when `year` is missing
      const fallbackYear =
        !image.year && image.filePath
          ? (() => {
              const yearMatch = image.filePath.match(/\/(\d{4})\//);
              return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
            })()
          : image.year;

      return {
        url: buildImageUrl(image.filePath || ''),
        id: image.id || index,
        year: fallbackYear || new Date().getFullYear(),
        countryId: image.countryId || null,
        fileName: image.fileName || `image_${index + 1}`,
        _original: image,
      };
    });
  } catch (error) {
    if (retryCount < maxRetries && error.message.includes('fetch')) {
      console.warn(`Network error, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
      return fetchAllPictures(retryCount + 1);
    }
    console.error('Failed to fetch photos after all retries:', error);
    throw error;
  }
};

const FEATURES = [
  'Automatic transitions and effects',
  'Chronological organization by year',
  'Multiple resolutions (HD, Stories, Reels)',
  'Background music support',
  'iPhone compatible MP4 export',
];

const TimelineVideoModal = ({ isOpen, onClose }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const toast = useToast();
  const [showGenerator, setShowGenerator] = useState(false);
  const [excludedImageIds, setExcludedImageIds] = useState(new Set());
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());

  const { data: images = [], isLoading, error, refetch } = useQuery({
    queryKey: ['allPicturesForVideo', isOpen],
    queryFn: () => fetchAllPictures(),
    enabled: isLoggedIn && isOpen,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const filteredImages = useMemo(() => images.filter((img) => !excludedImageIds.has(img.id)), [images, excludedImageIds]);

  const imagesByYear = useMemo(
    () =>
      filteredImages.reduce((acc, img) => {
        if (!acc[img.year]) acc[img.year] = [];
        acc[img.year].push(img);
        return acc;
      }, {}),
    [filteredImages]
  );

  const years = useMemo(() => Object.keys(imagesByYear).sort((a, b) => Number(a) - Number(b)), [imagesByYear]);

  const totalPhotos = filteredImages.length;
  const excludedCount = excludedImageIds.size;
  const estimatedDuration = Math.round((totalPhotos * 1.5) / 60);

  const removeImage = useCallback(
    (imageId) => {
      setExcludedImageIds((prev) => new Set([...prev, imageId]));
      toast({ title: 'Photo excluded', description: 'This photo will not be included in the video', status: 'info', duration: 2000, isClosable: true });
    },
    [toast]
  );

  const restoreImage = useCallback(
    (imageId) => {
      setExcludedImageIds((prev) => {
        const next = new Set(prev);
        next.delete(imageId);
        return next;
      });
      toast({ title: 'Photo restored', description: 'This photo will be included in the video', status: 'success', duration: 2000, isClosable: true });
    },
    [toast]
  );

  const restoreAllImages = useCallback(() => {
    const count = excludedImageIds.size;
    setExcludedImageIds(new Set());
    if (count > 0) {
      toast({ title: 'All photos restored', description: `${count} photos will be included in the video`, status: 'success', duration: 3000, isClosable: true });
    }
  }, [excludedImageIds.size, toast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({ title: 'Photos refreshed', description: 'Your photo collection has been updated', status: 'success', duration: 2000, isClosable: true });
    } catch {
      toast({ title: 'Refresh failed', description: 'Could not refresh photos. Please try again.', status: 'error', duration: 3000, isClosable: true });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  const handleImageError = useCallback((imageId) => {
    setImageLoadErrors((prev) => new Set([...prev, imageId]));
  }, []);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowGenerator(false);
      setExcludedImageIds(new Set());
      setIsPhotoPreviewOpen(false);
      setImageLoadErrors(new Set());
      setIsRefreshing(false);
    }
  }, [isOpen]);

  const shell = {
    isOpen,
    onClose,
    eyebrow: 'Timeline',
    title: 'Timeline video',
    icon: HiFilm,
    closeOnOverlayClick: false,
  };

  if (!isLoggedIn) {
    return (
      <BaseModal {...shell} size="md">
        <ModalNotice tone="warning" icon={HiLockClosed} title="Sign in required">
          You need to be logged in to generate timeline videos.
        </ModalNotice>
      </BaseModal>
    );
  }

  const canGenerate = !showGenerator && !isLoading && !error && totalPhotos > 0;

  const renderBody = () => {
    if (isLoading) return <ModalState kind="loading" title="Loading your photos…" />;

    if (error) {
      return (
        <ModalState
          kind="error"
          title="Couldn't load your photos"
          action={
            <ModalButton variant="secondary" leftIcon={<HiArrowPath />} onClick={handleRefresh} isLoading={isRefreshing}>
              Try again
            </ModalButton>
          }
        >
          {error.message}
        </ModalState>
      );
    }

    if (totalPhotos === 0 && excludedCount === 0) {
      return (
        <ModalState kind="empty" icon={HiPhoto} title="No photos yet">
          Upload some photos first to generate a timeline video.
        </ModalState>
      );
    }

    if (showGenerator) {
      return <TimelineVideoGenerator images={filteredImages} onClose={() => setShowGenerator(false)} />;
    }

    return (
      <VStack spacing={6} align="stretch">
        <ModalSection title="Timeline summary">
          <SimpleGrid columns={3} spacing={3}>
            <ModalStat icon={HiPhoto} value={totalPhotos} label="Photos" tone="brand" />
            <ModalStat icon={HiCalendarDays} value={years.length} label="Years" tone="teal" />
            <ModalStat icon={HiFilm} value={`${estimatedDuration} min`} label="Duration" tone="rose" />
          </SimpleGrid>
        </ModalSection>

        <ModalSection title="Years included">
          <HStack wrap="wrap" spacing={2}>
            {years.map((year) => (
              <Chip key={year} as="span" cursor="default" _hover={{}}>
                {year}
                <Text as="span" color={color.textMuted} fontWeight="500">
                  · {imagesByYear[year].length}
                </Text>
              </Chip>
            ))}
          </HStack>
        </ModalSection>

        {/* Photo preview (collapsible) */}
        <Panel p={0}>
          <HStack justify="space-between" px={4} py={3}>
            <HStack
              as="button"
              type="button"
              spacing={2.5}
              onClick={() => setIsPhotoPreviewOpen((v) => !v)}
              aria-expanded={isPhotoPreviewOpen}
              color={color.text}
              flex={1}
              minW={0}
            >
              <Icon as={HiChevronDown} transform={isPhotoPreviewOpen ? 'rotate(180deg)' : 'none'} transition="transform .2s ease" color={color.textMuted} />
              <Text fontSize="sm" fontWeight="600" noOfLines={1}>
                Choose photos
              </Text>
              <Text fontSize="xs" color={color.textMuted} noOfLines={1}>
                {totalPhotos} included{excludedCount > 0 ? ` · ${excludedCount} removed` : ''}
              </Text>
              {imageLoadErrors.size > 0 && (
                <Tooltip label={`${imageLoadErrors.size} photos failed to load`}>
                  <Box color={tones.danger.fg} display="inline-flex">
                    <HiExclamationTriangle />
                  </Box>
                </Tooltip>
              )}
            </HStack>
            <HStack spacing={1}>
              {excludedCount > 0 && (
                <ModalButton variant="ghost" size="sm" leftIcon={<HiArrowUturnLeft />} onClick={restoreAllImages} color={color.primary}>
                  Restore {excludedCount}
                </ModalButton>
              )}
              <Tooltip label="Refresh photos">
                <IconButton
                  size="sm"
                  icon={<HiArrowPath />}
                  variant="ghost"
                  color={color.textSoft}
                  _hover={{ bg: color.surfaceHover, color: color.text }}
                  onClick={handleRefresh}
                  isLoading={isRefreshing}
                  aria-label="Refresh photos"
                />
              </Tooltip>
            </HStack>
          </HStack>

          <Collapse in={isPhotoPreviewOpen} animateOpacity>
            <Box px={4} pb={4}>
              <Text fontSize="xs" color={color.textMuted} mb={3}>
                Tap a photo to leave it out of the video. Tap again to bring it back.
              </Text>
              <SimpleGrid columns={{ base: 4, sm: 6, md: 8, lg: 10 }} spacing={2}>
                {images.map((img, index) => {
                  const isExcluded = excludedImageIds.has(img.id);
                  const hasError = imageLoadErrors.has(img.id);
                  return (
                    <Box
                      key={img.id}
                      as="button"
                      type="button"
                      onClick={() => (isExcluded ? restoreImage(img.id) : removeImage(img.id))}
                      aria-label={isExcluded ? `Restore photo ${index + 1}` : `Exclude photo ${index + 1}`}
                      aria-pressed={!isExcluded}
                      position="relative"
                      borderRadius={radius.md}
                      overflow="hidden"
                      border="1px solid"
                      borderColor={isExcluded ? tones.danger.border : color.hairline}
                      bg={color.surfaceSubtle}
                      sx={{ aspectRatio: '1 / 1' }}
                      transition="all .15s ease"
                      _hover={{ borderColor: isExcluded ? tones.danger.fg : color.primarySoftBorder }}
                      _focusVisible={{ outline: 'none', boxShadow: `0 0 0 3px ${color.focusRing}` }}
                    >
                      {hasError ? (
                        <VStack h="full" justify="center" spacing={0.5} color={tones.danger.fg}>
                          <HiExclamationTriangle />
                          <Text {...type.label} fontSize="8px">
                            Error
                          </Text>
                        </VStack>
                      ) : (
                        <Image
                          src={img.url}
                          alt=""
                          w="full"
                          h="full"
                          objectFit="cover"
                          filter={isExcluded ? 'grayscale(100%)' : 'none'}
                          opacity={isExcluded ? 0.35 : 1}
                          onError={() => handleImageError(img.id)}
                          loading="lazy"
                        />
                      )}
                      <Box
                        position="absolute"
                        top={1}
                        right={1}
                        w="18px"
                        h="18px"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        bg={isExcluded ? color.primary : 'rgba(5,7,11,0.72)'}
                        color={isExcluded ? color.textOnBrand : color.text}
                      >
                        <Icon as={isExcluded ? HiArrowUturnLeft : HiXMark} boxSize={2.5} />
                      </Box>
                    </Box>
                  );
                })}
              </SimpleGrid>
            </Box>
          </Collapse>
        </Panel>

        <ModalNotice tone="success" icon={HiShieldCheck} title="100% private & secure">
          Video generation happens entirely in your browser. No photos are uploaded to external servers.
        </ModalNotice>

        <ModalSection title="Features">
          <VStack spacing={2} align="stretch">
            {FEATURES.map((f) => (
              <CheckItem key={f}>{f}</CheckItem>
            ))}
          </VStack>
          <Text fontSize="xs" color={color.textMuted} mt={4} lineHeight="1.5">
            <strong>iPhone:</strong> videos download to the Files app. To save to Photos: open the video → Share → “Save to Photos”.
          </Text>
        </ModalSection>
      </VStack>
    );
  };

  return (
    <BaseModal
      {...shell}
      size={{ base: 'full', sm: '2xl', md: '4xl', xl: '6xl' }}
      maxHeight="90vh"
      footer={
        canGenerate ? (
          <ModalActions>
            <ModalButton variant="secondary" onClick={onClose}>
              Cancel
            </ModalButton>
            <ModalButton variant="primary" size="lg" leftIcon={<HiFilm />} onClick={() => setShowGenerator(true)}>
              Start generating video
            </ModalButton>
          </ModalActions>
        ) : null
      }
    >
      {renderBody()}
    </BaseModal>
  );
};

export default TimelineVideoModal;
