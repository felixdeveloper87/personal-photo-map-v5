import React from 'react';
import { Button, useColorModeValue } from '@chakra-ui/react';

/**
 * Professional Modal Button Component
 * Provides consistent button styling across all modals
 */
const ModalButton = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}) => {
  // Theme-aware colors
  const primaryBg = useColorModeValue("blue.500", "blue.400");
  const primaryHover = useColorModeValue("blue.600", "blue.500");
  const secondaryBg = useColorModeValue("gray.100", "gray.600");
  const secondaryHover = useColorModeValue("gray.200", "gray.500");
  const dangerBg = useColorModeValue("red.500", "red.400");
  const dangerHover = useColorModeValue("red.600", "red.500");
  const successBg = useColorModeValue("green.500", "green.400");
  const successHover = useColorModeValue("green.600", "green.500");

  const getButtonStyles = () => {
    switch (variant) {
      case "primary":
        return {
          bg: primaryBg,
          color: "white",
          _hover: {
            bg: primaryHover,
            transform: "translateY(-1px)",
            shadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
          },
          _active: {
            transform: "translateY(0px)"
          }
        };
      
      case "secondary":
        return {
          bg: secondaryBg,
          color: useColorModeValue("gray.700", "gray.200"),
          border: "1px solid",
          borderColor: useColorModeValue("gray.200", "gray.500"),
          _hover: {
            bg: secondaryHover,
            transform: "translateY(-1px)",
            shadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          },
          _active: {
            transform: "translateY(0px)"
          }
        };
      
      case "danger":
        return {
          bg: dangerBg,
          color: "white",
          _hover: {
            bg: dangerHover,
            transform: "translateY(-1px)",
            shadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
          },
          _active: {
            transform: "translateY(0px)"
          }
        };
      
      case "success":
        return {
          bg: successBg,
          color: "white",
          _hover: {
            bg: successHover,
            transform: "translateY(-1px)",
            shadow: "0 4px 12px rgba(34, 197, 94, 0.4)"
          },
          _active: {
            transform: "translateY(0px)"
          }
        };
      
      case "outline":
        return {
          bg: "transparent",
          color: useColorModeValue("blue.600", "blue.300"),
          border: "2px solid",
          borderColor: useColorModeValue("blue.500", "blue.400"),
          _hover: {
            bg: useColorModeValue("blue.50", "blue.900"),
            transform: "translateY(-1px)",
            shadow: "0 4px 12px rgba(59, 130, 246, 0.2)"
          },
          _active: {
            transform: "translateY(0px)"
          }
        };
      
      default:
        return {
          bg: primaryBg,
          color: "white",
          _hover: {
            bg: primaryHover,
            transform: "translateY(-1px)",
            shadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
          },
          _active: {
            transform: "translateY(0px)"
          }
        };
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case "sm":
        return { h: "32px", px: "16px", fontSize: "sm" };
      case "md":
        return { h: "40px", px: "20px", fontSize: "md" };
      case "lg":
        return { h: "48px", px: "24px", fontSize: "lg" };
      default:
        return { h: "40px", px: "20px", fontSize: "md" };
    }
  };

  return (
    <Button
      {...getButtonStyles()}
      {...getButtonSize()}
      isLoading={isLoading}
      disabled={disabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={onClick}
      borderRadius="lg"
      fontWeight="semibold"
      transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
      _disabled={{
        opacity: 0.6,
        cursor: "not-allowed",
        transform: "none",
        shadow: "none"
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ModalButton;
