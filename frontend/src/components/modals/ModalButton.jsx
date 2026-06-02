import React from 'react';
import { Button } from '@chakra-ui/react';
import { useLandingTokens } from '../features/landing/landingUI';

/**
 * Modal Button — Refined Blue.
 * Single brand accent; neutral secondary; clean semantic success/danger.
 * No glass blur, no coloured glow.
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
  const t = useLandingTokens();

  const lift = { transform: 'translateY(-1px)', boxShadow: t.shadowMd };
  const settle = { transform: 'translateY(0)' };

  const VARIANTS = {
    primary: {
      bg: t.primary,
      color: 'white',
      _hover: { bg: t.primaryHover, ...lift },
      _active: settle,
    },
    secondary: {
      bg: 'transparent',
      color: t.text,
      border: '1px solid',
      borderColor: t.hairlineStrong,
      _hover: { borderColor: t.primary, color: t.primary, bg: t.primarySoftBg, transform: 'translateY(-1px)' },
      _active: settle,
    },
    outline: {
      bg: 'transparent',
      color: t.primary,
      border: '1px solid',
      borderColor: t.primarySoftBorder,
      _hover: { borderColor: t.primary, bg: t.primarySoftBg, transform: 'translateY(-1px)' },
      _active: settle,
    },
    success: {
      bg: '#10B981',
      color: 'white',
      _hover: { bg: '#059669', ...lift },
      _active: settle,
    },
    danger: {
      bg: '#EF4444',
      color: 'white',
      _hover: { bg: '#DC2626', ...lift },
      _active: settle,
    },
  };

  const SIZES = {
    sm: { h: '36px', px: '16px', fontSize: 'sm' },
    md: { h: '42px', px: '20px', fontSize: 'md' },
    lg: { h: '48px', px: '24px', fontSize: 'md' },
  };

  return (
    <Button
      {...(VARIANTS[variant] || VARIANTS.primary)}
      {...(SIZES[size] || SIZES.md)}
      isLoading={isLoading}
      disabled={disabled}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      onClick={onClick}
      borderRadius="12px"
      fontWeight="600"
      letterSpacing="0"
      transition="all 0.2s ease"
      _disabled={{ opacity: 0.55, cursor: 'not-allowed', transform: 'none', boxShadow: 'none' }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ModalButton;
