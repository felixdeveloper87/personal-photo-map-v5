import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Icon,
  Text,
} from '@chakra-ui/react';
import { useLandingTokens } from '../features/landing/landingUI';

/**
 * Base Modal — Refined Blue.
 * Neutral surface, hairline borders, single accent on the header icon, calm motion.
 * No texture, no shimmer, no hover-lift.
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = 'lg',
  maxHeight = '80vh',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  isCentered = true,
  motionPreset = 'scale',
  variant = 'default', // kept for API compatibility
  // eslint-disable-next-line no-unused-vars
  showShimmer = false,
}) => {
  const t = useLandingTokens();

  const responsiveSize =
    typeof size === 'object' ? size : { base: 'full', sm: size, md: size, lg: size };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={responsiveSize}
      isCentered={{ base: false, sm: isCentered }}
      motionPreset={motionPreset}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
    >
      <ModalOverlay bg="rgba(2, 6, 23, 0.55)" backdropFilter="blur(6px)" />

      <ModalContent
        bg={t.surface}
        border="1px solid"
        borderColor={t.hairline}
        borderRadius={{ base: 'xl', sm: '20px' }}
        maxHeight={{ base: 'calc(100vh - 3rem)', sm: maxHeight }}
        overflow="hidden"
        mx={{ base: 0, sm: 4 }}
        mt={{ base: 6, sm: 'auto' }}
        mb={{ base: 6, sm: 'auto' }}
        boxShadow={t.shadowLg}
        _focus={{ outline: 'none' }}
      >
        {/* Header */}
        <ModalHeader
          display="flex"
          alignItems="center"
          gap={{ base: 3, sm: 3.5 }}
          fontSize={{ base: 'lg', sm: 'xl' }}
          fontWeight="800"
          letterSpacing="-0.01em"
          color={t.text}
          bg={t.surface}
          borderBottom="1px solid"
          borderColor={t.hairline}
          px={{ base: 5, sm: 6 }}
          pt={{ base: 4, sm: 5 }}
          pb={{ base: 4, sm: 5 }}
        >
          {icon && (
            <Box display="inline-flex" p={2} borderRadius="10px" bg={t.primarySoftBg} color={t.primary}>
              <Icon as={icon} boxSize={{ base: 4, sm: 5 }} />
            </Box>
          )}
          <Text fontSize="inherit" fontWeight="inherit" letterSpacing="-0.01em" lineHeight="shorter">
            {title}
          </Text>
        </ModalHeader>

        {/* Close */}
        {showCloseButton && (
          <ModalCloseButton
            top={{ base: 4, sm: 4 }}
            right={{ base: 4, sm: 4 }}
            borderRadius="10px"
            color={t.textMuted}
            transition="all 0.15s ease"
            _hover={{ bg: t.surfaceSubtle, color: t.text }}
            _active={{ bg: t.hairline }}
            _focus={{ boxShadow: 'none' }}
          />
        )}

        {/* Body */}
        <ModalBody
          px={{ base: 5, sm: 6 }}
          py={{ base: 5, sm: 6 }}
          overflowY="auto"
          overflowX="hidden"
          flex="1"
          bg={t.surface}
          css={{
            'touch-action': 'pan-y',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { background: 'transparent' },
            '&::-webkit-scrollbar-thumb': {
              background: t.hairlineStrong,
              borderRadius: '4px',
            },
          }}
        >
          {children}
        </ModalBody>

        {/* Footer */}
        {footer && (
          <ModalFooter
            borderTop="1px solid"
            borderColor={t.hairline}
            bg={t.surfaceSubtle}
            px={{ base: 5, sm: 6 }}
            pt={{ base: 4, sm: 4 }}
            pb={{ base: 4, sm: 5 }}
          >
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
