import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
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
  HStack,
  Badge,
} from '@chakra-ui/react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/logo.png';

const MotionOverlay = motion(ModalOverlay);
const MotionDiv = motion.div;

// === Constants ===
const MIN_SWIPE_DISTANCE = 50;
const EASING_CURVE = [0.25, 0.46, 0.45, 0.94];

// === Animation Variants ===
const imageVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 100 : -100,
    scale: 0.95,
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction < 0 ? 100 : -100,
    scale: 0.95,
    zIndex: 0,
  }),
};

const backdropVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

// === Component ===
const FullImageModal = memo(function FullImageModal({
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
  currentIndex = 0,
  totalCount = 1,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [direction, setDirection] = useState(0);
  const [downPosition, setDownPosition] = useState(0);

  const touchStart = useRef({ x: 0, y: 0 });
  const touchEnd = useRef({ x: 0, y: 0 });
  const modalRef = useRef(null);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const textColor = useColorModeValue('white', 'white');
  const glassBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)');

  // === Touch Handlers ===
  const handleTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    touchEnd.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchMove = useCallback((e) => {
    const t = e.touches[0];
    touchEnd.current = { x: t.clientX, y: t.clientY };

    // Drag-down visual effect
    const deltaY = t.clientY - touchStart.current.y;
    if (deltaY > 0) setDownPosition(deltaY);
  }, []);

  const handleTouchEnd = useCallback(() => {
    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;

    // Swipe down to close
    if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > MIN_SWIPE_DISTANCE) {
      setDownPosition(0);
      onClose();
      return;
    }

    // Horizontal swipe for navigation
    if (Math.abs(deltaX) > MIN_SWIPE_DISTANCE && hasMultiple) {
      setDirection(deltaX < 0 ? 1 : -1);
      deltaX < 0 ? onNext?.() : onPrev?.();
    }

    setDownPosition(0);
  }, [onClose, hasMultiple, onNext, onPrev]);

  // === Keyboard Navigation ===
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
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
  }, [isOpen, hasMultiple, onNext, onPrev, onClose]);

  // === Reset States on URL/Modal Change ===
  useEffect(() => {
    setImgLoaded(false);
    setDownPosition(0);
  }, [imageUrl, isOpen]);

  // === Render ===
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" motionPreset="fade" isCentered>
      <MotionOverlay
        variants={backdropVariants}
        initial="enter"
        animate="center"
        exit="exit"
        bg="black"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        ref={modalRef}
        bg="transparent"
        boxShadow="none"
        maxW="none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        transform={downPosition ? `translateY(${downPosition}px)` : 'translateY(0)'}
        opacity={downPosition ? 1 - downPosition / 500 : 1}
        transition="transform 0.1s ease-out"
      >
        <ModalBody p={0} h="100vh" position="relative" overflow="hidden">
          {/* === Header === */}
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
                <Badge
                  bg={glassBg}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontSize="xs"
                  backdropFilter="blur(10px)"
                >
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
              onClick={onClose}
              borderRadius="full"
              pointerEvents="auto"
              _hover={{ bg: 'rgba(255,255,255,0.2)', transform: 'rotate(90deg)' }}
              transition="all 0.2s ease"
            />
          </Flex>

          {/* === Image Transition === */}
          <Center position="absolute" inset={0}>
            <AnimatePresence initial={false} custom={direction}>
              <MotionDiv
                key={imageUrl}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: 'tween', ease: EASING_CURVE, duration: 0.3 }}
                style={{
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
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    touchAction: 'manipulation',
                  }}
                />
              </MotionDiv>
            </AnimatePresence>
          </Center>

          {/* === Desktop Navigation Buttons === */}
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
                  setDirection(1);
                  onNext?.();
                }}
              />
            </>
          )}

          {/* === Mobile Indicators === */}
          {hasMultiple && isMobile && (
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
  fullscreenRef: PropTypes.object,
  toggleFullScreen: PropTypes.func,
  isFullscreen: PropTypes.bool,
  countryName: PropTypes.string,
  currentIndex: PropTypes.number,
  totalCount: PropTypes.number,
};

export default FullImageModal;
