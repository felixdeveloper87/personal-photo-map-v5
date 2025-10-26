import React, { memo, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  IconButton,
  Flex,
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
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from 'framer-motion';
import logo from '../../assets/logo.png';

const MotionOverlay = motion(ModalOverlay);
const MotionDiv = motion.div;

const MIN_SWIPE_DISTANCE = 50;
const MIN_SWIPE_VELOCITY = 600; // px/s
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
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [direction, setDirection] = useState(0);
  const [downPosition, setDownPosition] = useState(0);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const textColor = useColorModeValue('white', 'white');
  const glassBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)');

  // --- Zoom/Pan state (GPU-friendly) ---
  const scale = useSpring(1, { stiffness: 220, damping: 28 });
  const x = useSpring(0, { stiffness: 220, damping: 28 });
  const y = useSpring(0, { stiffness: 220, damping: 28 });

  // For swipe inertial navigation when scale == 1
  const dragX = useMotionValue(0);

  // Pointers for pinch
  const pointers = useRef(new Map());
  const pinchStart = useRef({ distance: 0, scale: 1, midX: 0, midY: 0 });
  const lastTapRef = useRef({ time: 0, x: 0, y: 0 });
  const viewportRef = useRef(null);

  // --- Helpers ---
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));
  const getDistance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const getMid = (p1, p2) => ({ x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 });

  const resetZoom = useCallback(() => {
    animate(scale, 1, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    animate(x, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    animate(y, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
  }, [scale, x, y]);

  const zoomTo = useCallback(
    (nextScale, focal) => {
      // focal em coords de viewport; aproximamos deslocamento para manter foco visível
      const currentScale = scale.get();
      const s = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const dx = (focal?.x ?? 0) - (viewportRef.current?.clientWidth ?? 0) / 2;
      const dy = (focal?.y ?? 0) - (viewportRef.current?.clientHeight ?? 0) / 2;

      // move na direção oposta ao ponto de foco para "ancorar" o ponto
      const factor = (s - currentScale) / s;
      x.set(x.get() - dx * factor);
      y.set(y.get() - dy * factor);
      scale.set(s);
    },
    [scale, x, y]
  );

  const handleDoubleTap = useCallback(
    (clientX, clientY) => {
      const now = performance.now();
      const dt = now - lastTapRef.current.time;
      lastTapRef.current = { time: now, x: clientX, y: clientY };
      if (dt < 300) {
        const target = scale.get() === 1 ? 2.5 : 1;
        zoomTo(target, { x: clientX, y: clientY });
      }
    },
    [scale, zoomTo]
  );

  // --- Touch & gesture handlers ---
  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    // double-tap detection (also works for mouse double-click)
    handleDoubleTap(e.clientX, e.clientY);
  }, [handleDoubleTap]);

  const onPointerMove = useCallback(
    (e) => {
      if (!pointers.current.has(e.pointerId)) return;
      pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.current.size >= 2) {
        // PINCH
        const [p1, p2] = Array.from(pointers.current.values());
        const dist = getDistance(p1, p2);
        const mid = getMid(p1, p2);

        if (pinchStart.current.distance === 0) {
          pinchStart.current = {
            distance: dist,
            scale: scale.get(),
            midX: mid.x,
            midY: mid.y,
          };
          return;
        }

        const nextScale = clamp(
          (dist / pinchStart.current.distance) * pinchStart.current.scale,
          MIN_SCALE,
          MAX_SCALE
        );
        // manter o ponto médio ancorado
        zoomTo(nextScale, mid);
      } else if (scale.get() > 1) {
        // PAN quando com zoom
        x.set(x.get() + e.movementX);
        y.set(y.get() + e.movementY);
      } else {
        // Drag leve para feedback quando scale==1 (sem travar scroll)
        dragX.set(dragX.get() + e.movementX);
      }
    },
    [dragX, scale, x, y, zoomTo]
  );

  const onPointerUp = useCallback(
    (e) => {
      pointers.current.delete(e.pointerId);
      if (pointers.current.size < 2) {
        pinchStart.current = { distance: 0, scale: 1, midX: 0, midY: 0 };
      }

      // se scale==1, avaliar navegação por swipe
      if (scale.get() === 1 && hasMultiple) {
        const vx = dragX.getVelocity?.() ?? 0;
        const dx = dragX.get();

        if (vx <= -MIN_SWIPE_VELOCITY || dx <= -MIN_SWIPE_DISTANCE) {
          setDirection(1);
          onNext?.();
        } else if (vx >= MIN_SWIPE_VELOCITY || dx >= MIN_SWIPE_DISTANCE) {
          setDirection(-1);
          onPrev?.();
        }
        // volta para 0 (snap back) após avaliar
        animate(dragX, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.2 });
      }
    },
    [dragX, hasMultiple, onNext, onPrev, scale]
  );

  // Wheel zoom (desktop)
  const onWheel = useCallback(
    (e) => {
      if (!viewportRef.current) return;
      e.preventDefault();
      const delta = -e.deltaY; // scroll up = zoom in
      const factor = delta > 0 ? 1.1 : 0.9;
      const next = clamp(scale.get() * factor, MIN_SCALE, MAX_SCALE);
      zoomTo(next, { x: e.clientX, y: e.clientY });
    },
    [scale, zoomTo]
  );

  // Swipe-down to close (mobile) — reaproveita tua UX original
  const touchStartY = useRef(0);
  const onTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0]?.clientY ?? 0;
  }, []);
  const onTouchMove = useCallback((e) => {
    if (scale.get() > 1) return; // com zoom, não fecha
    const yNow = e.touches[0]?.clientY ?? 0;
    const dy = yNow - touchStartY.current;
    if (dy > 0) setDownPosition(dy);
  }, [scale]);
  const onTouchEnd = useCallback(() => {
    if (scale.get() > 1) return;
    if (downPosition > 80) {
      setDownPosition(0);
      onClose();
    } else {
      setDownPosition(0);
    }
  }, [downPosition, onClose, scale]);

  // Keyboard navigation (quando sem zoom)
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
      if ((e.key === '0' || e.key === '1') && scale.get() !== 1) resetZoom();
      if ((e.key === '+' || e.key === '=') && scale.get() < MAX_SCALE) zoomTo(scale.get() * 1.2);
      if (e.key === '-' && scale.get() > MIN_SCALE) zoomTo(scale.get() / 1.2);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [hasMultiple, isOpen, onClose, onNext, onPrev, resetZoom, scale, zoomTo]);

  // Reset básico ao trocar imagem/abrir
  useEffect(() => {
    setImgLoaded(false);
    setDownPosition(0);
    dragX.set(0);
    resetZoom();
  }, [imageUrl, isOpen, dragX, resetZoom]);

  // Header glass + close
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
        variants={{ enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }}
        initial="enter"
        animate="center"
        exit="exit"
        bg="black"
        backdropFilter="blur(10px)"
      />
      <ModalContent
        bg="transparent"
        boxShadow="none"
        maxW="none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        transform={downPosition ? `translateY(${downPosition}px)` : 'translateY(0)'}
        opacity={downPosition ? 1 - downPosition / 500 : 1}
        transition="transform 0.1s ease-out"
      >
        <ModalBody p={0} h="100vh" position="relative" overflow="hidden">
          {Header}

          {/* Área de visualização com pinch/drag/wheel */}
          <Center
            ref={viewportRef}
            position="absolute"
            inset={0}
            style={{ touchAction: 'none' }} // necessário para pinch/drag consistente
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
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
                  // Snap feedback quando scale==1
                  x: scale.get() === 1 ? dragX : x,
                  y: scale.get() === 1 ? 0 : y,
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
                  onLoad={() => setImgLoaded(true)}
                  style={{
                    opacity: imgLoaded ? 1 : 0,
                    transition: 'opacity 0.25s ease',
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    pointerEvents: 'none', // eventos tratados no container
                  }}
                />
              </MotionDiv>
            </AnimatePresence>
          </Center>

          {/* Navegação desktop (oculta no mobile) */}
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

          {/* Indicadores mobile */}
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
};

export default FullImageModal;
