import { Box, VStack, Icon, Text, useColorModeValue, useBreakpointValue, Skeleton, Tooltip } from '@chakra-ui/react';
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
  variant = 'default',
  sx = {},
}) {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.800', 'white');
  const labelColor = useColorModeValue('gray.600', 'gray.300');
  const shadowColor = useColorModeValue('rgba(0, 0, 0, 0.08)', 'rgba(0, 0, 0, 0.3)');
  const isMobile = useBreakpointValue({ base: true, sm: false });

  const colorSchemes = {
    blue: { icon: '#3b82f6', border: '#3b82f6', shadow: 'rgba(59,130,246,0.15)' },
    green: { icon: '#10b981', border: '#10b981', shadow: 'rgba(16,185,129,0.15)' },
    red: { icon: '#ef4444', border: '#ef4444', shadow: 'rgba(239,68,68,0.15)' },
    orange: { icon: '#f97316', border: '#f97316', shadow: 'rgba(249,115,22,0.15)' },
    purple: { icon: '#8b5cf6', border: '#8b5cf6', shadow: 'rgba(139,92,246,0.15)' },
    yellow: { icon: '#eab308', border: '#eab308', shadow: 'rgba(234,179,8,0.15)' },
    cyan: { icon: '#06b6d4', border: '#06b6d4', shadow: 'rgba(6,182,212,0.15)' },
    pink: { icon: '#ec4899', border: '#ec4899', shadow: 'rgba(236,72,153,0.15)' },
    indigo: { icon: '#6366f1', border: '#6366f1', shadow: 'rgba(99,102,241,0.15)' },
  };

  const variants = {
    default: {
      bg: bgColor,
      border: `1px solid ${borderColor}`,
      shadow: `0 4px 20px ${shadowColor}`,
    },
    glass: {
      bg: useColorModeValue('rgba(255,255,255,0.25)', 'rgba(0,0,0,0.25)'),
      border: `1px solid ${useColorModeValue('rgba(255,255,255,0.18)', 'rgba(255,255,255,0.18)')}`,
      shadow: `0 8px 32px ${shadowColor}`,
    },
  };

  const sizes = {
    default: {
      p: isMobile ? 3 : 4,
      borderRadius: isMobile ? '12px' : '16px',
      iconSize: isMobile ? 6 : 8,
      labelFontSize: isMobile ? 'xs' : 'sm',
      valueFontSize: isMobile ? 'sm' : 'md',
      spacing: isMobile ? 2 : 3,
    },
    compact: {
      p: isMobile ? 1.5 : 3,
      borderRadius: isMobile ? '8px' : '12px',
      iconSize: isMobile ? 4 : 6,
      labelFontSize: isMobile ? '10px' : 'xs',
      valueFontSize: isMobile ? 'xs' : 'sm',
      spacing: isMobile ? 1 : 1.5,
    },
  };

  const currentSize = sizes[size] || sizes.default;
  const currentVariant = variants[variant] || variants.default;
  const currentColorScheme = colorSchemes[colorScheme] || colorSchemes.blue;

  const boxVariants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    hover: { y: -6, scale: 1.02, transition: { duration: 0.2 } },
  };

  const content = (
    <VStack spacing={currentSize.spacing} align="center" justify="center" w="full">
      <Icon as={icon} boxSize={currentSize.iconSize} color={currentColorScheme.icon} />
      <Text 
        fontSize={currentSize.labelFontSize} 
        color={labelColor} 
        textTransform="uppercase" 
        fontWeight="bold"
        noOfLines={1}
        textAlign="center"
        w="full"
      >
        {label}
      </Text>
      <Text 
        fontSize={currentSize.valueFontSize} 
        fontWeight="600" 
        color={textColor} 
        textAlign="center"
        noOfLines={2}
        w="full"
        lineHeight="shorter"
      >
        {value || 'N/A'}
      </Text>
    </VStack>
  );

  const box = (
    <MotionBox
      variants={boxVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      p={currentSize.p}
      borderRadius={currentSize.borderRadius}
      bg={currentVariant.bg}
      border={currentVariant.border}
      boxShadow={currentVariant.shadow}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      {...sx}
    >
      {content}
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
