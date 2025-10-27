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
 * Modern Base Modal Component - Inspired by big tech design systems
 * Features smooth animations, elegant micro-interactions, and premium aesthetics
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

  // Enhanced theme-aware colors with modern gradients
  const bgGradient = useColorModeValue(
    variant === 'minimal'
      ? "linear(to-br, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.95))"
      : variant === 'premium'
        ? "linear(to-br, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98))"
        : "linear(to-br, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.98))",
    variant === 'minimal'
      ? "linear(to-br, rgba(26, 32, 44, 0.98), rgba(26, 32, 44, 0.95))"
      : variant === 'premium'
        ? "linear(to-br, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.98))"
        : "linear(to-br, rgba(30, 41, 59, 0.95), rgba(51, 65, 85, 0.98))"
  );

  const borderColor = useColorModeValue(
    variant === 'minimal'
      ? "rgba(226, 232, 240, 0.8)"
      : "rgba(148, 163, 184, 0.2)",
    variant === 'minimal'
      ? "rgba(71, 85, 105, 0.2)"
      : "rgba(148, 163, 184, 0.1)"
  );

  const shadowColor = useColorModeValue(
    "rgba(0, 0, 0, 0.08)",
    "rgba(0, 0, 0, 0.25)"
  );

  const shimmerGradient = useColorModeValue(
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
  );

  // Enhanced shadow system
  const shadowConfig = useColorModeValue(
    {
      sm: "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
    },
    {
      sm: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.4)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
      xl: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
      "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
    }
  );

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Support responsive sizes - size can be object or string
  // On mobile, always use "full" width
  const responsiveSize = typeof size === 'object'
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
        bg="blackAlpha.400"
        backdropFilter="blur(12px)"
        animation={`${overlayEnter} 0.2s ease-out`}
        transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        _hover={{
          bg: "blackAlpha.500"
        }}
      />

      <ModalContent
        bgGradient={bgGradient}
        backdropFilter="blur(24px)"
        border="1px solid"
        borderColor={borderColor}
        borderRadius={{ base: "xl", sm: variant === 'minimal' ? "xl" : "2xl" }}
        shadow={shadowConfig.xl}
        maxHeight={{ 
          base: "calc(100vh - 3rem)", // Full viewport height minus top and bottom margins on mobile
          sm: maxHeight 
        }}
        minHeight={{ base: "auto", sm: "auto" }}
        overflow="hidden"
        mx={{ base: 0, sm: 4 }}
        mt={{ base: 6, sm: "auto" }}
        mb={{ base: 6, sm: "auto" }}
        animation={`${modalEnter} 0.3s cubic-bezier(0.4, 0, 0.2, 1)`}
        transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
        position="relative"
        h={{ base: "auto", sm: "auto" }}
        _before={showShimmer ? {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: shimmerGradient,
          backgroundSize: "200% 100%",
          animation: `${shimmer} 2s infinite`,
          zIndex: 1
        } : {}}
        _hover={{
          transform: { base: "none", sm: "translateY(-4px) scale(1.01)" },
          shadow: { base: shadowConfig.xl, sm: shadowConfig["2xl"] },
          borderColor: useColorModeValue("rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.2)")
        }}
        _focus={{
          outline: "none",
          boxShadow: `0 0 0 3px ${useColorModeValue("rgba(59, 130, 246, 0.1)", "rgba(59, 130, 246, 0.2)")}`
        }}
      >
        {/* Modern Header */}
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
          bg={useColorModeValue("rgba(209, 212, 215, 0.8)", "rgba(30, 41, 59, 0.8)")}
          backdropFilter="blur(10px)"
          boxShadow={useColorModeValue("0 2px 8px rgba(0, 0, 0, 0.1)", "0 2px 8px rgba(0, 0, 0, 0.3)")}
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
              bg={useColorModeValue(
                variant === 'premium' ? "blue.50" : "gray.50",
                variant === 'premium' ? "blue.900" : "gray.700"
              )}
              color={useColorModeValue(
                variant === 'premium' ? "blue.600" : "gray.600",
                variant === 'premium' ? "blue.200" : "gray.300"
              )}
              transition="all 0.2s ease"
              _hover={{
                transform: "scale(1.05)",
                bg: useColorModeValue(
                  variant === 'premium' ? "blue.100" : "gray.100",
                  variant === 'premium' ? "blue.800" : "gray.600"
                )
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

        {/* Modern Close Button */}
        {showCloseButton && (
          <ModalCloseButton
            size="md"
            position="absolute"
            top={{ base: 4, sm: 4 }}
            right={{ base: 3, sm: 4 }}
            borderRadius="full"
            bg="transparent"
            color={useColorModeValue("gray.500", "gray.400")}
            transition="all 0.15s ease-in-out"
            zIndex={10}
            _hover={{
              color: useColorModeValue("gray.700", "gray.200"),
              transform: "scale(1.1)",
              bg: useColorModeValue("gray.100", "gray.700"),
            }}
            _active={{
              transform: "scale(0.95)",
              bg: useColorModeValue("gray.200", "gray.600"),
            }}
            _focus={{ boxShadow: "none" }}
          />
        )}

        {/* Modern Body */}
        <ModalBody
          px={{ base: 4, sm: 6 }}
          py={{ base: 4, sm: variant === 'minimal' ? 4 : 6 }}
          overflowY="auto"
          overflowX="hidden"
          position="relative"
          flex="1"
          bg={useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(26, 32, 44, 0.5)")}
          backdropFilter="blur(5px)"
          css={{
            'touch-action': 'pan-y',
            // Custom scrollbar
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: useColorModeValue('rgba(0,0,0,0.02)', 'rgba(255,255,255,0.02)'),
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)'),
              borderRadius: '4px',
              border: `2px solid ${useColorModeValue('transparent', 'transparent')}`,
              backgroundClip: 'content-box'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: useColorModeValue('rgba(0,0,0,0.2)', 'rgba(255,255,255,0.2)'),
            },
            '&::-webkit-scrollbar-thumb:active': {
              background: useColorModeValue('rgba(0,0,0,0.3)', 'rgba(255,255,255,0.3)'),
            }
          }}
          _after={isAnimating ? {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: useColorModeValue("linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent)", "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)"),
            animation: `${shimmer} 1.5s ease-out`
          } : {}}
        >
          {children}
        </ModalBody>

        {/* Modern Footer */}
        {footer && (
          <ModalFooter
            borderTop={variant === 'minimal' ? "none" : "1px solid"}
            borderColor={borderColor}
            pt={{ base: 3, sm: variant === 'minimal' ? 2 : 4 }}
            px={{ base: 4, sm: 6 }}
            pb={{ base: 4, sm: variant === 'minimal' ? 4 : 6 }}
            bg={useColorModeValue("rgba(248, 250, 252, 0.7)", "rgba(30, 41, 59, 0.6)")}
            backdropFilter="blur(8px)"
            position="relative"
            _before={variant === 'minimal' ? {} : {
              content: '""',
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: "40px",
              height: "1px",
              background: useColorModeValue("gray.200", "gray.600"),
              borderRadius: "full"
            }}
          >
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};

export default BaseModal;
