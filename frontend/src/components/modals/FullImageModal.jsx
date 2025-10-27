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
  images = [],
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [direction, setDirection] = useState(0);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const textColor = useColorModeValue('white', 'white');
  const glassBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)');

  // Motion values
  const scale = useSpring(1, { stiffness: 220, damping: 28 });
  const x = useSpring(0, { stiffness: 220, damping: 28 });
  const y = useSpring(0, { stiffness: 220, damping: 28 });
  const dragX = useMotionValue(0);

  // Zoom control
  const isZooming = useRef(false);
  const lastTouchDistance = useRef(null);
  const pointerStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });
  const swipeActive = useRef(false);

  const loadedImages = useRef(new Set());
  const viewportRef = useRef(null);

  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const resetZoom = useCallback(() => {
    animate(scale, 1, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    animate(x, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    animate(y, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
  }, [scale, x, y]);

  // preload
  useEffect(() => {
    setImgLoaded(loadedImages.current.has(imageUrl));
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    loadedImages.current.add(imageUrl);
    setImgLoaded(true);
  }, [imageUrl]);

  useEffect(() => {
    if (!images?.length || !hasMultiple) return;
    const preload = (url) => {
      if (!url || loadedImages.current.has(url)) return;
      const img = new Image();
      img.src = url;
      img.onload = () => loadedImages.current.add(url);
    };
    preload(images[currentIndex - 1]);
    preload(images[currentIndex + 1]);
  }, [images, currentIndex, hasMultiple]);

  useEffect(() => {
    dragX.set(0);
    resetZoom();
  }, [imageUrl, isOpen, dragX, resetZoom]);

  // --- Helpers for pinch
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // --- Zoom wheel desktop
  const handleWheel = useCallback(
    (e) => {
      if (!imgLoaded) return;
      e.preventDefault();
      const delta = -e.deltaY;
      const newScale = clamp(scale.get() + delta * 0.001, MIN_SCALE, MAX_SCALE);
      scale.set(newScale);
    },
    [scale, imgLoaded]
  );

  // --- Pointer pan
  const handlePointerDown = useCallback((e) => {
    if (scale.get() <= 1) return;
    isZooming.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x: x.get(), y: y.get() };
  }, [x, y, scale]);

  const handlePointerMove = useCallback((e) => {
    if (!isZooming.current || scale.get() <= 1) return;
    const dx = e.clientX - pointerStart.current.x;
    const dy = e.clientY - pointerStart.current.y;
    x.set(posStart.current.x + dx);
    y.set(posStart.current.y + dy);
  }, [x, y, scale]);

  const handlePointerUp = useCallback(() => {
    isZooming.current = false;
  }, []);

  // --- Pinch zoom
  const handleTouchStartZoom = useCallback((e) => {
    if (e.touches.length === 2) {
      lastTouchDistance.current = getTouchDistance(e.touches);
    }
  }, []);

  const handleTouchMoveZoom = useCallback(
    (e) => {
      if (e.touches.length === 2 && lastTouchDistance.current) {
        const newDistance = getTouchDistance(e.touches);
        const delta = newDistance - lastTouchDistance.current;
        const newScale = clamp(scale.get() + delta * 0.005, MIN_SCALE, MAX_SCALE);
        scale.set(newScale);
        lastTouchDistance.current = newDistance;
      }
    },
    [scale]
  );

  const handleTouchEndZoom = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  // --- Swipe navigation
  const handleTouchStart = useCallback((e) => {
    if (scale.get() > 1) return;
    const touch = e.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
    swipeActive.current = true;
  }, [scale]);

  const handleTouchMove = useCallback(
    (e) => {
      if (!swipeActive.current || scale.get() > 1) return;
      const touch = e.touches[0];
      const dx = touch.clientX - swipeStart.current.x;
      const dy = touch.clientY - swipeStart.current.y;
      if (Math.abs(dy) > Math.abs(dx)) {
        swipeActive.current = false;
        return;
      }
      dragX.set(dx);
    },
    [dragX, scale]
  );

  const handleTouchEnd = useCallback(() => {
    if (!swipeActive.current || scale.get() > 1) return;
    const dx = dragX.get();
    if (dx < -MIN_SWIPE_DISTANCE) {
      setDirection(1);
      onNext?.();
    } else if (dx > MIN_SWIPE_DISTANCE) {
      setDirection(-1);
      onPrev?.();
    }
    animate(dragX, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    swipeActive.current = false;
  }, [dragX, scale, onNext, onPrev]);

  // --- Double click/tap
  const handleDoubleClick = useCallback(() => {
    if (scale.get() > 1) resetZoom();
    else animate(scale, 2, { type: 'spring', stiffness: 200, damping: 25 });
  }, [scale, resetZoom]);

  // --- Keyboard
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

  // --- Header
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
          <Badge bg={glassBg} color="white" borderRadius="full" px={3} py={1} fontSize="xs" backdropFilter="blur(10px)">
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
      <MotionOverlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} bg="black" backdropFilter="blur(10px)" />
      <ModalContent bg="transparent" boxShadow="none" maxW="none">
        <ModalBody p={0} h="100vh" position="relative" overflow="hidden">
          {Header}

          <Center
            ref={viewportRef}
            position="absolute"
            inset={0}
            style={{ touchAction: 'none', overflow: 'hidden' }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={(e) => { handleTouchStart(e); handleTouchStartZoom(e); }}
            onTouchMove={(e) => { handleTouchMove(e); handleTouchMoveZoom(e); }}
            onTouchEnd={(e) => { handleTouchEnd(e); handleTouchEndZoom(e); }}
            onDoubleClick={handleDoubleClick}
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
                  x: scale.get() === 1 ? dragX : x,
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
  images: PropTypes.array,
};

export default FullImageModal;
