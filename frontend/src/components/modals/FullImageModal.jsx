import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Modal, ModalOverlay, ModalContent, ModalBody, IconButton,
  Flex, Image, Box, useColorModeValue, useBreakpointValue,
  Heading, Spinner, Center, Text, HStack, Badge,
} from '@chakra-ui/react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from 'framer-motion';
import logo from '../../assets/logo.png';

const MotionOverlay = motion(ModalOverlay);
const MotionDiv = motion.div;

const MIN_SWIPE_DISTANCE = 50;
const MIN_SWIPE_VELOCITY = 600;
const EASING_CURVE = [0.25, 0.46, 0.45, 0.94];
const MAX_SCALE = 4;
const MIN_SCALE = 1;

const FullImageModal = memo(function FullImageModal({
  isOpen,
  onClose,
  imageUrl,
  onNext,
  onPrev,
  hasMultiple,
  countryName,
  currentIndex = 0,
  totalCount = 1,
  images = [], // ✅ adiciona a lista de imagens aqui (urls em array)
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [direction, setDirection] = useState(0);
  const [downPosition, setDownPosition] = useState(0);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const textColor = useColorModeValue('white', 'white');
  const glassBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)');

  // === Zoom / Pan MotionValues ===
  const scale = useSpring(1, { stiffness: 220, damping: 28 });
  const x = useSpring(0, { stiffness: 220, damping: 28 });
  const y = useSpring(0, { stiffness: 220, damping: 28 });
  const dragX = useMotionValue(0);

  const loadedImages = useRef(new Set());
  const viewportRef = useRef(null);

  // === Helpers ===
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const resetZoom = useCallback(() => {
    animate(scale, 1, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    animate(x, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    animate(y, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
  }, [scale, x, y]);

  // === Cache-aware image load ===
  useEffect(() => {
    if (loadedImages.current.has(imageUrl)) {
      setImgLoaded(true);
    } else {
      setImgLoaded(false);
    }
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    loadedImages.current.add(imageUrl);
    setImgLoaded(true);
  }, [imageUrl]);

  // === Preload vizinhas (Apple-style) ===
  useEffect(() => {
    if (!images?.length || !hasMultiple) return;

    const preload = (url) => {
      if (!url || loadedImages.current.has(url)) return;
      const img = new Image();
      img.src = url;
      img.onload = () => loadedImages.current.add(url);
    };

    const prevUrl = images[currentIndex - 1];
    const nextUrl = images[currentIndex + 1];
    preload(prevUrl);
    preload(nextUrl);
  }, [images, currentIndex, hasMultiple]);

  // === Reset geral quando abre ou troca imagem ===
  useEffect(() => {
    setDownPosition(0);
    dragX.set(0);
    resetZoom();
  }, [imageUrl, isOpen, dragX, resetZoom]);

  // === Navegação via teclado (mantida igual) ===
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        if (scale.get() > 1) resetZoom();
        else onClose();
      }
      if (scale.get() > 1) return;
      if (e.key === 'ArrowRight' && hasMultiple) {
        setDirection(1);
        onNext?.();
      }
      if (e.key === 'ArrowLeft' && hasMultiple) {
        setDirection(-1);
        onPrev?.();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose, onNext, onPrev, resetZoom, scale, hasMultiple]);

  // === Header ===
  const Header = (
    <Flex
      position="absolute"
      top={0}
      left={0}
      right={0}
      zIndex={1000}
      p={4}
      justify="space-between"
      align="center"
      bg="linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)"
      pointerEvents="none"
    >
      <HStack spacing={3} pointerEvents="auto">
        <Image src={logo} alt="Photomap Logo" h={8} />
        <Heading size="sm" color={textColor} fontWeight="800">
          Photomap
        </Heading>
        {countryName && (
          <Badge colorScheme="blue" borderRadius="full" px={3} py={1} fontSize="xs">
            {countryName}
          </Badge>
        )}
        {totalCount > 1 && (
          <Badge bg={glassBg} borderRadius="full" px={3} py={1} fontSize="xs" backdropFilter="blur(10px)">
            {currentIndex + 1} / {totalCount}
          </Badge>
        )}
      </HStack>

      <IconButton
        icon={<FiX />}
        aria-label="Close"
        size="lg"
        bg={glassBg}
        color={textColor}
        onClick={() => {
          if (scale.get() > 1) resetZoom();
          else onClose();
        }}
        borderRadius="full"
        pointerEvents="auto"
        _hover={{ bg: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' }}
        transition="all 0.2s ease"
      />
    </Flex>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="fade" isCentered>
      <MotionOverlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        bg="black"
        backdropFilter="blur(10px)"
      />
      <ModalContent bg="transparent" boxShadow="none" maxW="none">
        <ModalBody p={0} h="100vh" position="relative" overflow="hidden">
          {Header}

          {/* === Image viewer area === */}
          <Center
            ref={viewportRef}
            position="absolute"
            inset={0}
            style={{ touchAction: 'none' }}
          >
            <AnimatePresence initial={false} custom={direction}>
              <MotionDiv
                key={imageUrl}
                custom={direction}
                initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: direction < 0 ? 100 : -100, scale: 0.98 }}
                transition={{ type: 'tween', ease: EASING_CURVE, duration: 0.3 }}
                style={{
                  x,
                  y,
                  scale,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                }}
              >
                {!imgLoaded && (
                  <Center position="absolute">
                    <Spinner size="xl" thickness="3px" color="white" emptyColor="gray.700" />
                  </Center>
                )}
                <Image
                  src={imageUrl}
                  alt={countryName ? `Photo from ${countryName}` : 'Photo'}
                  maxW="100%"
                  maxH="100%"
                  objectFit="contain"
                  draggable={false}
                  onLoad={handleImageLoad}
                  style={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'none',
                  }}
                />
              </MotionDiv>
            </AnimatePresence>
          </Center>

          {/* === Nav arrows === */}
          {hasMultiple && (
            <>
              <IconButton
                icon={<FiChevronLeft />}
                aria-label="Previous"
                position="absolute"
                left={{ base: 4, md: 8 }}
                top="50%"
                transform="translateY(-50%)"
                zIndex={100}
                bg={glassBg}
                color={textColor}
                borderRadius="full"
                size={{ base: 'md', md: 'lg' }}
                display={{ base: 'none', md: 'flex' }}
                _hover={{ bg: 'rgba(255,255,255,0.2)', transform: 'translateY(-50%) scale(1.1)' }}
                onClick={() => {
                  if (scale.get() > 1) return;
                  setDirection(-1);
                  onPrev?.();
                }}
              />
              <IconButton
                icon={<FiChevronRight />}
                aria-label="Next"
                position="absolute"
                right={{ base: 4, md: 8 }}
                top="50%"
                transform="translateY(-50%)"
                zIndex={100}
                bg={glassBg}
                color={textColor}
                borderRadius="full"
                size={{ base: 'md', md: 'lg' }}
                display={{ base: 'none', md: 'flex' }}
                _hover={{ bg: 'rgba(255,255,255,0.2)', transform: 'translateY(-50%) scale(1.1)' }}
                onClick={() => {
                  if (scale.get() > 1) return;
                  setDirection(1);
                  onNext?.();
                }}
              />
            </>
          )}

          {/* === Mobile indicators === */}
          {hasMultiple && isMobile && scale.get() === 1 && (
            <>
              <Box
                position="absolute"
                bottom={{ base: 8, md: 12 }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={100}
                bg={glassBg}
                backdropFilter="blur(10px)"
                px={4}
                py={2}
                borderRadius="full"
                pointerEvents="none"
              >
                <HStack spacing={2}>
                  {Array.from({ length: Math.min(totalCount, 5) }).map((_, i) => (
                    <Box
                      key={i}
                      w={2}
                      h={2}
                      borderRadius="full"
                      bg={currentIndex % totalCount === i ? 'white' : 'rgba(255,255,255,0.3)'}
                    />
                  ))}
                  {totalCount > 5 && (
                    <Text fontSize="xs" color="white" opacity={0.7}>
                      +{totalCount - 5}
                    </Text>
                  )}
                </HStack>
              </Box>
              <Box
                position="absolute"
                bottom={{ base: 60, md: 20 }}
                left="50%"
                transform="translateX(-50%)"
                zIndex={100}
                pointerEvents="none"
              >
                <Text fontSize="xs" color="white" opacity={0.6} textAlign="center">
                  Swipe to navigate
                </Text>
              </Box>
            </>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
});

FullImageModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  imageUrl: PropTypes.string.isRequired,
  onNext: PropTypes.func,
  onPrev: PropTypes.func,
  hasMultiple: PropTypes.bool,
  countryName: PropTypes.string,
  currentIndex: PropTypes.number,
  totalCount: PropTypes.number,
  images: PropTypes.array, // ✅ lista completa de URLs
};

export default FullImageModal;
