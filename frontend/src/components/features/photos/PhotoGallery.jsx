import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Image,
  useDisclosure,
  Flex,
  Text,
  VStack,
  SimpleGrid,
  HStack,
  useBreakpointValue,
  Icon,
  Tooltip,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { IoCheckmark, IoDownload } from 'react-icons/io5';
import { FaDownload } from 'react-icons/fa';
import { HiCheck, HiPhoto, HiSquares2X2 } from 'react-icons/hi2';
import ModalButton from '../../modals/ModalButton';
import { Chip, ModalState, ToneBadge } from '../../modals/ModalKit';
import { color as atlas, shadow, tones, type } from '../../../design/tokens';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { DeleteButton } from '../../ui/buttons/CustomButtons';
import FullImageModal from '../../modals/FullImageModal';
import { motion } from 'framer-motion';
import { useImageCache } from '../../../hooks/useImageCache';

// Registrar nomes de países
countries.registerLocale(en);

// Animações estilo Apple Photos
const imageVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.34, 1.56, 0.64, 1],
      staggerChildren: 0.05
    },
  },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
  },
};

// Animações para checkboxes
const checkboxVariants = {
  initial: { scale: 0.7, opacity: 0, rotate: -180 },
  animate: { scale: 1, opacity: 1, rotate: 0 },
  checked: { scale: 1.15, opacity: 1, rotate: 360 },
  hover: { scale: 1.1 },
};

// Blur placeholder animation
const blurVariants = {
  initial: { opacity: 1, blur: 8 },
  loaded: { opacity: 0, blur: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
};

const PhotoGallery = memo(function PhotoGallery({
  images,
  onDeleteSelectedImages,
  selectedImageIds = [],
  isSelectionMode = false,
  toggleSelectionMode,
  handleImageSelection,
  isImageSelected,       // (legacy) mantido para compat, mas a UI usa selectedSet abaixo
  onSelectAll,           // selecionar todos do conjunto mostrado
  onClearSelection,      // limpar seleção
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const fullscreenRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toast = useToast();

  // Drag-to-select state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState(null);
  const dragAreaRef = useRef(null);
  const [imageLoadStates, setImageLoadStates] = useState(new Map());

  // Image cache hook
  const { cacheImage } = useImageCache();

  const isMobile = useBreakpointValue({ base: true, sm: false });
  // Atlas: selection is amber; skeletons are ink.
  const selectionColor = atlas.primary;
  const checkboxBgColor = 'rgba(10,12,17,0.72)';
  const checkboxBorderColor = 'rgba(236,231,220,0.5)';
  const shimmerColor1 = atlas.surfaceSolid;
  const shimmerColor2 = atlas.surfaceRaised;

  // O(1) lookup — garante que Select All/Unselect All reflitam imediatamente nos checkboxes
  const selectedSet = useMemo(
    () => new Set((selectedImageIds || []).map((id) => String(id))),
    [selectedImageIds]
  );

  // Clique na imagem
  const handleImageClick = useCallback(
    (index) => {
      if (isSelectionMode) {
        const imageId = images[index].id;
        handleImageSelection?.(imageId);
      } else {
        setCurrentImageIndex(index);
        onOpen();
      }
    },
    [isSelectionMode, images, handleImageSelection, onOpen]
  );

  // Modal
  const closeModal = () => onClose();
  const showNextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const showPrevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  // Fullscreen
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Keyboard shortcuts (Ctrl/Cmd+A for select all, Escape for exit selection)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSelectionMode) return;

      // Select all with Ctrl/Cmd+A
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        onSelectAll?.(images);
      }

      // Escape to exit selection mode
      if (e.key === 'Escape') {
        toggleSelectionMode?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSelectionMode, images, onSelectAll, toggleSelectionMode]);

  // Handle image load state
  const handleImageLoad = useCallback((imageId) => {
    setImageLoadStates((prev) => new Map(prev).set(imageId, true));
  }, []);

  // Cache images when they're visible
  useEffect(() => {
    // Cache all visible images in background
    const cacheImages = async () => {
      for (const image of images) {
        if (image.url) {
          cacheImage(image.url);
        }
      }
    };

    if (images.length > 0) {
      cacheImages();
    }
  }, [images, cacheImage]);

  // Drag-to-select handlers
  const handleDragStart = useCallback((index) => {
    if (!isSelectionMode) return;
    setIsDragging(true);
    setDragStartIndex(index);
  }, [isSelectionMode]);

  const handleDragMove = useCallback((index) => {
    if (!isDragging || dragStartIndex === null) return;

    const start = Math.min(dragStartIndex, index);
    const end = Math.max(dragStartIndex, index);

    for (let i = start; i <= end; i++) {
      if (images[i]?.id) {
        const imageId = images[i].id;
        if (!selectedSet.has(String(imageId))) {
          handleImageSelection?.(imageId);
        }
      }
    }
  }, [isDragging, dragStartIndex, images, selectedSet, handleImageSelection]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    setDragStartIndex(null);
  }, []);

  // Empty state
  if (!Array.isArray(images) || images.length === 0) {
    return (
      <ModalState kind="empty" icon={HiPhoto} title="No photos yet" py={16}>
        Start capturing your journey by uploading your first photo to this country.
      </ModalState>
    );
  }

  const total = images.length;
  const selectedCount = selectedImageIds.length;

  return (
    <Box py={2}>
      {/* Global styles for shimmer animation */}
      <Box
        as="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `,
        }}
      />

      {/* Selection Controls - Only show if toggleSelectionMode is provided */}
      {toggleSelectionMode && (
      <Box mb={4}>
        <Flex justify="space-between" align="center" maxW="2600px" mx="auto" px={{ base: 3, md: 6 }}>
          <VStack alignItems={{ base: 'stretch', md: 'flex-start' }} spacing={{ base: 2, md: 3 }} flex={1}>
            <Chip
              isActive={isSelectionMode}
              onClick={() => toggleSelectionMode?.()}
              icon={isSelectionMode ? HiCheck : HiSquares2X2}
              alignSelf={{ base: 'stretch', md: 'flex-start' }}
            >
              {isSelectionMode ? 'Exit selection' : 'Select photos'}
            </Chip>

            {isSelectionMode && (
              <VStack spacing={{ base: 2, md: 3 }} align="stretch" w="full">
                <HStack spacing={2} wrap="wrap">
                  <Tooltip label="Select all photos currently visible" hasArrow>
                    <ModalButton variant="ghost" size="sm" onClick={() => onSelectAll?.(images)} color={atlas.primary}>
                      Select all ({total})
                    </ModalButton>
                  </Tooltip>

                  <Tooltip label="Clear current selection" hasArrow>
                    <ModalButton variant="ghost" size="sm" onClick={() => onClearSelection?.()}>
                      Unselect all
                    </ModalButton>
                  </Tooltip>
                </HStack>

                <HStack spacing={2} flexWrap="wrap">
                  <ToneBadge tone="brand" alignSelf="center">
                    {selectedCount} selected
                  </ToneBadge>

                  {/* Download Selected Button */}
                  <ModalButton
                    onClick={async () => {
                      try {
                        // Get selected images
                        const selectedImages = images.filter(img => selectedSet.has(String(img.id)));

                        if (selectedImages.length === 0) {
                          toast({
                            title: 'No images selected',
                            description: 'Please select images to download',
                            status: 'warning',
                            duration: 2000,
                            isClosable: true,
                          });
                          return;
                        }

                        // Check if mobile and Web Share API is supported
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        toast({
                          title: 'Downloading...',
                          description: `Preparing ${selectedImages.length} image(s)`,
                          status: 'info',
                          duration: 2000,
                          isClosable: true,
                        });

                        // Download each image
                        for (let i = 0; i < selectedImages.length; i++) {
                          const image = selectedImages[i];

                          try {
                            const response = await fetch(image.url);
                            const blob = await response.blob();

                            // Use Web Share API for mobile devices (iOS and Android)
                            if (isMobile && navigator.share && navigator.canShare && i === 0) {
                              try {
                                const file = new File([blob], `image-${image.id}.jpg`, { type: blob.type });

                                if (navigator.canShare({ files: [file] })) {
                                  // For multiple images, only share first one via Web Share API
                                  // Others will use standard download
                                  if (selectedImages.length === 1) {
                                    await navigator.share({
                                      files: [file],
                                      title: 'Photo',
                                    });
                                    continue;
                                  }
                                }
                              } catch (shareError) {
                                if (shareError.name === 'AbortError') {
                                  // User cancelled, skip this download
                                  continue;
                                }
                                // Continue to standard download if share fails
                              }
                            }

                            // Standard download for desktop or subsequent images
                            const url = window.URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `image-${image.id}.jpg`;
                            document.body.appendChild(link);
                            link.click();

                            // Clean up
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(url);

                            // Add small delay between downloads to avoid overwhelming the browser
                            if (i < selectedImages.length - 1) {
                              await new Promise(resolve => setTimeout(resolve, 100));
                            }
                          } catch (err) {
                            console.error(`Failed to download image ${image.id}:`, err);
                          }
                        }

                        toast({
                          title: 'Download complete',
                          description: `Successfully downloaded ${selectedImages.length} image(s)`,
                          status: 'success',
                          duration: 3000,
                          isClosable: true,
                        });
                      } catch (error) {
                        console.error('Download error:', error);
                        toast({
                          title: 'Download failed',
                          description: 'Could not download the images',
                          status: 'error',
                          duration: 3000,
                          isClosable: true,
                        });
                      }
                    }}
                    isDisabled={selectedCount === 0}
                    variant="secondary"
                    size="sm"
                    leftIcon={<FaDownload />}
                  >
                    Download selected
                  </ModalButton>

                  <DeleteButton
                    onClick={() => onDeleteSelectedImages?.(selectedImageIds)}
                    isDisabled={selectedCount === 0}
                    size="sm"
                    h="36px"
                  >
                    Delete selected
                  </DeleteButton>
                </HStack>
              </VStack>
            )}
          </VStack>
        </Flex>
      </Box>
      )}

      {/* Grid */}
      <Box maxW="2600px" mx="auto" px={{ base: 1, sm: 4, md: 6, lg: 8 }}>
        <SimpleGrid
          columns={{ base: 3, sm: 3, md: 4, lg: 5, xl: 6, '2xl': 8 }}
          spacing={{ base: 2, sm: 3, md: 3, lg: 4, xl: 5 }}
          sx={{
            columnGap: { base: '2px', sm: '8px', md: '12px', lg: '16px', xl: '20px' },
            rowGap: { base: '2px', sm: '8px', md: '12px', lg: '16px', xl: '20px' },
          }}
        >
          {images.map((image, index) => {
            // >>> O(1) e consistente entre "manual" e "Select All"
            const isSelected = selectedSet.has(String(image.id));

            const countryName =
              countries.getName(image.countryId?.toUpperCase?.(), 'en') ||
              image.countryId?.toUpperCase?.() ||
              'Unknown';

            return (
              <motion.div
                key={image.id}
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                whileHover="hover"
                layout
                style={{ breakInside: 'avoid', transformOrigin: 'center center' }}
                transition={{
                  layout: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                  scale: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
                }}
              >
                <Box
                  position="relative"
                  borderRadius={{ base: '6px', sm: '8px', md: '12px' }}
                  overflow="hidden"
                  bg={atlas.surfaceSolid}
                  boxShadow={
                    isSelected
                      ? `0 0 0 2px ${selectionColor}, 0 10px 30px -10px ${tones.brand.glow}`
                      : `inset 0 0 0 1px ${atlas.hairline}, ${shadow.sm}`
                  }
                  cursor="pointer"
                  _hover={{
                    boxShadow: isSelected
                      ? `0 0 0 2px ${selectionColor}, 0 14px 36px -10px ${tones.brand.glow}`
                      : `inset 0 0 0 1px ${atlas.hairlineMid}, ${shadow.md}`,
                  }}
                  transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
                  role="group"
                  aria-label={`Image from ${countryName}`}
                  onClick={() => handleImageClick(index)}
                  onMouseDown={(e) => isSelectionMode && !isDragging && handleDragStart(index)}
                  onMouseEnter={(e) => isSelectionMode && handleDragMove(index)}
                  onMouseUp={() => handleDragEnd()}
                  onMouseLeave={() => handleDragEnd()}
                >
                  {/* Drag selection overlay */}
                  {isSelectionMode && isDragging && dragStartIndex !== null && (
                    <Box
                      position="absolute"
                      inset="0"
                      bg={tones.brand.soft}
                      zIndex={1}
                      pointerEvents="none"
                      border={`3px solid ${selectionColor}`}
                      borderRadius={isMobile ? '8px' : '12px'}
                      animation="pulse 1s ease-in-out infinite"
                    />
                  )}

                  {/* Overlay sutil quando selecionado */}
                  {isSelectionMode && !isDragging && (
                    <Box
                      position="absolute"
                      inset="0"
                      bg={isSelected ? tones.brand.softer : 'transparent'}
                      zIndex={1}
                      pointerEvents="none"
                      transition="all 0.3s ease"
                    />
                  )}

                  {/* Checkbox melhorado no canto superior direito */}
                  {isSelectionMode && (
                    <motion.div
                      variants={checkboxVariants}
                      initial="initial"
                      animate={isSelected ? "checked" : "animate"}
                      whileHover="hover"
                      style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                        zIndex: 3,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Box
                        position="relative"
                        w={isMobile ? '20px' : '24px'}
                        h={isMobile ? '20px' : '24px'}
                        borderRadius="full"
                        bg={isSelected ? selectionColor : checkboxBgColor}
                        border="2px solid"
                        borderColor={isSelected ? selectionColor : checkboxBorderColor}
                        boxShadow="0 4px 16px rgba(0,0,0,0.15)"
                        cursor="pointer"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        transition="all 0.2s ease"
                        _hover={{
                          transform: 'scale(1.1)',
                          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                          borderColor: selectionColor,
                        }}
                        onClick={() => handleImageSelection?.(image.id)}
                      >
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            <Icon
                              as={IoCheckmark}
                              boxSize={isMobile ? 3 : 3.5}
                              color={atlas.textOnBrand}
                            />
                          </motion.div>
                        )}
                      </Box>
                    </motion.div>
                  )}

                  {/* Imagem com blur-up loading */}
                  <Box position="relative" overflow="hidden" borderRadius={isMobile ? '8px' : '12px'}>
                    {/* Blur placeholder */}
                    {!imageLoadStates.get(image.id) && (
                      <motion.div
                        variants={blurVariants}
                        initial="initial"
                        animate={imageLoadStates.get(image.id) ? "loaded" : "initial"}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: `linear-gradient(110deg, ${shimmerColor1} 0%, ${shimmerColor2} 50%, ${shimmerColor1} 100%)`,
                          backgroundSize: '200% 200%',
                          animation: 'shimmer 1.5s ease-in-out infinite',
                        }}
                      >
                        <Box
                          position="absolute"
                          inset={0}
                          filter="blur(20px)"
                          style={{
                            backgroundImage: `url(${image.url})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.3,
                          }}
                        />
                      </motion.div>
                    )}

                    <Image
                      src={image.url}
                      alt={`Photo from ${countryName}`}
                      width="100%"
                      height="auto"
                      objectFit="cover"
                      loading="lazy"
                      onLoad={() => {
                        handleImageLoad(image.id);
                      }}
                      onError={(e) => console.error('❌ Image failed to load:', image.url, e)}
                      sx={{
                        aspectRatio: '1/1',
                        minHeight: isMobile ? '120px' : '200px',
                        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        filter: isSelected ? 'brightness(0.98) contrast(1.02) saturate(1.05)' : 'none',
                        opacity: imageLoadStates.get(image.id) ? 1 : 0,
                      }}
                      _groupHover={{ transform: isSelectionMode ? 'scale(1.01)' : 'scale(1.05)' }}
                    />
                  </Box>

                  {/* Rodapé país/ano */}
                  <Box
                    position="absolute"
                    bottom="0"
                    left="0"
                    right="0"
                    bg="linear-gradient(transparent, rgba(5,7,11,0.85))"
                    p={isMobile ? 2 : 3}
                    color="white"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.3s ease"
                  >
                    <VStack spacing={isMobile ? 0.5 : 1} align="start">
                      <Text fontSize={isMobile ? 'xs' : 'sm'} fontWeight="600" color={atlas.text} lineHeight="1.2" noOfLines={1}>
                        {countryName}
                      </Text>
                      {image.year && (
                        <Text {...type.label} color={atlas.primary} noOfLines={1}>
                          {image.year}
                        </Text>
                      )}
                    </VStack>
                  </Box>

                  {/* Download Button */}
                  {!isSelectionMode && (
                    <IconButton
                      aria-label="Download image"
                      icon={<IoDownload />}
                      position="absolute"
                      top="8px"
                      right="8px"
                      size="sm"
                      borderRadius="full"
                      bg="rgba(10,12,17,0.6)"
                      color={atlas.text}
                      border="1px solid"
                      borderColor="rgba(236,231,220,0.14)"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      _hover={{ bg: 'rgba(10,12,17,0.85)', color: atlas.primary }}
                      _focusVisible={{ opacity: 1, boxShadow: `0 0 0 3px ${atlas.focusRing}` }}
                      transition="all 0.2s ease"
                      backdropFilter="blur(8px)"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          // Fetch the image as a blob
                          const response = await fetch(image.url);
                          const blob = await response.blob();

                          // Check if Web Share API with files is supported (iOS Safari and Android)
                          const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                          if (isMobile && navigator.share && navigator.canShare) {
                            try {
                              const file = new File([blob], `image-${image.id}.jpg`, { type: blob.type });

                              if (navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                  files: [file],
                                  title: 'Photo',
                                });

                                toast({
                                  title: 'Share opened',
                                  description: 'Use "Save Image" to save to your device',
                                  status: 'success',
                                  duration: 3000,
                                  isClosable: true,
                                });
                                return;
                              }
                            } catch (shareError) {
                              // If Web Share fails, fall through to standard download
                              if (shareError.name === 'AbortError') {
                                toast({
                                  title: 'Share cancelled',
                                  status: 'info',
                                  duration: 2000,
                                  isClosable: true,
                                });
                                return;
                              }
                              // Continue to standard download if share fails
                            }
                          }

                          // Standard download for desktop or when Web Share is not available
                          const url = window.URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `image-${image.id}.jpg`;
                          document.body.appendChild(link);
                          link.click();

                          // Clean up
                          document.body.removeChild(link);
                          window.URL.revokeObjectURL(url);

                          toast({
                            title: 'Download started',
                            status: 'success',
                            duration: 2000,
                            isClosable: true,
                          });
                        } catch (error) {
                          console.error('Download error:', error);
                          toast({
                            title: 'Download failed',
                            description: error.name === 'AbortError' ? 'Share cancelled' : 'Could not download the image',
                            status: 'error',
                            duration: 3000,
                            isClosable: true,
                          });
                        }
                      }}
                      zIndex={4}
                    />
                  )}
                </Box>
              </motion.div>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* Modal de imagem cheia */}
      {images[currentImageIndex] && (
        <FullImageModal
          isOpen={isOpen}
          onClose={closeModal}
          imageUrl={images[currentImageIndex].url}
          onNext={showNextImage}
          onPrev={showPrevImage}
          hasMultiple={images.length > 1}
          fullscreenRef={fullscreenRef}
          toggleFullScreen={toggleFullScreen}
          isFullscreen={isFullscreen}
          countryName={
            countries.getName(images[currentImageIndex].countryId?.toUpperCase?.(), 'en') || 'Unknown'
          }
          currentIndex={currentImageIndex}
          totalCount={images.length}
        />
      )}
    </Box>
  );
});

PhotoGallery.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      countryId: PropTypes.string,
    })
  ).isRequired,
  onDeleteSelectedImages: PropTypes.func,
  selectedImageIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  isSelectionMode: PropTypes.bool,
  toggleSelectionMode: PropTypes.func,
  handleImageSelection: PropTypes.func,
  isImageSelected: PropTypes.func,
  onSelectAll: PropTypes.func,
  onClearSelection: PropTypes.func,
};

export default PhotoGallery;
