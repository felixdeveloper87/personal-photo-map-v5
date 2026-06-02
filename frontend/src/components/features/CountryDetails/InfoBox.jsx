import {
  Box,
  HStack,
  Icon,
  Skeleton,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

const palette = {
  blue: {
    light: { icon: '#2563EB', bg: 'rgba(37,99,235,0.08)', border: 'rgba(37,99,235,0.18)' },
    dark: { icon: '#60A5FA', bg: 'rgba(37,99,235,0.16)', border: 'rgba(96,165,250,0.24)' },
  },
  green: {
    light: { icon: '#059669', bg: 'rgba(5,150,105,0.08)', border: 'rgba(5,150,105,0.18)' },
    dark: { icon: '#34D399', bg: 'rgba(5,150,105,0.14)', border: 'rgba(52,211,153,0.22)' },
  },
  orange: {
    light: { icon: '#D97706', bg: 'rgba(217,119,6,0.08)', border: 'rgba(217,119,6,0.18)' },
    dark: { icon: '#FBBF24', bg: 'rgba(217,119,6,0.14)', border: 'rgba(251,191,36,0.22)' },
  },
  red: {
    light: { icon: '#DC2626', bg: 'rgba(220,38,38,0.08)', border: 'rgba(220,38,38,0.18)' },
    dark: { icon: '#F87171', bg: 'rgba(220,38,38,0.14)', border: 'rgba(248,113,113,0.22)' },
  },
};

export default function InfoBox({
  icon,
  label,
  value,
  colorScheme = 'blue',
  onClick,
  size = 'default',
  isLoading = false,
  tooltip = null,
  variant = 'elevated',
  layout = 'inline',
  sx = {},
}) {
  const tone = useColorModeValue('light', 'dark');
  const isMobile = useBreakpointValue({ base: true, sm: false });
  const colors = palette[colorScheme]?.[tone] || palette.blue[tone];

  const surface = useColorModeValue('#FFFFFF', '#111827');
  const surfaceSubtle = useColorModeValue('#F8FAFC', '#0B1220');
  const hairline = useColorModeValue('#E5E7EB', 'rgba(255,255,255,0.10)');
  const text = useColorModeValue('#0F172A', '#F8FAFC');
  const textSoft = useColorModeValue('#64748B', '#94A3B8');
  const shadow = useColorModeValue(
    '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.05)',
    '0 1px 2px rgba(0,0,0,0.35)'
  );
  const hoverShadow = useColorModeValue(
    '0 10px 26px -14px rgba(15,23,42,0.22)',
    '0 12px 30px -14px rgba(0,0,0,0.75)'
  );

  const sizes = {
    default: {
      p: isMobile ? 3 : 3.5,
      minH: isMobile ? '76px' : '84px',
      tile: isMobile ? '34px' : '38px',
      icon: isMobile ? 4 : 4.5,
      value: isMobile ? 'sm' : 'md',
    },
    compact: {
      p: isMobile ? 2.5 : 3,
      minH: isMobile ? '72px' : '78px',
      tile: isMobile ? '32px' : '36px',
      icon: isMobile ? 3.5 : 4,
      value: isMobile ? '13px' : 'sm',
    },
  };
  const dims = sizes[size] || sizes.default;

  const bg = variant === 'flat' ? surfaceSubtle : surface;

  const box = (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileHover={{ y: -2, boxShadow: hoverShadow, borderColor: colors.border }}
      whileTap={{ scale: 0.99 }}
      p={dims.p}
      minH={dims.minH}
      borderRadius="14px"
      bg={bg}
      border="1px solid"
      borderColor={hairline}
      boxShadow={shadow}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="border-color .2s ease, box-shadow .2s ease, transform .2s ease"
      sx={{
        minW: 0,
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {layout === 'stacked' ? (
        <VStack spacing={1.5} align="center" justify="center" h="full" textAlign="center" minW={0}>
          <Box
            w={dims.tile}
            h={dims.tile}
            minW={dims.tile}
            borderRadius="10px"
            bg={colors.bg}
            border="1px solid"
            borderColor={colors.border}
            color={colors.icon}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={icon} boxSize={dims.icon} />
          </Box>
          <Text
            fontSize="10px"
            fontWeight="800"
            color={textSoft}
            letterSpacing="0"
            noOfLines={1}
            maxW="full"
          >
            {label}
          </Text>
          <Text fontSize={dims.value} fontWeight="800" color={text} noOfLines={1} lineHeight="1.2" maxW="full">
            {isLoading ? <Skeleton height="14px" width="58px" /> : value || '-'}
          </Text>
        </VStack>
      ) : (
      <HStack spacing={3} align="center" h="full" minW={0}>
        <Box
          w={dims.tile}
          h={dims.tile}
          minW={dims.tile}
          borderRadius="10px"
          bg={colors.bg}
          border="1px solid"
          borderColor={colors.border}
          color={colors.icon}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={icon} boxSize={dims.icon} />
        </Box>

        <VStack spacing={0.5} align="start" minW={0} flex="1">
          <Text
            fontSize="10px"
            fontWeight="800"
            color={textSoft}
            letterSpacing="0.08em"
            textTransform="uppercase"
            noOfLines={1}
          >
            {label}
          </Text>
          <Text fontSize={dims.value} fontWeight="800" color={text} noOfLines={1} lineHeight="1.25" maxW="full">
          {isLoading ? <Skeleton height="14px" width="82px" /> : value || '-'}
        </Text>
      </VStack>
      </HStack>
      )}
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
