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
  const [previousImage, setPreviousImage] = useState(null);

  const isMobile = useBreakpointValue({ base: true, md: false });
  const textColor = useColorModeValue('white', 'white');
  const glassBg = useColorModeValue('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.1)');

  // Motion values (zoom/pan)
  const scale = useSpring(1, { stiffness: 400, damping: 30 });
  const x = useSpring(0, { stiffness: 600, damping: 30 });
  const y = useSpring(0, { stiffness: 600, damping: 30 });
  const dragX = useMotionValue(0); // swipe nav (somente quando scale === 1)

  // Refs e dimensões
  const containerRef = useRef(null);
  const imageElRef = useRef(null);
  const containerSize = useRef({ w: 0, h: 0 });
  const naturalSize = useRef({ w: 0, h: 0 });

  // Estados auxiliares de gesto
  const isPanning = useRef(false);
  const lastTouchDistance = useRef(null);
  const pinchCenter = useRef({ x: 0, y: 0 });

  const pointerStart = useRef({ x: 0, y: 0 });
  const posStart = useRef({ x: 0, y: 0 });
  const swipeStart = useRef({ x: 0, y: 0 });
  const swipeActive = useRef(false);

  const loadedImages = useRef(new Set());

  // Utils
  const clamp = (val, min, max) => Math.min(max, Math.max(min, val));

  const updateContainerSize = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    containerSize.current = { w: rect.width, h: rect.height };
  }, []);

  useEffect(() => {
    updateContainerSize();
    const onResize = () => updateContainerSize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [updateContainerSize]);

  // Calcula o tamanho base (object-fit: contain) para a imagem dentro do container
  const getBaseFittedSize = useCallback(() => {
    const { w: cw, h: ch } = containerSize.current;
    const { w: iw, h: ih } = naturalSize.current;
    if (cw === 0 || ch === 0 || iw === 0 || ih === 0) return { bw: 0, bh: 0 };

    const containerRatio = cw / ch;
    const imageRatio = iw / ih;

    if (imageRatio > containerRatio) {
      // imagem mais "larga" que o container → largura = containerWidth
      const bw = cw;
      const bh = cw / imageRatio;
      return { bw, bh };
    } else {
      // imagem mais "alta" → altura = containerHeight
      const bh = ch;
      const bw = ch * imageRatio;
      return { bw, bh };
    }
  }, []);

  // Limites de pan dados scale + tamanhos
  const getPanBounds = useCallback((s) => {
    const { bw, bh } = getBaseFittedSize();
    if (bw === 0 || bh === 0) return { maxX: 0, maxY: 0 };
    const scaledW = bw * s;
    const scaledH = bh * s;
    // Excesso além do base (quanto "sobra" para mover em cada direção)
    const maxX = Math.max(0, (scaledW - bw) / 2);
    const maxY = Math.max(0, (scaledH - bh) / 2);
    return { maxX, maxY };
  }, [getBaseFittedSize]);

  const clampPan = useCallback((nx, ny, s) => {
    const { maxX, maxY } = getPanBounds(s);
    return {
      cx: clamp(nx, -maxX, maxX),
      cy: clamp(ny, -maxY, maxY),
    };
  }, [getPanBounds]);

  const resetZoom = useCallback((animated = true) => {
    const to = { s: 1, nx: 0, ny: 0 };
    if (animated) {
      animate(scale, to.s, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
      animate(x, to.nx, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
      animate(y, to.ny, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    } else {
      scale.set(to.s);
      x.set(to.nx);
      y.set(to.ny);
    }
  }, [scale, x, y]);

  // Atualiza previousImage e reseta zoom de forma segura ao trocar de foto
  useEffect(() => {
    setPreviousImage((prev) => (prev !== imageUrl ? prev : prev)); // no-op para preservação
    // reset imediato (sem "foto torta")
    dragX.set(0);
    resetZoom(false);
    setImgLoaded(loadedImages.current.has(imageUrl));
  }, [imageUrl, resetZoom, dragX]);

  // Preload e previous real
  useEffect(() => {
    // armazena a anterior de fato
    setPreviousImage((prev) => (prev === imageUrl ? prev : prev ?? null));
  }, [imageUrl]);

  // quando a imagem carrega, capture naturalWidth/Height para limites reais
  const handleImageLoad = useCallback((e) => {
    const el = e.currentTarget;
    naturalSize.current = {
      w: el.naturalWidth || 0,
      h: el.naturalHeight || 0,
    };
    loadedImages.current.add(imageUrl);
    setImgLoaded(true);
    // após medir, garanta bounds
    const s = scale.get();
    const { cx, cy } = clampPan(x.get(), y.get(), s);
    x.set(cx);
    y.set(cy);
  }, [imageUrl, scale, x, y, clampPan]);

  // Helpers pinch
  const getTouchDistance = (touches) => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getPinchCenter = (touches) => {
    const cx = (touches[0].clientX + touches[1].clientX) / 2;
    const cy = (touches[0].clientY + touches[1].clientY) / 2;
    return { x: cx, y: cy };
  };

  // Zoom com ponto focal (cursor/dedos)
  const zoomAt = useCallback((clientX, clientY, nextScale) => {
    const s = scale.get();
    nextScale = clamp(nextScale, MIN_SCALE, MAX_SCALE);

    // centro do container
    const { w: cw, h: ch } = containerSize.current;
    const centerX = cw / 2;
    const centerY = ch / 2;

    // ponto no espaço da imagem (considerando pan atual)
    const dx = clientX - centerX - x.get();
    const dy = clientY - centerY - y.get();

    // ajuste para manter o ponto sob o cursor/dedos estável
    const ratio = nextScale / (s || 1);
    let nx = x.get() - dx * (ratio - 1);
    let ny = y.get() - dy * (ratio - 1);

    // clamp pan aos limites do novo scale
    const { cx, cy } = clampPan(nx, ny, nextScale);

    scale.set(nextScale);
    x.set(cx);
    y.set(cy);
  }, [scale, x, y, clampPan]);

  // Wheel desktop
  const handleWheel = useCallback((e) => {
    if (!imgLoaded) return;
    e.preventDefault();
    const delta = -e.deltaY;
    const next = scale.get() + delta * 0.001;
    const target = clamp(next, MIN_SCALE, MAX_SCALE);
    zoomAt(e.clientX, e.clientY, target);
  }, [imgLoaded, scale, zoomAt]);

  // Pointer pan
  const handlePointerDown = useCallback((e) => {
    if (scale.get() <= 1) return;
    isPanning.current = true;
    pointerStart.current = { x: e.clientX, y: e.clientY };
    posStart.current = { x: x.get(), y: y.get() };
  }, [x, y, scale]);

  const handlePointerMove = useCallback((e) => {
    if (!isPanning.current || scale.get() <= 1) return;
    const dxVal = e.clientX - pointerStart.current.x;
    const dyVal = e.clientY - pointerStart.current.y;
    const s = scale.get();
    const { cx, cy } = clampPan(posStart.current.x + dxVal, posStart.current.y + dyVal, s);
    x.set(cx);
    y.set(cy);
  }, [x, y, scale, clampPan]);

  const handlePointerUp = useCallback(() => {
    isPanning.current = false;
  }, []);

  // Pinch zoom (mobile) com ponto focal
  const handleTouchStartZoom = useCallback((e) => {
    if (e.touches.length === 2) {
      lastTouchDistance.current = getTouchDistance(e.touches);
      pinchCenter.current = getPinchCenter(e.touches);
    }
  }, []);

  const handleTouchMoveZoom = useCallback((e) => {
    if (e.touches.length === 2 && lastTouchDistance.current) {
      const newDistance = getTouchDistance(e.touches);
      const delta = newDistance - lastTouchDistance.current;
      const proposed = scale.get() + delta * 0.005;
      const { x: cx, y: cy } = getPinchCenter(e.touches);
      pinchCenter.current = { x: cx, y: cy };
      zoomAt(cx, cy, proposed);
      lastTouchDistance.current = newDistance;
    }
  }, [scale, zoomAt]);

  const handleTouchEndZoom = useCallback(() => {
    lastTouchDistance.current = null;
  }, []);

  // Swipe navigation (apenas quando scale === 1)
  const handleTouchStart = useCallback((e) => {
    if (scale.get() > 1) return;
    const touch = e.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY };
    swipeActive.current = true;
  }, [scale]);

  const handleTouchMove = useCallback((e) => {
    if (!swipeActive.current || scale.get() > 1) return;
    const touch = e.touches[0];
    const dxVal = touch.clientX - swipeStart.current.x;
    const dyVal = touch.clientY - swipeStart.current.y;
    if (Math.abs(dyVal) > Math.abs(dxVal)) {
      swipeActive.current = false;
      return;
    }
    dragX.set(dxVal);
  }, [dragX, scale]);

  const handleTouchEnd = useCallback(() => {
    if (!swipeActive.current || scale.get() > 1) return;
    const dxVal = dragX.get();
    if (dxVal < -MIN_SWIPE_DISTANCE) {
      setDirection(1);
      onNext?.();
    } else if (dxVal > MIN_SWIPE_DISTANCE) {
      setDirection(-1);
      onPrev?.();
    }
    animate(dragX, 0, { type: 'tween', ease: EASING_CURVE, duration: 0.25 });
    swipeActive.current = false;
  }, [dragX, scale, onNext, onPrev]);

  // Double click/tap
  const handleDoubleClick = useCallback((e) => {
    if (scale.get() > 1) {
      resetZoom();
    } else {
      const { clientX, clientY } = e;
      zoomAt(clientX, clientY, 2);
    }
  }, [scale, resetZoom, zoomAt]);

  // Keyboard
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

  // Header
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
            ref={containerRef}
            position="absolute"
            inset={0}
            style={{ touchAction: 'none', overflow: 'hidden', backgroundColor: 'black' }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onTouchStart={(e) => { handleTouchStart(e); handleTouchStartZoom(e); }}
            onTouchMove={(e) => { handleTouchMove(e); handleTouchMoveZoom(e); }}
            onTouchEnd={(e) => { handleTouchEnd(e); handleTouchEndZoom(e); }}
            onDoubleClick={handleDoubleClick}
          >
            <Box position="absolute" w="100%" h="100%" overflow="hidden" willChange="transform, opacity">
              <AnimatePresence>
                 {previousImage && previousImage !== imageUrl && (
                   <MotionDiv
                     key={`prev-${previousImage}`}
                     initial={{ opacity: 1 }}
                     animate={{ opacity: 0 }}
                     exit={{ opacity: 0 }}
                     transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                     style={{ position: 'absolute', inset: 0 }}
                   >
                    <Image
                      src={previousImage}
                      alt=""
                      draggable={false}
                      style={{ objectFit: 'contain', width: '100%', height: '100%', pointerEvents: 'none' }}
                    />
                  </MotionDiv>
                )}

                 <MotionDiv
                   key={`curr-${imageUrl}`}
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                   style={{
                     position: 'absolute',
                     inset: 0,
                     display: 'flex',
                     justifyContent: 'center',
                     alignItems: 'center',
                     x: scale.get() === 1 ? dragX : x,
                     y,
                     scale,
                     willChange: 'transform, opacity',
                   }}
                 >
                  {!imgLoaded && (
                    <Center position="absolute">
                      <Spinner size="lg" color="white" thickness="3px" emptyColor="gray.700" />
                    </Center>
                  )}

                  <Image
                    ref={imageElRef}
                    src={imageUrl}
                    alt={countryName ? `Photo from ${countryName}` : 'Photo'}
                    draggable={false}
                    onLoad={handleImageLoad}
                     style={{
                       maxWidth: '100%',
                       maxHeight: '100%',
                       objectFit: 'contain',
                       opacity: imgLoaded ? 1 : 0,
                       transition: 'opacity 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                       userSelect: 'none',
                       WebkitUserSelect: 'none',
                       pointerEvents: 'none',
                       backfaceVisibility: 'hidden',
                       transform: 'translateZ(0)',
                     }}
                  />
                </MotionDiv>
              </AnimatePresence>
            </Box>
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
                  setPreviousImage(imageUrl);
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
                  setPreviousImage(imageUrl);
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
