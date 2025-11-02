import React from 'react';
import { Button, useColorModeValue } from '@chakra-ui/react';

/**
 * Premium Glassmorphic Modal Button
 * Harmonized with all modal components (Login, Register, Profile, etc.)
 */
const ModalButton = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}) => {
  const textLight = useColorModeValue('gray.800', 'white');
  const textSubtle = useColorModeValue('gray.700', 'gray.300');

  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: useColorModeValue('rgba(59,130,246,0.85)', 'rgba(37,99,235,0.75)'),
          color: 'white',
          backdropFilter: 'blur(6px)',
          _hover: {
            bg: useColorModeValue('rgba(37,99,235,0.95)', 'rgba(59,130,246,0.9)'),
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        };

      case 'secondary':
        return {
          bg: useColorModeValue('rgba(255,255,255,0.6)', 'rgba(255,255,255,0.08)'),
          color: textSubtle,
          border: '1px solid',
          borderColor: useColorModeValue('rgba(0,0,0,0.08)', 'rgba(255,255,255,0.12)'),
          backdropFilter: 'blur(6px)',
          _hover: {
            bg: useColorModeValue('rgba(245,245,245,0.8)', 'rgba(255,255,255,0.12)'),
            transform: 'translateY(-2px)',
            boxShadow: useColorModeValue('0 4px 12px rgba(0,0,0,0.08)', '0 4px 12px rgba(255,255,255,0.06)'),
          },
          _active: {
            transform: 'translateY(0)',
          },
        };

      case 'success':
        return {
          bg: useColorModeValue('rgba(34,197,94,0.85)', 'rgba(22,163,74,0.75)'),
          color: 'white',
          backdropFilter: 'blur(6px)',
          _hover: {
            bg: useColorModeValue('rgba(22,163,74,0.95)', 'rgba(34,197,94,0.9)'),
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 14px rgba(34,197,94,0.4)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        };

      case 'danger':
        return {
          bg: useColorModeValue('rgba(239,68,68,0.85)', 'rgba(220,38,38,0.75)'),
          color: 'white',
          backdropFilter: 'blur(6px)',
          _hover: {
            bg: useColorModeValue('rgba(220,38,38,0.95)', 'rgba(239,68,68,0.9)'),
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        };

      case 'outline':
        return {
          bg: 'transparent',
          color: useColorModeValue('blue.600', 'blue.300'),
          border: '1.5px solid',
          borderColor: useColorModeValue('rgba(37,99,235,0.4)', 'rgba(147,197,253,0.5)'),
          backdropFilter: 'blur(6px)',
          _hover: {
            bg: useColorModeValue('rgba(219,234,254,0.5)', 'rgba(30,58,138,0.35)'),
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 14px rgba(59,130,246,0.3)',
          },
          _active: {
            transform: 'translateY(0)',
          },
        };

      default:
        return {
          bg: useColorModeValue('rgba(59,130,246,0.85)', 'rgba(37,99,235,0.75)'),
          color: 'white',
          backdropFilter: 'blur(6px)',
          _hover: {
            bg: useColorModeValue('rgba(37,99,235,0.95)', 'rgba(59,130,246,0.9)'),
            transform: 'translateY(-2px)',
          },
        };
    }
  };

  const getButtonSize = () => {
    switch (size) {
      case 'sm':
        return { h: '32px', px: '16px', fontSize: 'sm' };
      case 'md':
        return { h: '40px', px: '20px', fontSize: 'md' };
      case 'lg':
        return { h: '48px', px: '24px', fontSize: 'lg' };
      default:
        return { h: '40px', px: '20px', fontSize: 'md' };
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
      borderRadius="xl"
      fontWeight="semibold"
      transition="all 0.25s ease-in-out"
      _disabled={{
        opacity: 0.6,
        cursor: 'not-allowed',
        transform: 'none',
        boxShadow: 'none',
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ModalButton;
