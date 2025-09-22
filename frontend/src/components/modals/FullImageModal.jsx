import React, { memo, useEffect, useCallback, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
  Flex,
  VStack,
  Image,
  Box,
  useColorModeValue,
  useBreakpointValue,
  Heading,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import logo from '../../assets/logo.png';

// Animation variants
const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const FullImageModal = memo(
  ({
    isOpen,
    onClose,
    imageUrl,
    onNext,
    onPrev,
    hasMultiple,
    fullscreenRef,
    toggleFullScreen,
    isFullscreen,
    countryName,
    currentIndex,
    totalCount,
  }) => {
    const [imgLoaded, setImgLoaded] = useState(false);
    const isMobile = useBreakpointValue({ base: true, md: false });
    
    // Referências para controle do swipe e zoom
    const transformWrapperRef = useRef(null);
    const touchStartRef = useRef(null);
    const isSwipingRef = useRef(false);
    const initialScaleRef = useRef(1);

    // Configurações de swipe
    const SWIPE_THRESHOLD = 50;
    const SWIPE_TIME_THRESHOLD = 300;

    // Cores
    const bgColor = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.800', 'white');
    const accentColor = useColorModeValue('teal.500', 'teal.300');
    const buttonBg = useColorModeValue('gray.100', 'gray.700');

    const modalSize = useBreakpointValue({ base: 'full', md: '5xl', lg: '6xl' });

    // Wrap helpers
    const canWrap =
      typeof currentIndex === 'number' &&
      typeof totalCount === 'number' &&
      totalCount > 0;

    const goNext = useCallback((e) => {
      if (!hasMultiple) return;
      if (canWrap) {
        const next = (currentIndex + 1) % totalCount;
        onNext && onNext(e, next);
      } else {
        onNext && onNext(e);
      }
    }, [hasMultiple, canWrap, currentIndex, totalCount, onNext]);

    const goPrev = useCallback((e) => {
      if (!hasMultiple) return;
      if (canWrap) {
        const prev = (currentIndex - 1 + totalCount) % totalCount;
        onPrev && onPrev(e, prev);
      } else {
        onPrev && onPrev(e);
      }
    }, [hasMultiple, canWrap, currentIndex, totalCount, onPrev]);

    // Função para lidar com zoom out que fecha o modal
    const handleZoomOut = useCallback((zoomOut, resetTransform) => {
      const currentState = transformWrapperRef.current?.instance?.transformState;
      if (currentState?.scale && currentState.scale <= initialScaleRef.current + 0.1) {
        // Se já está no tamanho inicial ou próximo, fecha o modal
        onClose();
      } else if (zoomOut) {
        // Se não, faz zoom out normal
        zoomOut();
      }
    }, [onClose]);

    // Controle de swipe para mobile
    const handleTouchStart = useCallback((e) => {
      if (!hasMultiple || !isMobile) return;
      
      // Só processa se for um toque único
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      isSwipingRef.current = false;
    }, [hasMultiple, isMobile]);

    const handleTouchMove = useCallback((e) => {
      if (!touchStartRef.current || !hasMultiple || !isMobile) return;
      
      // Só processa se for um toque único
      if (e.touches.length !== 1) return;
      
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
              // Se o movimento horizontal é maior que o vertical e passou do threshold
        if (deltaX > deltaY && deltaX > 20) {
          // Marca como swipe em progresso
          isSwipingRef.current = true;
          // Previne scroll apenas se estivermos fazendo swipe horizontal
          e?.preventDefault?.();
        }
    }, [hasMultiple, isMobile]);

    const handleTouchEnd = useCallback((e) => {
      if (!touchStartRef.current || !hasMultiple || !isMobile) return;
      
      // Só processa se for um toque único
      if (e.changedTouches.length !== 1) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      const deltaTime = Date.now() - touchStartRef.current.time;
      
      // Verifica se é um swipe horizontal válido
      const isValidSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD && 
                          deltaY < Math.abs(deltaX) && 
                          deltaTime < SWIPE_TIME_THRESHOLD;
      
      if (isValidSwipe) {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        
        if (deltaX > 0) {
          goPrev(e); // Swipe right = imagem anterior
        } else {
          goNext(e); // Swipe left = próxima imagem
        }
      }
      
      // Reset
      touchStartRef.current = null;
      isSwipingRef.current = false;
    }, [hasMultiple, isMobile, goNext, goPrev, SWIPE_THRESHOLD, SWIPE_TIME_THRESHOLD]);

    // Reset quando a imagem muda
    useEffect(() => {
      setImgLoaded(false);
      // Reset mais seguro usando o transformWrapperRef
      if (transformWrapperRef.current?.resetTransform) {
        try {
          transformWrapperRef.current.resetTransform();
        } catch (error) {
          // Se falhar, apenas log sem quebrar
          console.warn('Reset transform failed:', error);
        }
      }
    }, [imageUrl]);

    // Focus management
    useEffect(() => {
      if (isOpen) {
        const focusable = document.querySelector('[aria-label="Close modal"]');
        if (focusable) focusable.focus();
      }
    }, [isOpen]);

    // Keyboard navigation
    useEffect(() => {
      if (!isOpen || !hasMultiple) return;
      
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowRight') {
          e?.preventDefault?.();
          goNext(e);
        } else if (e.key === 'ArrowLeft') {
          e?.preventDefault?.();
          goPrev(e);
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, hasMultiple, goNext, goPrev]);

    return (
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize} motionPreset="scale" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent
          as={motion.div}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          bg={bgColor}
          borderRadius={{ base: 0, md: 'lg' }}
          boxShadow="2xl"
          overflow="hidden"
          h={{ base: '100vh', md: 'auto' }}
        >
          <ModalBody
            p={{ base: 0, md: 4 }}
            position="relative"
            pb={{ base: 'calc(env(safe-area-inset-bottom) + 56px)', md: 4 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Logo / Marca d'água */}
            <Flex
              position="absolute"
              top={{ base: '8px', md: '10px' }}
              left={{ base: '8px', md: '10px' }}
              zIndex="45"
              align="center"
              opacity={0.7}
              pointerEvents="none"
            >
              <Image src={logo} alt="Photomap Logo" h={{ base: '24px', md: '32px' }} mr={2} />
              <Heading
                size={{ base: 'xs', md: 'sm' }}
                color={textColor}
                fontWeight="800"
                letterSpacing="tight"
                textShadow="0 1px 2px rgba(0,0,0,0.3)"
              >
                Photomap
              </Heading>
            </Flex>

            {/* Fechar */}
            <IconButton
              icon={<FiX />}
              aria-label="Close modal"
              position="absolute"
              top={{ base: '8px', md: '10px' }}
              right={{ base: '8px', md: '10px' }}
              colorScheme="red"
              variant="solid"
              size="lg"
              zIndex="50"
              onClick={onClose}
            />

            <Box ref={fullscreenRef}>
              <VStack spacing={{ base: 2, md: 4 }} align="stretch">
                <TransformWrapper
                  ref={transformWrapperRef}
                  initialScale={1}
                  minScale={1} // Não permite zoom out abaixo do tamanho inicial
                  maxScale={3}
                  wheel={{ step: 0.2 }}
                  doubleClick={{ disabled: false, mode: 'zoomIn' }}
                  pinch={{ step: 5 }}
                  centerOnInit
                  centerZoomedOut
                  limitToBounds={false}
                  onInit={(ref, state) => {
                    initialScaleRef.current = state?.scale || 1;
                    if (isFullscreen && ref && typeof ref.centerView === 'function') {
                      ref.centerView();
                    }
                  }}
                  onZoomStop={(ref, state) => {
                    // Se tentar fazer zoom out abaixo do inicial, fecha o modal
                    if (state?.scale && state.scale < initialScaleRef.current) {
                      onClose();
                    }
                  }}
                >
                  {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                    <>
                      {/* Controles de zoom/fullscreen apenas no desktop */}
                      {!isMobile && (
                        <Flex justify="center" wrap="wrap" gap={2} zIndex="40" mb={2}>
                          <IconButton
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              handleZoomOut(zoomOut, resetTransform);
                            }}
                            icon={<FiZoomOut />}
                            aria-label="Zoom out or close"
                            size="md"
                            bg={buttonBg}
                            color={textColor}
                            _hover={{ bg: accentColor, color: 'white' }}
                          />
                          <IconButton
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              zoomIn();
                            }}
                            icon={<FiZoomIn />}
                            aria-label="Zoom in"
                            size="md"
                            bg={buttonBg}
                            color={textColor}
                            _hover={{ bg: accentColor, color: 'white' }}
                          />
                          <IconButton
                            onClick={(e) => {
                              e?.stopPropagation?.();
                              toggleFullScreen?.();
                              if (!isFullscreen && typeof centerView === 'function') {
                                centerView();
                              }
                            }}
                            icon={<FiMaximize />}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                            size="md"
                            bg={buttonBg}
                            color={textColor}
                            _hover={{ bg: accentColor, color: 'white' }}
                          />
                        </Flex>
                      )}

                      {/* Área da imagem */}
                      <TransformComponent
                        wrapperStyle={{
                          width: '100%',
                          height: isFullscreen
                            ? '100vh'
                            : isMobile
                            ? 'calc(100vh - 112px)'
                            : '70vh',
                          maxHeight: isFullscreen
                            ? '100vh'
                            : isMobile
                            ? 'calc(100vh - 112px)'
                            : '70vh',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          overflow: 'hidden',
                        }}
                        contentStyle={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <Box
                          w="100%"
                          h="100%"
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          style={{ 
                            touchAction: isMobile ? 'pan-x pan-y' : 'auto'
                          }}
                        >
                          {!imgLoaded && (
                            <Center 
                              position="absolute"
                              top="50%"
                              left="50%"
                              transform="translate(-50%, -50%)"
                              zIndex="10"
                            >
                              <Spinner size="xl" thickness="4px" color={accentColor} />
                            </Center>
                          )}
                          <Image
                            src={imageUrl}
                            alt={
                              countryName
                                ? `Full-size image from ${countryName}`
                                : 'Full-size image'
                            }
                            maxWidth="100%"
                            maxHeight="100%"
                            width="auto"
                            height="auto"
                            objectFit="contain"
                            borderRadius={{ base: 0, md: 'md' }}
                            boxShadow={{ base: 'none', md: 'lg' }}
                            onLoad={() => {
                              setImgLoaded(true);
                              // Garantir que a imagem fique centralizada após carregar
                              setTimeout(() => {
                                if (transformWrapperRef.current?.instance) {
                                  const { centerView } = transformWrapperRef.current.instance;
                                  if (typeof centerView === 'function') {
                                    centerView();
                                  }
                                }
                              }, 100);
                            }}
                            style={{
                              display: imgLoaded ? 'block' : 'none',
                            }}
                          />
                        </Box>
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </VStack>
            </Box>

            {/* Setas de navegação - apenas desktop */}
            {hasMultiple && !isMobile && (
              <>
                <IconButton
                  icon={<Text fontSize="3xl" fontWeight="bold">&lsaquo;</Text>}
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    goPrev(e);
                  }}
                  aria-label="Previous image"
                  position="absolute"
                  top="50%"
                  left="20px"
                  transform="translateY(-50%)"
                  zIndex="40"
                  variant="ghost"
                  size="lg"
                  color={textColor}
                  bg="rgba(255,255,255,0.1)"
                  backdropFilter="blur(10px)"
                  _hover={{ bg: accentColor, color: 'white' }}
                  borderRadius="full"
                />
                <IconButton
                  icon={<Text fontSize="3xl" fontWeight="bold">&rsaquo;</Text>}
                  onClick={(e) => {
                    e?.stopPropagation?.();
                    goNext(e);
                  }}
                  aria-label="Next image"
                  position="absolute"
                  top="50%"
                  right="20px"
                  transform="translateY(-50%)"
                  zIndex="40"
                  variant="ghost"
                  size="lg"
                  color={textColor}
                  bg="rgba(255,255,255,0.1)"
                  backdropFilter="blur(10px)"
                  _hover={{ bg: accentColor, color: 'white' }}
                  borderRadius="full"
                />
              </>
            )}

            {/* Indicador de navegação por swipe no mobile */}
            {hasMultiple && isMobile && (
              <Box
                position="absolute"
                bottom="20px"
                left="50%"
                transform="translateX(-50%)"
                zIndex="40"
                opacity="0.6"
                pointerEvents="none"
              >
                <Text fontSize="xs" color={textColor} textAlign="center">
                  Deslize para navegar
                </Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

FullImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  hasMultiple: PropTypes.bool,
  fullscreenRef: PropTypes.object,
  toggleFullScreen: PropTypes.func,
  isFullscreen: PropTypes.bool,
  countryName: PropTypes.string,
  currentIndex: PropTypes.number,
  totalCount: PropTypes.number,
};

export default FullImageModal;