import {
  Box,
  VStack,
  Icon,
  Text,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Tooltip,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion(Box);

export default function InfoBox({
  icon,
  label,
  value,
  colorScheme = 'blue',
  onClick,
  size = 'default',
  isLoading = false,
  tooltip = null,
  variant = 'elevated', // novo padrão
  sx = {},
}) {
  // === Material Color Palettes (desaturadas, soft) ===
  const tone = useColorModeValue('light', 'dark');
  const colorSchemes = {
    blue: tone === 'light'
      ? { icon: '#1a73e8', bg: '#e8f0fe', border: '#c6dafc' }
      : { icon: '#8ab4f8', bg: '#1e3a8a', border: '#3b82f6' },
    green: tone === 'light'
      ? { icon: '#188038', bg: '#e6f4ea', border: '#b7dfb9' }
      : { icon: '#81c995', bg: '#1f3d28', border: '#34a853' },
    orange: tone === 'light'
      ? { icon: '#f29900', bg: '#fef7e0', border: '#f3dea0' }
      : { icon: '#f9ab00', bg: '#3d2e00', border: '#f9ab00' },
    red: tone === 'light'
      ? { icon: '#d93025', bg: '#fce8e6', border: '#f5b9b2' }
      : { icon: '#f28b82', bg: '#3b0d0c', border: '#ea4335' },
  };

  const currentColors = colorSchemes[colorScheme] || colorSchemes.blue;

  // === Sizes ===
  const isMobile = useBreakpointValue({ base: true, sm: false });
  const sizes = {
    default: {
      p: isMobile ? 3 : 4,
      borderRadius: '16px',
      iconSize: isMobile ? 6 : 8,
      labelFontSize: isMobile ? 'xs' : 'sm',
      valueFontSize: isMobile ? 'sm' : 'md',
    },
    compact: {
      p: isMobile ? 2 : 3,
      borderRadius: '12px',
      iconSize: isMobile ? 5 : 6,
      labelFontSize: isMobile ? '10px' : 'xs',
      valueFontSize: isMobile ? 'xs' : 'sm',
    },
  };
  const currentSize = sizes[size];

  // === Variants ===
  const variants = {
    flat: {
      bg: useColorModeValue('white', 'gray.800'),
      border: `1px solid ${useColorModeValue('#e0e0e0', '#333')}`,
      shadow: 'none',
    },
    elevated: {
      bg: currentColors.bg,
      border: `1px solid ${currentColors.border}`,
      shadow: useColorModeValue(
        '0 1px 3px rgba(60,64,67,0.15)',
        '0 1px 3px rgba(0,0,0,0.4)'
      ),
    },
    outlined: {
      bg: 'transparent',
      border: `1px solid ${currentColors.icon}`,
      shadow: 'none',
    },
  };
  const currentVariant = variants[variant] || variants.elevated;

  // === Motion Variants ===
  const boxMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
    hover: {
      y: -3,
      transition: { duration: 0.15, ease: 'easeInOut' },
      boxShadow: useColorModeValue(
        '0 4px 10px rgba(60,64,67,0.15)',
        '0 4px 10px rgba(0,0,0,0.3)'
      ),
    },
    tap: { scale: 0.98 },
  };

  // === Typography ===
  const labelColor = useColorModeValue('gray.700', 'gray.300');
  const valueColor = useColorModeValue('gray.900', 'gray.100');

  const boxContent = (
    <VStack spacing={1.5} align="center" justify="center" textAlign="center">
      <Icon as={icon} boxSize={currentSize.iconSize} color={currentColors.icon} />
      <Text
        fontSize={currentSize.labelFontSize}
        fontWeight="medium"
        color={labelColor}
        letterSpacing="0.4px"
      >
        {label}
      </Text>
      <Text
        fontSize={currentSize.valueFontSize}
        fontWeight="600"
        color={valueColor}
        noOfLines={2}
        lineHeight="short"
      >
        {isLoading ? <Skeleton height="14px" width="60%" mx="auto" /> : value || '—'}
      </Text>
    </VStack>
  );

  const box = (
    <MotionBox
      variants={boxMotion}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      p={currentSize.p}
      borderRadius={currentSize.borderRadius}
      bg={currentVariant.bg}
      border={currentVariant.border}
      boxShadow={currentVariant.shadow}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="all 0.2s ease"
      _focusWithin={{
        outline: '2px solid',
        outlineColor: currentColors.icon,
      }}
      sx={{
        minW: 0,
        ...sx,
      }}
    >
      {boxContent}
    </MotionBox>
  );

  return tooltip ? (
    <Tooltip label={tooltip} hasArrow>
      {box}
    </Tooltip>
  ) : (
    box
  );
}
