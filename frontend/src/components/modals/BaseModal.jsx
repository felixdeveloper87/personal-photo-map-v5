import React, { useEffect, useState } from 'react';
import { keyframes } from '@emotion/react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  useColorModeValue,
  Icon,
  Text
} from '@chakra-ui/react';

// Modern keyframe animations inspired by big tech design systems
const modalEnter = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const overlayEnter = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

/**
 * Modern Base Modal Component
 * Texture only in Header, solid background in body/footer
 */
const BaseModal = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  size = "lg",
  maxHeight = "80vh",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  isCentered = true,
  motionPreset = "scale",
  variant = "default", // default, minimal, premium
  showShimmer = false
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  // Theme-aware colors
  const bgColor = useColorModeValue(
    variant === 'minimal' ? "gray.50" : "white",
    variant === 'minimal' ? "gray.800" : "black"
  );

  const borderColor = useColorModeValue(
    variant === 'minimal'
      ? "rgba(226, 232, 240, 0.8)"
      : "rgba(148, 163, 184, 0.2)",
    variant === 'minimal'
      ? "rgba(71, 85, 105, 0.2)"
      : "rgba(148, 163, 184, 0.1)"
  );

  const shimmerGradient = useColorModeValue(
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
  );

  // Precompute values used in conditional styles to keep hook order stable
  const shimmerBarBg = useColorModeValue(
    "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)",
    "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)"
  );
  // Header icon styles
  const headerIconBg = useColorModeValue(
    variant === 'premium' ? "blue.50" : "gray.50",
    variant === 'premium' ? "blue.900" : "gray.700"
  );
  const headerIconColor = useColorModeValue(
    variant === 'premium' ? "blue.600" : "gray.600",
    variant === 'premium' ? "blue.200" : "gray.300"
  );
  const headerIconHoverBg = useColorModeValue(
    variant === 'premium' ? "blue.100" : "gray.100",
    variant === 'premium' ? "blue.800" : "gray.600"
  );
  // Close button colors
  const closeBtnColor = useColorModeValue("gray.500", "gray.400");
  const closeBtnHoverColor = useColorModeValue("gray.700", "gray.200");
  const closeBtnHoverBg = useColorModeValue("gray.100", "gray.700");
  const closeBtnActiveBg = useColorModeValue("gray.200", "gray.600");
  // Body and footer backgrounds
  const bodyBg = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(0, 0, 0, 0.5)");
  const footerBg = useColorModeValue("rgba(248, 250, 252, 0.7)", "rgba(0, 0, 0, 0.6)");
  // Scrollbar colors
  const scrollTrackBg = useColorModeValue('rgba(0,0,0,0.02)', 'rgba(255,255,255,0.02)');
  const scrollThumbBg = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)');
  const scrollThumbHoverBg = useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)');
  const scrollThumbActiveBg = useColorModeValue('rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)');
  const transparentBorder = useColorModeValue('transparent', 'transparent');

  // ✅ Texture pattern for header only
  const texturePatternLight =
    'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="6" height="6" fill="white"/%3E%3Cpath d="M0 3L3 0M3 6L6 3M0 3L3 6" stroke="%23000" stroke-width="1" opacity="0.55"/%3E%3C/svg%3E';
  const texturePatternDark =
    'data:image/svg+xml,%3Csvg width="6" height="6" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="6" height="6" fill="black"/%3E%3Cpath d="M0 3L3 0M3 6L6 3M0 3L3 6" stroke="%23fff" stroke-width="0.8" opacity="0.35"/%3E%3C/svg%3E';
  const texturePattern = useColorModeValue(texturePatternLight, texturePatternDark);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const responsiveSize =
    typeof size === 'object'
      ? size
      : { base: "full", sm: size, md: size, lg: size };

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
      <ModalOverlay
        bg="blackAlpha.300"
        backdropFilter="blur(12px)"
        animation={`${overlayEnter} 0.2s ease-out`}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{ bg: "blackAlpha.500" }}
      />

      <ModalContent
        bg={bgColor}
        backdropFilter="blur(24px)"
        border="2px solid"
        borderColor={borderColor}
        borderRadius={{ base: "xl", sm: variant === 'minimal' ? "xl" : "2xl" }}
        maxHeight={{ base: "calc(100vh - 3rem)", sm: maxHeight }}
        overflow="hidden"
        mx={{ base: 0, sm: 4 }}
        mt={{ base: 6, sm: "auto" }}
        mb={{ base: 6, sm: "auto" }}
        animation={`${modalEnter} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`}
        position="relative"
        boxShadow={useColorModeValue(
          variant === 'premium'
            ? "0 10px 35px rgba(0, 0, 0, 0.15)"   // Light mode premium
            : variant === 'minimal'
              ? "0 6px 20px rgba(0, 0, 0, 0.06)"   // Light mode minimal
              : "0 8px 30px rgba(0, 0, 0, 0.1)",   // Light mode default
          variant === 'premium'
            ? "0 10px 45px rgba(0, 0, 0, 0.75)"  // Dark mode premium
            : variant === 'minimal'
              ? "0 6px 25px rgba(0, 0, 0, 0.5)"    // Dark mode minimal
              : "0 8px 40px rgba(0, 0, 0, 0.6)"    // Dark mode default
        )}
        _hover={{
          transform: { base: "none", sm: "translateY(-4px) scale(1.01)" },
          borderColor: useColorModeValue("rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.2)")
        }}
        _focus={{ outline: "none" }}
      >
        {/* ✅ Header with texture */}
        <ModalHeader
          display="flex"
          alignItems="center"
          gap={{ base: 3, sm: 4 }}
          fontSize={{ base: "lg", sm: variant === 'minimal' ? "xl" : "2xl" }}
          fontWeight={variant === 'minimal' ? "semibold" : "bold"}
          color={useColorModeValue("gray.900", "gray.50")}
          borderBottom="1px solid"
          borderColor={borderColor}
          pb={{ base: 3, sm: variant === 'minimal' ? 2 : 4 }}
          pt={{ base: 4, sm: variant === 'minimal' ? 4 : 6 }}
          px={{ base: 4, sm: 6 }}
          position="relative"
          bg={useColorModeValue("rgba(255,255,255,0.8)", "rgba(0,0,0,0.8)")}
          backgroundImage={texturePattern}
          backgroundRepeat="repeat"
          backgroundSize="6px 6px"
          backgroundBlendMode="overlay"
          backdropFilter="blur(10px)"
          _after={variant === 'minimal' ? {} : {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "60px",
            height: "2px",
            background: useColorModeValue("blue.500", "blue.400"),
            borderRadius: "full"
          }}
        >
          {icon && (
            <Box
              p={{ base: 1.5, sm: variant === 'minimal' ? 1.5 : 2 }}
              borderRadius={variant === 'minimal' ? "md" : "lg"}
              bg={headerIconBg}
              color={headerIconColor}
              transition="all 0.2s ease"
              _hover={{
                transform: "scale(1.05)",
                bg: headerIconHoverBg
              }}
            >
              <Icon as={icon} boxSize={{ base: 4, sm: variant === 'minimal' ? 5 : 6 }} />
            </Box>
          )}
          <Text
            fontSize="inherit"
            fontWeight="inherit"
            letterSpacing={variant === 'minimal' ? "-0.025em" : "-0.05em"}
            lineHeight="shorter"
          >
            {title}
          </Text>
        </ModalHeader>

        {/* Close Button */}
        {showCloseButton && (
          <ModalCloseButton
            size="md"
            position="absolute"
            top={{ base: 4, sm: 4 }}
            right={{ base: 3, sm: 4 }}
            borderRadius="full"
            bg="transparent"
            color={closeBtnColor}
            transition="all 0.15s ease-in-out"
            zIndex={10}
            _hover={{
              color: closeBtnHoverColor,
              transform: "scale(1.1)",
              bg: closeBtnHoverBg,
            }}
            _active={{
              transform: "scale(0.95)",
              bg: closeBtnActiveBg,
            }}
            _focus={{ boxShadow: "none" }}
          />
        )}

        {/* Body */}
        <ModalBody
          px={{ base: 4, sm: 6 }}
          py={{ base: 4, sm: variant === 'minimal' ? 4 : 6 }}
          overflowY="auto"
          overflowX="hidden"
          position="relative"
          flex="1"
          bg={bodyBg}
          backdropFilter="blur(5px)"
          css={{
            'touch-action': 'pan-y',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: scrollTrackBg,
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: scrollThumbBg,
              borderRadius: '4px',
              border: `2px solid ${transparentBorder}`,
              backgroundClip: 'content-box'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: scrollThumbHoverBg,
            },
            '&::-webkit-scrollbar-thumb:active': {
              background: scrollThumbActiveBg,
            }
          }}
          _after={isAnimating ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: shimmerBarBg,
            animation: `${shimmer} 1.5s ease-out`
          } : {}}
        >
          {children}
        </ModalBody>

        {/* Footer */}
        {footer && (
          <ModalFooter
            borderTop={variant === 'minimal' ? "none" : "1px solid"}
            borderColor={borderColor}
            pt={{ base: 3, sm: variant === 'minimal' ? 2 : 4 }}
            px={{ base: 4, sm: 6 }}
            pb={{ base: 4, sm: variant === 'minimal' ? 4 : 6 }}
            bg={footerBg}
            backdropFilter="blur(8px)"
          >
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
