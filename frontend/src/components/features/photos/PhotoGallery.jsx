import React, { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Image,
  useDisclosure,
  Flex,
  Text,
  Button,
  VStack,
  useColorModeValue,
  useColorMode,
  SimpleGrid,
  HStack,
  useBreakpointValue,
  Icon,
  Tooltip,
  Badge,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { IoCheckmark, IoDownload } from 'react-icons/io5';
import { FaDownload } from 'react-icons/fa';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { DeleteButton } from '../../ui/buttons/CustomButtons';
import FullImageModal from '../../modals/FullImageModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageCache } from '../../../hooks/useImageCache';
import darkThemeImage from '../../../assets/darkTheme.jpg';
import lightThemeImage from '../../../assets/lightTheme.jpg';

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

  const { colorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, sm: false });
  const isLargeScreen = useBreakpointValue({ base: false, lg: false, xl: true, '2xl': true });
  const bgColor = useColorModeValue('white.50', 'black.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const selectionColor = useColorModeValue('blue.500', 'blue.300');
  const selectionBgColor = useColorModeValue('blue.50', 'blue.900');
  const checkboxBgColor = useColorModeValue('white', 'gray.800');
  const checkboxBorderColor = useColorModeValue('gray.300', 'gray.600');
  const shimmerColor1 = useColorModeValue('#e2e8f0', '#1a202c');
  const shimmerColor2 = useColorModeValue('#cbd5e0', '#2d3748');
  const buttonBorderColor = useColorModeValue('blue.600', 'white');
  const buttonTextColor = useColorModeValue('blue.600', 'white');

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
      <VStack spacing={8} py={20} textAlign="center">
        <Box
          w="140px"
          h="140px"
          borderRadius="full"
          bg="gray.100"
          display="flex"
          alignItems="center"
          justifyContent="center"
          mb={6}
          boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
          _hover={{ transform: 'scale(1.05)', boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)' }}
        >
          <Text fontSize="5xl" color="gray.400">📸</Text>
        </Box>
        <VStack spacing={3}>
          <Text fontSize="2xl" color={textColor} fontWeight="semibold">No Photos Yet</Text>
          <Text fontSize="md" color="gray.500" maxW="450px" lineHeight="1.6">
            Start capturing your journey by uploading your first photo to this country
          </Text>
        </VStack>
        <Button
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          px={10}
          py={7}
          onClick={() => (window.location.href = '/upload')}
          _hover={{ transform: 'translateY(-2px)', boxShadow: '0 8px 25px rgba(59, 130, 246, 0.4)' }}
          _active={{ transform: 'translateY(0)' }}
          transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
        >
          Upload Photos
        </Button>
      </VStack>
    );
  }

  const total = images.length;
  const selectedCount = selectedImageIds.length;

  // Overlay background for better text readability
  const overlayBg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(0, 0, 0, 0.6)');
  const backgroundImage = colorMode === 'dark' ? `url(${darkThemeImage})` : `url(${lightThemeImage})`;

  return (
    <Box
      bg="transparent"
      bgImage={backgroundImage}
      bgSize="cover"
      bgPosition="center"
      bgRepeat="no-repeat"
      position="relative"
      py={2}
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: overlayBg,
        zIndex: 0,
      }}
    >
      <Box position="relative" zIndex={1}>
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
            <Button
              size={{ base: 'xs', md: 'sm' }}
              colorScheme="blue"
              variant={isSelectionMode ? 'solid' : 'outline'}
              onClick={() => {
                if (toggleSelectionMode) toggleSelectionMode();
              }}
              leftIcon={isSelectionMode ? <CheckIcon /> : undefined}
              borderRadius="full"
              px={{ base: 4, md: 6 }}
              borderWidth="1px"
              borderColor={isSelectionMode ? undefined : buttonBorderColor}
              color={isSelectionMode ? undefined : buttonTextColor}
              fontSize={{ base: 'xs', md: 'sm' }}
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: isSelectionMode 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)',
                borderColor: isSelectionMode ? undefined : buttonBorderColor
              }}
              transition="all 0.2s ease"
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Photos'}
            </Button>

            {isSelectionMode && (
              <VStack spacing={{ base: 2, md: 3 }} align="stretch" w="full">
                <HStack spacing={2} wrap="wrap">
                  <Tooltip label="Select all photos currently visible" hasArrow>
                    <Button
                      size={{ base: 'xs', md: 'sm' }}
                      variant="ghost"
                      onClick={() => onSelectAll?.(images)}
                      borderRadius="full"
                      colorScheme="blue"
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={{ base: 3, md: 4 }}
                      _hover={{
                        bg: 'blue.50',
                        transform: 'translateY(-1px)',
                      }}
                      transition="all 0.2s ease"
                    >
                      Select All ({total})
                    </Button>
                  </Tooltip>

                  <Tooltip label="Clear current selection" hasArrow>
                    <Button
                      size={{ base: 'xs', md: 'sm' }}
                      variant="ghost"
                      onClick={() => onClearSelection?.()}
                      borderRadius="full"
                      colorScheme="gray"
                      fontSize={{ base: 'xs', md: 'sm' }}
                      px={{ base: 3, md: 4 }}
                      _hover={{
                        bg: 'gray.50',
                        transform: 'translateY(-1px)',
                      }}
                      transition="all 0.2s ease"
                    >
                      Unselect All
                    </Button>
                  </Tooltip>
                </HStack>

                <HStack spacing={2} flexWrap="wrap">
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    fontSize={{ base: 'xs', md: 'sm' }}
                    px={{ base: 2, md: 3 }}
                    py={1}
                    borderRadius="full"
                    bg={selectionBgColor}
                    color={selectionColor}
                    fontWeight="semibold"
                  >
                    {selectedCount} selected
                  </Badge>
                  
                  {/* Download Selected Button */}
                  <Button
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
                    size={{ base: 'xs', md: 'sm' }}
                    colorScheme="blue"
                    variant="outline"
                    borderRadius="full"
                    px={{ base: 3, md: 4 }}
                    leftIcon={<FaDownload />}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    borderColor={buttonBorderColor}
                    color={buttonTextColor}
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                      borderColor: 'blue.500',
                      bg: 'blue.50',
                    }}
                    transition="all 0.2s ease"
                  >
                    Download Selected
                  </Button>

                  <DeleteButton
                    onClick={() => onDeleteSelectedImages?.(selectedImageIds)}
                    isDisabled={selectedCount === 0}
                    size={{ base: 'xs', md: 'sm' }}
                    colorScheme="red"
                    variant="outline"
                    borderRadius="full"
                    px={{ base: 3, md: 4 }}
                    leftIcon={<CloseIcon />}
                    fontSize={{ base: 'xs', md: 'sm' }}
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}
                    transition="all 0.2s ease"
                  >
                    Delete Selected
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
                  bg="white"
                  boxShadow={
                    isSelected
                      ? `0 0 0 3px ${selectionColor}, 0 8px 32px rgba(59,130,246,0.25)`
                      : '0 2px 8px rgba(0,0,0,0.08)'
                  }
                  cursor="pointer"
                  _hover={{
                    boxShadow: isSelected
                      ? `0 0 0 3px ${selectionColor}, 0 12px 40px rgba(59,130,246,0.35)`
                      : '0 8px 25px rgba(0,0,0,0.15)',
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
                      bg="rgba(59,130,246,0.15)"
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
                      bg={isSelected ? 'rgba(59,130,246,0.08)' : 'transparent'}
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
                        bg={checkboxBgColor}
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
                          borderColor: isSelected ? selectionColor : 'blue.400',
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
                              color={selectionColor}
                              filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
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
                      fallbackSrc="https://via.placeholder.com/300x300?text=Photo"
                      onLoad={() => {
                        handleImageLoad(image.id);
                        console.log('✅ Image loaded successfully:', image.url);
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
                    bg="linear-gradient(transparent, rgba(0,0,0,0.8))"
                    p={isMobile ? 2 : 3}
                    color="white"
                    opacity={0}
                    _groupHover={{ opacity: 1 }}
                    transition="opacity 0.3s ease"
                  >
                    <VStack spacing={isMobile ? 0.5 : 1} align="start">
                      <Text fontSize={isMobile ? 'xs' : 'sm'} fontWeight="semibold" lineHeight="1.2" noOfLines={1}>
                        {countryName}
                      </Text>
                      {image.year && (
                        <Text fontSize={isMobile ? '2xs' : 'xs'} opacity={0.9} noOfLines={1}>
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
                      bg="rgba(0,0,0,0.6)"
                      color="white"
                      opacity={0}
                      _groupHover={{ opacity: 1 }}
                      _hover={{ bg: 'rgba(0,0,0,0.8)', transform: 'scale(1.1)' }}
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
