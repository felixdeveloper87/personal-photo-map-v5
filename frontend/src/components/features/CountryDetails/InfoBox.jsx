import {
  Box,
  HStack,
  Icon,
  Skeleton,
  Text,
  Tooltip,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useLandingTokens } from '../landing/landingUI';

const MotionBox = motion.create(Box);

const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

// Cartographic tones — each metric gets its own identity (amber / teal / rose).
const TONES = {
  amber: { icon: '#EBB572', soft: 'rgba(235,181,114,0.12)', border: 'rgba(235,181,114,0.30)', glow: 'rgba(235,181,114,0.22)' },
  teal: { icon: '#6FD0C4', soft: 'rgba(111,208,196,0.12)', border: 'rgba(111,208,196,0.30)', glow: 'rgba(111,208,196,0.22)' },
  rose: { icon: '#E58A7B', soft: 'rgba(229,138,123,0.12)', border: 'rgba(229,138,123,0.32)', glow: 'rgba(229,138,123,0.24)' },
};

// Back-compat: legacy color names still resolve to a cartographic tone.
const TONE_ALIASES = { blue: 'amber', green: 'teal', orange: 'amber', red: 'rose' };

const resolveTone = (scheme) => TONES[scheme] || TONES[TONE_ALIASES[scheme]] || TONES.amber;

export default function InfoBox({
  icon,
  label,
  value,
  colorScheme = 'amber',
  onClick,
  size = 'default',
  isLoading = false,
  tooltip = null,
  variant = 'elevated',
  layout = 'inline',
  sx = {},
}) {
  const t = useLandingTokens();
  const isMobile = useBreakpointValue({ base: true, sm: false });
  const tone = resolveTone(colorScheme);

  const sizes = {
    default: {
      p: isMobile ? 3 : 3.5,
      minH: isMobile ? '76px' : '84px',
      tile: isMobile ? '34px' : '40px',
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

  const bg = variant === 'flat' ? t.surfaceSubtle : t.surface;

  const Tile = (
    <Box
      w={dims.tile}
      h={dims.tile}
      minW={dims.tile}
      borderRadius="11px"
      bg={tone.soft}
      border="1px solid"
      borderColor={tone.border}
      color={tone.icon}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxShadow={`0 0 0 4px ${tone.soft}`}
      flexShrink={0}
    >
      <Icon as={icon} boxSize={dims.icon} />
    </Box>
  );

  const Label = (props) => (
    <Text
      fontFamily={MONO}
      fontSize="10px"
      fontWeight="700"
      color={t.textMuted}
      letterSpacing="0.1em"
      textTransform="uppercase"
      noOfLines={1}
      {...props}
    >
      {label}
    </Text>
  );

  const Value = (props) => (
    <Text
      fontFamily={MONO}
      fontSize={dims.value}
      fontWeight="700"
      color={t.text}
      noOfLines={1}
      lineHeight="1.25"
      maxW="full"
      {...props}
    >
      {isLoading ? <Skeleton height="14px" width="72px" startColor={t.surfaceSubtle} endColor={t.hairline} /> : value || '—'}
    </Text>
  );

  const box = (
    <MotionBox
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } }}
      whileHover={{ y: -2, boxShadow: t.shadowMd, borderColor: tone.border }}
      whileTap={{ scale: 0.99 }}
      p={dims.p}
      minH={dims.minH}
      borderRadius="14px"
      bg={bg}
      border="1px solid"
      borderColor={t.hairline}
      boxShadow={t.shadowSm}
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      transition="border-color .2s ease, box-shadow .2s ease, transform .2s ease"
      sx={{
        minW: 0,
        position: 'relative',
        overflow: 'hidden',
        // topographic accent: faint tone wash bleeding from the corner
        _before: {
          content: '""',
          position: 'absolute',
          top: '-40%',
          right: '-30%',
          w: '70%',
          h: '120%',
          bg: `radial-gradient(circle at center, ${tone.glow}, transparent 70%)`,
          opacity: 0.5,
          pointerEvents: 'none',
        },
        ...sx,
      }}
    >
      {layout === 'stacked' ? (
        <VStack spacing={1.5} align="center" justify="center" h="full" textAlign="center" minW={0} position="relative">
          {Tile}
          <Label textAlign="center" letterSpacing="0.06em" />
          <Value textAlign="center" />
        </VStack>
      ) : (
        <HStack spacing={3} align="center" h="full" minW={0} position="relative">
          {Tile}
          <VStack spacing={0.5} align="start" minW={0} flex="1">
            <Label />
            <Value />
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
