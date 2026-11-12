import { forwardRef } from 'react';
import { Button } from '@chakra-ui/react';
import { brandGradient, brandGradientHover, color, palette, radius, shadow, tones } from '../../design/tokens';

const lift = { transform: 'translateY(-1px)' };
const settle = { transform: 'translateY(0)' };

/**
 * Atlas button variants.
 *  primary   — the one main action of a view (amber fill, dark ink)
 *  secondary — neutral alternative (cancel, close, back)
 *  ghost     — low-emphasis inline action (links, "forgot password")
 *  outline   — brand-tinted alternative (social login, secondary CTAs)
 *  danger    — destructive confirmation (delete, deactivate)
 *  success   — positive confirmation (rare; prefer primary)
 */
const VARIANTS = {
  primary: {
    color: color.textOnBrand,
    bgGradient: brandGradient,
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.4), ${shadow.brandGlow}`,
    _hover: { bgGradient: brandGradientHover, ...lift, _disabled: { bgGradient: brandGradient } },
    _active: settle,
  },
  secondary: {
    bg: 'rgba(236,231,220,0.04)',
    color: color.text,
    border: '1px solid',
    borderColor: color.hairlineMid,
    _hover: { borderColor: 'rgba(236,231,220,0.28)', bg: 'rgba(236,231,220,0.07)' },
    _active: { bg: 'rgba(236,231,220,0.1)' },
  },
  ghost: {
    bg: 'transparent',
    color: color.textSoft,
    _hover: { bg: color.surfaceHover, color: color.text },
    _active: { bg: 'rgba(236,231,220,0.08)' },
  },
  outline: {
    bg: 'transparent',
    color: color.primary,
    border: '1px solid',
    borderColor: color.primarySoftBorder,
    _hover: { borderColor: color.primary, bg: color.primarySoftBg },
    _active: settle,
  },
  danger: {
    bg: tones.danger.fg,
    color: '#1F0E0B',
    boxShadow: '0 14px 36px -14px rgba(229,138,123,0.55)',
    _hover: { bg: palette.rose[400], ...lift },
    _active: settle,
  },
  success: {
    bg: tones.success.fg,
    color: '#0A1F1C',
    _hover: { bg: palette.teal[400], ...lift },
    _active: settle,
  },
};

const SIZES = {
  sm: { h: '36px', px: '14px', fontSize: 'sm' },
  md: { h: '44px', px: '20px', fontSize: 'sm' },
  lg: { h: '52px', px: '24px', fontSize: 'md' },
};

const ModalButton = forwardRef(function ModalButton(
  { children, variant = 'primary', size = 'md', isLoading = false, disabled, isDisabled, ...props },
  ref
) {
  return (
    <Button
      ref={ref}
      {...(VARIANTS[variant] || VARIANTS.primary)}
      {...(SIZES[size] || SIZES.md)}
      isLoading={isLoading}
      isDisabled={isDisabled ?? disabled}
      borderRadius={radius.md}
      fontWeight="600"
      letterSpacing="0"
      transition="all .2s ease"
      _focusVisible={{ boxShadow: `0 0 0 3px ${color.focusRing}` }}
      _disabled={{ opacity: 0.5, cursor: 'not-allowed', transform: 'none', boxShadow: 'none' }}
      {...props}
    >
      {children}
    </Button>
  );
});

export default ModalButton;
