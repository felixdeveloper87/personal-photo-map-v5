import {
  Box,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { color, radius, resolveTone, type } from '../../design/tokens';

// Chakra modal widths, applied by hand so the mobile sheet can be full-width.
const SIZE_MAX_W = {
  xs: '20rem', sm: '24rem', md: '28rem', lg: '32rem', xl: '36rem', '2xl': '42rem',
  '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem', full: '100vw',
};
const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];

/** `size` ("lg" or { base, sm, md… }) → responsive maxW; mobile is always full-width. */
const toMaxW = (size) => {
  const maxW = { base: '100%' };
  if (typeof size === 'string') {
    maxW.sm = SIZE_MAX_W[size] || SIZE_MAX_W.lg;
    return maxW;
  }
  let last = SIZE_MAX_W[size?.sm] || SIZE_MAX_W[size?.base === 'full' ? 'lg' : size?.base] || SIZE_MAX_W.lg;
  BREAKPOINTS.forEach((bp) => {
    if (size?.[bp]) last = SIZE_MAX_W[size[bp]] || last;
    maxW[bp] = last;
  });
  return maxW;
};

/**
 * BaseModal — the Atlas modal shell. Every modal in the app should use it.
 *
 * Anatomy:  [tone hairline] · header (icon tile, eyebrow, serif title, subtitle, close)
 *           · scrollable body · optional sticky footer (actions).
 * Desktop: centred dialog. Mobile: bottom sheet (full width, grab handle, safe-area aware).
 *
 * Footer convention: put actions in <ModalActions> — secondary first, primary last.
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  icon,
  eyebrow,
  subtitle,
  tone = 'brand',
  children,
  footer,
  size = 'lg',
  maxHeight = '85vh',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  isCentered = true,
  initialFocusRef,
  finalFocusRef,
  motionPreset,
  bodyProps,
  contentProps,
  // Legacy props, accepted and ignored for API compatibility.
  // eslint-disable-next-line no-unused-vars
  variant,
  // eslint-disable-next-line no-unused-vars
  showShimmer,
}) => {
  const tn = resolveTone(tone);
  const isSheet = useBreakpointValue({ base: true, sm: false }, { ssr: false });
  const preset = motionPreset || (isSheet ? 'slideInBottom' : 'scale');
  const hasHeader = Boolean(title || eyebrow || icon);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered={isCentered}
      motionPreset={preset}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      initialFocusRef={initialFocusRef}
      finalFocusRef={finalFocusRef}
      scrollBehavior="inside"
    >
      <ModalOverlay />

      <ModalContent
        containerProps={{ alignItems: { base: 'flex-end', sm: 'center' } }}
        w="100%"
        maxW={toMaxW(size)}
        maxH={{ base: 'calc(100dvh - 2.5rem)', sm: maxHeight }}
        my={{ base: 0, sm: 'auto' }}
        mx={{ base: 0, sm: 4 }}
        borderRadius={{ base: `${radius.xl} ${radius.xl} 0 0`, sm: radius.xl }}
        borderBottomWidth={{ base: 0, sm: '1px' }}
        display="flex"
        flexDirection="column"
        overflow="hidden"
        position="relative"
        _focus={{ outline: 'none' }}
        {...contentProps}
      >
        {/* Signature tone hairline */}
        <Box
          aria-hidden
          position="absolute"
          top={0}
          left="12%"
          right="12%"
          h="1px"
          bgGradient={`linear(to-r, transparent, ${tn.fg}, transparent)`}
          opacity={0.7}
          pointerEvents="none"
        />

        {/* Mobile grab handle */}
        <Box
          aria-hidden
          display={{ base: 'block', sm: 'none' }}
          w="36px"
          h="4px"
          borderRadius="full"
          bg={color.hairlineMid}
          mx="auto"
          mt={2.5}
          flexShrink={0}
        />

        {hasHeader && (
          <ModalHeader
            px={{ base: 5, sm: 6 }}
            pt={{ base: 3.5, sm: 6 }}
            pb={{ base: 4, sm: 5 }}
            pr={showCloseButton ? { base: 14, sm: 16 } : undefined}
            borderBottom="1px solid"
            borderColor={color.hairline}
            flexShrink={0}
          >
            <HStack spacing={{ base: 3, sm: 3.5 }} align="center">
              {icon && (
                <Box
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  w={{ base: '40px', sm: '44px' }}
                  h={{ base: '40px', sm: '44px' }}
                  borderRadius={radius.md}
                  bg={tn.soft}
                  border="1px solid"
                  borderColor={tn.border}
                  color={tn.fg}
                  flexShrink={0}
                >
                  <Icon as={icon} boxSize={{ base: 4, sm: '18px' }} />
                </Box>
              )}
              <VStack align="start" spacing={1} minW={0}>
                {eyebrow && (
                  <Text {...type.eyebrow} color={tn.fg}>
                    {eyebrow}
                  </Text>
                )}
                {title && (
                  <Text as="h2" {...type.display} color={color.text} noOfLines={2}>
                    {title}
                  </Text>
                )}
              </VStack>
            </HStack>
            {subtitle && (
              <Text {...type.body} color={color.textSoft} mt={3}>
                {subtitle}
              </Text>
            )}
          </ModalHeader>
        )}

        {showCloseButton && (
          <ModalCloseButton
            top={{ base: hasHeader ? 5 : 3, sm: 5 }}
            right={{ base: 4, sm: 5 }}
            w="36px"
            h="36px"
            border="1px solid"
            borderColor={color.hairline}
            _focusVisible={{ boxShadow: `0 0 0 3px ${color.focusRing}` }}
          />
        )}

        <ModalBody
          px={{ base: 5, sm: 6 }}
          pt={{ base: 5, sm: 6 }}
          pb={footer ? { base: 5, sm: 6 } : { base: 'calc(20px + env(safe-area-inset-bottom))', sm: 6 }}
          flex="1"
          minH={0}
          overflowY="auto"
          overflowX="hidden"
          sx={{
            overscrollBehavior: 'contain',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': { background: color.hairlineMid, borderRadius: '4px' },
          }}
          {...bodyProps}
        >
          {children}
        </ModalBody>

        {footer && (
          <ModalFooter
            px={{ base: 5, sm: 6 }}
            pt={4}
            pb={{ base: 'calc(16px + env(safe-area-inset-bottom))', sm: 5 }}
            bg="rgba(8,10,15,0.35)"
            flexShrink={0}
            display="block"
          >
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
