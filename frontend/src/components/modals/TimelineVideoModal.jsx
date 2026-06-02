import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  AlertDescription,
  Spinner,
  useColorModeValue,
  Badge,
  SimpleGrid,
  Image,
  Box,
  Collapse,
  IconButton,
  useToast,
  Tooltip,
  Progress,
} from '@chakra-ui/react';
import { FaVideo, FaImages, FaCalendar, FaExclamationTriangle } from 'react-icons/fa';
import { MdClose, MdUndo, MdExpandMore, MdExpandLess, MdRefresh } from 'react-icons/md';
import { useQuery } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import { buildApiUrl, buildImageUrl } from '../../utils/apiConfig';
import TimelineVideoGenerator from '../features/videos/components/TimelineVideoGeneratorRefactored';
import { useLandingTokens } from '../features/landing/landingUI';

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
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return fetchAllPictures(retryCount + 1);
      }
      throw new Error(`Failed to fetch photos: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      console.warn('Invalid data format received from API');
      return [];
    }

    console.log('📸 Fotos carregadas do backend:', data.length);

    const mappedImages = data.map((image, index) => {
      // Extrair ano do filePath se year estiver undefined
      const fallbackYear = !image.year && image.filePath ? 
        (() => {
          const yearMatch = image.filePath.match(/\/(\d{4})\//);
          return yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
        })() : image.year;

      // Usar index como fallback para fileName se estiver undefined  
      const fallbackFileName = image.fileName || `image_${index + 1}`;
      
      return {
        url: buildImageUrl(image.filePath || ''),
        id: image.id || index,
        year: fallbackYear || new Date().getFullYear(),
        countryId: image.countryId || null,
        fileName: fallbackFileName,
        _original: image
      };
    });

    console.log('✅ Imagens processadas para vídeo:', mappedImages.length);
    return mappedImages;

  } catch (error) {
    if (retryCount < maxRetries && error.message.includes('fetch')) {
      console.warn(`Network error, retrying in ${retryDelay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return fetchAllPictures(retryCount + 1);
    }
    console.error('Failed to fetch photos after all retries:', error);
    throw error;
  }
};

const TimelineVideoModal = ({ isOpen, onClose }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const toast = useToast();
  const [showGenerator, setShowGenerator] = useState(false);
  const [excludedImageIds, setExcludedImageIds] = useState(new Set());
  const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState(new Set());
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Cores do tema - Estilo OpenAI
  const bgColor = useColorModeValue('white', '#0f0f0f');
  const modalBg = useColorModeValue('white', '#171717');
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.7)');
  const textColor = useColorModeValue('#1a1a1a', '#f0f0f0');
  const borderColor = useColorModeValue('rgba(0, 0, 0, 0.1)', 'rgba(255, 255, 255, 0.1)');
  const cardBg = useColorModeValue('#f8f9fa', '#262626');
  const mutedTextColor = useColorModeValue('#666666', '#a0a0a0');
  const headerBg = useColorModeValue('white', '#1a1a1a');
  const buttonBg = useColorModeValue('#000000', '#ffffff');
  const buttonText = useColorModeValue('#ffffff', '#000000');
  const secondaryButtonBg = useColorModeValue('transparent', 'transparent');
  const secondaryButtonBorder = useColorModeValue('#d0d0d0', '#404040');
  const secondaryButtonText = useColorModeValue('#1a1a1a', '#f0f0f0');
  const t = useLandingTokens();

  // Fetch photos with improved caching and error handling
  const { 
    data: images = [], 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useQuery({
    queryKey: ['allPicturesForVideo', isOpen],
    queryFn: fetchAllPictures,
    enabled: isLoggedIn && isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnMount: true,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      console.error('Failed to fetch photos:', error);
      toast({
        title: 'Failed to load photos',
        description: error.message || 'Please try again later',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  // Memoized calculations for better performance
  const filteredImages = useMemo(() => 
    images.filter(img => !excludedImageIds.has(img.id)), 
    [images, excludedImageIds]
  );
  
  const imagesByYear = useMemo(() => 
    filteredImages.reduce((acc, img) => {
      if (!acc[img.year]) acc[img.year] = [];
      acc[img.year].push(img);
      return acc;
    }, {}), 
    [filteredImages]
  );

  const years = useMemo(() => 
    Object.keys(imagesByYear).sort((a, b) => Number(a) - Number(b)), 
    [imagesByYear]
  );

  const totalPhotos = useMemo(() => filteredImages.length, [filteredImages]);
  const excludedCount = useMemo(() => excludedImageIds.size, [excludedImageIds]);
  const estimatedDuration = useMemo(() => 
    Math.round((totalPhotos * 1.5) / 60), 
    [totalPhotos]
  );

  // Improved image management functions with user feedback
  const removeImage = useCallback((imageId) => {
    setExcludedImageIds(prev => new Set([...prev, imageId]));
    toast({
      title: 'Photo excluded',
      description: 'This photo will not be included in the video',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const restoreImage = useCallback((imageId) => {
    setExcludedImageIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });
    toast({
      title: 'Photo restored',
      description: 'This photo will be included in the video',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  }, [toast]);

  const restoreAllImages = useCallback(() => {
    const count = excludedImageIds.size;
    setExcludedImageIds(new Set());
    if (count > 0) {
      toast({
        title: 'All photos restored',
        description: `${count} photos will be included in the video`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [excludedImageIds.size, toast]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast({
        title: 'Photos refreshed',
        description: 'Your photo collection has been updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Refresh failed',
        description: 'Could not refresh photos. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch, toast]);

  const handleImageError = useCallback((imageId) => {
    setImageLoadErrors(prev => new Set([...prev, imageId]));
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

  if (!isLoggedIn) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Timeline Video Generator</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="warning">
              <AlertIcon />
              <AlertDescription>
                You need to be logged in to generate timeline videos.
              </AlertDescription>
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={{ base: "full", md: "6xl", xl: "7xl" }} 
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay bg={overlayBg} backdropFilter="blur(4px)" />
      <ModalContent 
        maxH={{ base: "100vh", md: "90vh" }}
        h={{ base: "100vh", md: "auto" }}
        mx={{ base: 0, md: 4 }}
        my={{ base: 0, md: 4 }}
        borderRadius={{ base: 0, md: "xl" }}
        display="flex"
        flexDirection="column"
        bg={modalBg}
        border={`1px solid ${borderColor}`}
        boxShadow={useColorModeValue(
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
        )}
      >
        <ModalHeader 
          bg={headerBg} 
          borderBottom={`1px solid ${borderColor}`}
          py={6}
          px={8}
          borderTopRadius={{ base: 0, md: "xl" }}
        >
          <HStack spacing={3}>
            <Box 
              p={2} 
              borderRadius="md" 
              bg={useColorModeValue("gray.100", "gray.800")}
            >
              <FaVideo color={useColorModeValue("#4a5568", "#e2e8f0")} />
            </Box>
            <Text fontSize="xl" fontWeight="semibold" color={textColor}>
              Timeline Video Generator
            </Text>
          </HStack>
        </ModalHeader>
        <ModalCloseButton 
          color={textColor}
          _hover={{ bg: useColorModeValue("gray.100", "gray.800") }}
          borderRadius="lg"
          size="lg"
        />
        <ModalBody 
          pb={{ base: 4, md: 6 }}
          px={{ base: 6, md: 8 }}
          pt={{ base: 6, md: 8 }}
          flex="1"
          overflowY="auto"
          display="flex"
          flexDirection="column"
          bg={modalBg}
        >
          {isLoading ? (
            <VStack spacing={4} py={8}>
              <Spinner size="xl" color="blue.500" />
              <Text>Loading your photos...</Text>
              {isFetching && (
                <Progress 
                  size="sm" 
                  isIndeterminate 
                  colorScheme="blue" 
                  w="200px" 
                />
              )}
            </VStack>
          ) : error ? (
            <VStack spacing={4} py={8}>
              <Alert status="error" borderRadius="lg">
                <AlertIcon />
                <VStack align="start" spacing={2} flex="1">
                  <AlertDescription>
                    Error loading photos: {error.message}
                  </AlertDescription>
                  <Button
                    size="sm"
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<MdRefresh />}
                    onClick={handleRefresh}
                    isLoading={isRefreshing}
                    loadingText="Retrying..."
                  >
                    Try Again
                  </Button>
                </VStack>
              </Alert>
            </VStack>
          ) : totalPhotos === 0 ? (
            <Alert status="info">
              <AlertIcon />
              <AlertDescription>
                You don't have photos in your timeline yet. Upload some photos first to generate a video.
              </AlertDescription>
            </Alert>
          ) : showGenerator ? (
            <TimelineVideoGenerator 
              images={filteredImages} 
              onClose={() => setShowGenerator(false)} 
            />
          ) : (
            <VStack spacing={6} align="stretch" flex="1">
              {/* Estatísticas */}
              <Box>
                <Text fontSize="lg" fontWeight="medium" color={textColor} mb={4}>
                  Timeline Summary
                </Text>
                
                <SimpleGrid columns={3} spacing={{ base: 3, md: 4 }} w="100%">
                  {[
                    { icon: FaImages, value: totalPhotos, label: 'Photos' },
                    { icon: FaCalendar, value: years.length, label: 'Years' },
                    { icon: FaVideo, value: `${estimatedDuration}min`, label: 'Duration' },
                  ].map((s) => (
                    <VStack
                      key={s.label}
                      spacing={1}
                      align="center"
                      p={4}
                      bg={cardBg}
                      borderRadius="14px"
                      border={`1px solid ${borderColor}`}
                      transition="border-color .2s ease, transform .2s ease, box-shadow .2s ease"
                      _hover={{ transform: 'translateY(-2px)', borderColor: t.hairlineStrong, boxShadow: t.shadowMd }}
                    >
                      <Box mb={2} p={2} borderRadius="10px" display="inline-flex" bg={t.primarySoftBg} color={t.primary}>
                        <s.icon size={16} />
                      </Box>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor} lineHeight="1">{s.value}</Text>
                      <Text fontSize="xs" color={mutedTextColor} textAlign="center" lineHeight="1.2" fontWeight="medium">{s.label}</Text>
                    </VStack>
                  ))}
                </SimpleGrid>
              </Box>

              {/* Anos com fotos */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3} color={textColor}>
                  Available Years
                </Text>
                <HStack wrap="wrap" spacing={2}>
                  {years.map((year) => (
                    <Box
                      key={year}
                      px={3}
                      py={2}
                      bg={t.surfaceSubtle}
                      borderRadius="10px"
                      border={`1px solid ${borderColor}`}
                      fontSize="sm"
                      color={textColor}
                      fontWeight="600"
                      transition="border-color .2s ease, color .2s ease, transform .2s ease"
                      _hover={{ transform: "translateY(-1px)", borderColor: t.primary, color: t.primary }}
                      cursor="default"
                    >
                      {year} ({imagesByYear[year].length})
                    </Box>
                  ))}
                </HStack>
              </Box>

              {/* Preview de algumas fotos - Colapsável */}
              <Box>
                {/* Header clicável para expandir/colapsar */}
                <HStack 
                  justify="space-between" 
                  align="center" 
                  mb={4}
                  cursor="pointer"
                  onClick={() => setIsPhotoPreviewOpen(!isPhotoPreviewOpen)}
                  p={3}
                  borderRadius="lg"
                  transition="all 0.2s"
                  _hover={{
                    bg: useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")
                  }}
                >
                  <HStack spacing={3}>
                    <IconButton
                      aria-label={isPhotoPreviewOpen ? "Collapse photo preview" : "Expand photo preview"}
                      icon={isPhotoPreviewOpen ? <MdExpandLess /> : <MdExpandMore />}
                      size="sm"
                      variant="ghost"
                      color={textColor}
                    />
                    <Text fontSize="md" fontWeight="medium" color={textColor}>
                      Photo Preview ({totalPhotos} photos{excludedCount > 0 ? `, ${excludedCount} removed` : ''})
                    </Text>
                    {imageLoadErrors.size > 0 && (
                      <Tooltip label={`${imageLoadErrors.size} photos failed to load`}>
                        <Box color="red.500">
                          <FaExclamationTriangle size={16} />
                        </Box>
                      </Tooltip>
                    )}
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Tooltip label="Refresh photos">
                      <IconButton
                        size="sm"
                        icon={<MdRefresh />}
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRefresh();
                        }}
                        isLoading={isRefreshing}
                        aria-label="Refresh photos"
                      />
                    </Tooltip>
                    {excludedCount > 0 && (
                      <Button
                        size="sm"
                        leftIcon={<MdUndo />}
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreAllImages();
                        }}
                        borderRadius="lg"
                        color={useColorModeValue("#F59E0B", "#FBBF24")}
                        fontSize="xs"
                        _hover={{
                          bg: useColorModeValue("rgba(245, 158, 11, 0.1)", "rgba(251, 191, 36, 0.1)")
                        }}
                      >
                        Restore {excludedCount}
                      </Button>
                    )}
                  </HStack>
                </HStack>
                
                {/* Conteúdo colapsável */}
                <Collapse in={isPhotoPreviewOpen} animateOpacity>
                  <VStack spacing={4} align="stretch">
                    <SimpleGrid columns={{ base: 3, sm: 4, md: 6, lg: 8 }} spacing={{ base: 2, md: 3 }}>
                      {images.map((img, index) => {
                        const isExcluded = excludedImageIds.has(img.id);
                        const hasError = imageLoadErrors.has(img.id);
                        return (
                          <Box 
                            key={img.id} 
                            position="relative"
                            opacity={isExcluded ? 0.4 : 1}
                            transform={isExcluded ? "scale(0.95)" : "scale(1)"}
                            transition="all 0.2s"
                          >
                            {hasError ? (
                              <Box
                                w={{ base: "50px", md: "60px" }}
                                h={{ base: "50px", md: "60px" }}
                                bg="gray.100"
                                borderRadius="lg"
                                border="2px solid"
                                borderColor="red.300"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                              >
                                <FaExclamationTriangle color="red" size={16} />
                                <Text fontSize="xs" color="red.500" textAlign="center">
                                  Error
                                </Text>
                              </Box>
                            ) : (
                              <Image
                                src={img.url}
                                alt={`Photo ${index + 1}`}
                                w={{ base: "50px", md: "60px" }}
                                h={{ base: "50px", md: "60px" }}
                                objectFit="cover"
                                borderRadius="lg"
                                border="2px solid"
                                borderColor={isExcluded ? "red.300" : borderColor}
                                filter={isExcluded ? "grayscale(100%)" : "none"}
                                onError={() => handleImageError(img.id)}
                                fallback={
                                  <Box
                                    w={{ base: "50px", md: "60px" }}
                                    h={{ base: "50px", md: "60px" }}
                                    bg="gray.100"
                                    borderRadius="lg"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Spinner size="sm" />
                                  </Box>
                                }
                              />
                            )}
                            
                            {/* Botão de remoção/restauração */}
                            <Box
                              position="absolute"
                              top="-1"
                              left="-1"
                              onClick={() => isExcluded ? restoreImage(img.id) : removeImage(img.id)}
                              cursor="pointer"
                              bg={isExcluded ? "orange.500" : "red.500"}
                              borderRadius="full"
                              w="20px"
                              h="20px"
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              _hover={{ 
                                transform: "scale(1.1)",
                                bg: isExcluded ? "orange.600" : "red.600"
                              }}
                              transition="all 0.2s"
                              boxShadow="0 2px 4px rgba(0,0,0,0.2)"
                            >
                              {isExcluded ? (
                                <MdUndo size={12} color="white" />
                              ) : (
                                <MdClose size={12} color="white" />
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                    
                    {(excludedCount > 0 || imageLoadErrors.size > 0) && (
                      <VStack spacing={2}>
                        {excludedCount > 0 && (
                          <Text fontSize="sm" color="orange.500" textAlign="center">
                            {excludedCount} photo{excludedCount > 1 ? 's' : ''} removed from video
                          </Text>
                        )}
                        {imageLoadErrors.size > 0 && (
                          <Text fontSize="sm" color="red.500" textAlign="center">
                            {imageLoadErrors.size} photo{imageLoadErrors.size > 1 ? 's' : ''} failed to load
                          </Text>
                        )}
                      </VStack>
                    )}
                  </VStack>
                </Collapse>
              </Box>

              {/* Informações sobre o gerador */}
              <Box 
                p={4} 
                bg={useColorModeValue("rgba(59, 130, 246, 0.05)", "rgba(59, 130, 246, 0.1)")}
                borderRadius="lg" 
                border={`1px solid ${useColorModeValue("rgba(59, 130, 246, 0.2)", "rgba(59, 130, 246, 0.3)")}`}
              >
                <HStack spacing={3} align="start">
                  <Box mt={0.5}>
                    <Box w={2} h={2} borderRadius="full" bg={useColorModeValue("#3B82F6", "#60A5FA")} />
                  </Box>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm" fontWeight="medium" color={textColor}>
                      100% Private & Secure
                    </Text>
                    <Text fontSize="xs" color={mutedTextColor} lineHeight="1.4">
                      Video generation happens entirely in your browser. No photos are uploaded to external servers.
                    </Text>
                  </VStack>
                </HStack>
              </Box>

              {/* Funcionalidades */}
              <Box>
                <Text fontSize="md" fontWeight="medium" mb={3} color={textColor}>
                  Features
                </Text>
                <VStack spacing={2} align="stretch">
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Automatic transitions and effects</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Chronological organization by year</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Multiple resolutions (HD, Stories, Reels)</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>Background music support</Text>
                  </HStack>
                  <HStack spacing={3} align="start">
                    <Box mt={1.5} w={1.5} h={1.5} borderRadius="full" bg={mutedTextColor} />
                    <Text fontSize="sm" color={mutedTextColor}>iPhone compatible MP4 export</Text>
                  </HStack>
                </VStack>
                
                {/* iPhone Instructions */}
                <Box 
                  mt={4} 
                  p={3} 
                  bg={useColorModeValue("rgba(0,0,0,0.02)", "rgba(255,255,255,0.02)")}
                  borderRadius="md"
                  border={`1px solid ${borderColor}`}
                >
                  <Text fontSize="xs" color={mutedTextColor} lineHeight="1.4">
                    <strong>iPhone:</strong> Videos download to Files app. To save to Photos: open video → share → "Save to Photos"
                  </Text>
                </Box>
              </Box>
            </VStack>
          )}
        </ModalBody>
        
        {/* Footer fixo com botão sempre visível */}
        {!showGenerator && !isLoading && totalPhotos > 0 && (
          <ModalFooter
            borderTop={`1px solid ${borderColor}`}
            bg={headerBg}
            position={{ base: "sticky", md: "static" }}
            bottom={0}
            zIndex={10}
            justifyContent="center"
            py={6}
            px={8}
            borderBottomRadius={{ base: 0, md: "xl" }}
          >
            <Button
              leftIcon={<FaVideo />}
              bg={t.primary}
              color="white"
              size="lg"
              onClick={() => setShowGenerator(true)}
              px={{ base: 8, md: 10 }}
              py={6}
              w={{ base: "90%", sm: "auto" }}
              minW="280px"
              borderRadius="14px"
              fontSize="md"
              fontWeight="600"
              _hover={{ bg: t.primaryHover, transform: "translateY(-1px)", boxShadow: t.shadowMd }}
              _active={{ transform: "translateY(0)" }}
              transition="all 0.2s"
            >
              Start Generating Video
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TimelineVideoModal;



