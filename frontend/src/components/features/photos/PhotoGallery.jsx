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
  SimpleGrid,
  HStack,
  Checkbox,
  useBreakpointValue,
  Icon,
  Tooltip,
  Kbd,
  Badge,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { IoCheckmark, IoCheckmarkCircle } from 'react-icons/io5';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';
import { DeleteButton } from '../../ui/buttons/CustomButtons';
import FullImageModal from '../../modals/FullImageModal';
import { motion } from 'framer-motion';

// Registrar nomes de países
countries.registerLocale(en);

// Animações estilo Apple Photos
const imageVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.2 },
  },
};

// Animações para checkboxes
const checkboxVariants = {
  initial: { scale: 0.8, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  checked: { scale: 1.1, opacity: 1 },
  hover: { scale: 1.05 },
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

  const isMobile = useBreakpointValue({ base: true, sm: false });
  const isLargeScreen = useBreakpointValue({ base: false, lg: false, xl: true, '2xl': true });
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.800', 'white');
  const selectionColor = useColorModeValue('blue.500', 'blue.300');
  const selectionBgColor = useColorModeValue('blue.50', 'blue.900');
  const checkboxBgColor = useColorModeValue('white', 'gray.800');
  const checkboxBorderColor = useColorModeValue('gray.300', 'gray.600');

  // Debug: Log images data
  console.log('🖼️ PhotoGallery received images:', images?.length || 0, 'images');
  console.log('🖼️ First image sample:', images?.[0]);

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

  return (
    <Box bg={bgColor} py={2}>
      {/* Selection Controls */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" maxW="1800px" mx="auto" px={6}>
          <HStack spacing={3} wrap="wrap">
            <Button
              size="sm"
              colorScheme={isSelectionMode ? 'blue' : 'gray'}
              variant={isSelectionMode ? 'solid' : 'outline'}
              onClick={() => {
                if (toggleSelectionMode) toggleSelectionMode();
              }}
              leftIcon={isSelectionMode ? <CheckIcon /> : undefined}
              borderRadius="full"
              px={6}
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: isSelectionMode 
                  ? '0 4px 12px rgba(59, 130, 246, 0.3)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              transition="all 0.2s ease"
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Photos'}
            </Button>

            {isSelectionMode && (
              <>
                <Tooltip label="Select all photos currently visible" hasArrow>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectAll?.(images)}
                    borderRadius="full"
                    colorScheme="blue"
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
                    size="sm"
                    variant="ghost"
                    onClick={() => onClearSelection?.()}
                    borderRadius="full"
                    colorScheme="gray"
                    _hover={{
                      bg: 'gray.50',
                      transform: 'translateY(-1px)',
                    }}
                    transition="all 0.2s ease"
                  >
                    Unselect All
                  </Button>
                </Tooltip>

                <HStack spacing={3}>
                  <Badge
                    colorScheme="blue"
                    variant="subtle"
                    fontSize="sm"
                    px={3}
                    py={1}
                    borderRadius="full"
                    bg={selectionBgColor}
                    color={selectionColor}
                    fontWeight="semibold"
                  >
                    {selectedCount} selected
                  </Badge>
                  <DeleteButton
                    onClick={() => onDeleteSelectedImages?.(selectedImageIds)}
                    isDisabled={selectedCount === 0}
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    borderRadius="full"
                    px={4}
                    leftIcon={<CloseIcon />}
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                    }}
                    transition="all 0.2s ease"
                  >
                    Delete Selected
                  </DeleteButton>
                </HStack>
              </>
            )}
          </HStack>

          {isSelectionMode && (
            <HStack spacing={2} opacity={0.8}>
              <Text fontSize="xs" color="gray.500">Tips:</Text>
              <Kbd>Click</Kbd>
              <Text fontSize="xs" color="gray.500">to toggle</Text>
            </HStack>
          )}
        </Flex>
      </Box>

      {/* Grid */}
      <Box maxW="1900px" mx="auto" px={{ base: 2, sm: 4, md: 6, lg: 8 }}>
        <SimpleGrid
          columns={{ base: 2, sm: 3, md: 4, lg: 5, xl: 6, '2xl': 8 }}
          spacing={{ base: 2, sm: 3, md: 3, lg: 4, xl: 5 }}
          sx={{
            columnGap: { base: '6px', sm: '8px', md: '12px', lg: '16px', xl: '20px' },
            rowGap: { base: '6px', sm: '8px', md: '12px', lg: '16px', xl: '20px' },
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
                >
                  {/* Overlay sutil quando selecionado */}
                  {isSelectionMode && (
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

                  {/* Imagem */}
                  <Box position="relative" overflow="hidden" borderRadius={isMobile ? '8px' : '12px'}>
                    <Image
                      src={image.url}
                      alt={`Photo from ${countryName}`}
                      width="100%"
                      height="auto"
                      objectFit="cover"
                      loading="lazy"
                      fallbackSrc="https://via.placeholder.com/300x300?text=Photo"
                      onLoad={() => console.log('✅ Image loaded successfully:', image.url)}
                      onError={(e) => console.error('❌ Image failed to load:', image.url, e)}
                      sx={{
                        aspectRatio: '1/1',
                        minHeight: isMobile ? '120px' : '200px',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        filter: isSelected ? 'brightness(0.98) contrast(1.02) saturate(1.05)' : 'none',
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
  isImageSelected: PropTypes.func, // compat
  onSelectAll: PropTypes.func,
  onClearSelection: PropTypes.func,
};

export default PhotoGallery;
