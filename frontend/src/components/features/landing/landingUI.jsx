/* eslint-disable react/prop-types */
import { useRef } from 'react';
import { Box, Button, HStack, VStack, Heading, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';

import { color, font, shadow } from '../../../design/tokens';

export const BRAND = {
  bg: color.bg,
  bg2: color.bg2,
  primary: color.primary,
  primaryHover: color.primaryHover,
  primaryActive: color.primaryActive,
  accent: color.accent,
  rose: color.rose,
  cream: color.text,
  muted: color.textMuted,
};

export const SERIF = font.display;
export const MONO = font.mono;

export const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
};

export const MotionBox = motion.create(Box);

// Stable object (tokens never change at runtime) — safe to use in hook deps.
const LANDING_TOKENS = Object.freeze({
  ...color,
  shadowSm: shadow.sm,
  shadowMd: shadow.md,
  shadowLg: shadow.lg,
});

/** Atlas design tokens as a flat object (see src/design/tokens.js). */
export function useLandingTokens() {
  return LANDING_TOKENS;
}

/** Italic serif word with a warm gold gradient, for headline accents. */
export const Accent = ({ children }) => (
  <Box
    as="em"
    fontFamily={SERIF}
    fontStyle="italic"
    bgGradient="linear(100deg, #F6D5A3 0%, #EBB572 45%, #E58A7B 100%)"
    bgClip="text"
    sx={{ WebkitBoxDecorationBreak: 'clone', boxDecorationBreak: 'clone' }}
    pr="0.06em"
  >
    {children}
  </Box>
);

/** Small mono label preceded by a gold rule. */
export const Eyebrow = ({ children, icon }) => {
  const t = useLandingTokens();
  return (
    <HStack spacing={3} align="center">
      <Box w="28px" h="1px" bgGradient={`linear(to-r, transparent, ${t.primary})`} />
      {icon && <Icon as={icon} boxSize={3.5} color={t.primary} />}
      <Text
        fontSize="11px"
        fontWeight="600"
        letterSpacing="0.16em"
        textTransform="uppercase"
        color={t.primary}
        fontFamily={MONO}
      >
        {children}
      </Text>
    </HStack>
  );
};

/** Pill badge with a pulsing dot, used at the top of the hero. */
export const Pill = ({ children }) => {
  const t = useLandingTokens();
  return (
    <HStack
      spacing={2.5}
      display="inline-flex"
      px={3.5}
      py={1.5}
      borderRadius="full"
      border="1px solid"
      borderColor="rgba(235,181,114,0.24)"
      bg="rgba(235,181,114,0.06)"
      backdropFilter="blur(8px)"
    >
      <Box position="relative" w="6px" h="6px">
        <Box position="absolute" inset={0} borderRadius="full" bg={t.primary} />
        <Box
          position="absolute"
          inset="-3px"
          borderRadius="full"
          border="1px solid"
          borderColor={t.primary}
          sx={{
            animation: 'pillPulse 2.4s ease-out infinite',
            '@keyframes pillPulse': {
              '0%': { transform: 'scale(0.6)', opacity: 0.7 },
              '100%': { transform: 'scale(1.8)', opacity: 0 },
            },
            '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
          }}
        />
      </Box>
      <Text fontSize="11px" fontWeight="600" letterSpacing="0.14em" textTransform="uppercase" color={t.primary} fontFamily={MONO}>
        {children}
      </Text>
    </HStack>
  );
};

export const SectionHeading = ({
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  align = 'center',
  maxW = '780px',
}) => {
  const t = useLandingTokens();
  const isCenter = align === 'center';
  return (
    <VStack
      spacing={5}
      align={isCenter ? 'center' : 'start'}
      textAlign={isCenter ? 'center' : 'left'}
      maxW={maxW}
      mx={isCenter ? 'auto' : 0}
    >
      {eyebrow && <Eyebrow icon={eyebrowIcon}>{eyebrow}</Eyebrow>}
      <Heading
        as="h2"
        fontFamily={SERIF}
        fontWeight="400"
        letterSpacing="-0.01em"
        lineHeight="1.02"
        fontSize={{ base: '2.5rem', md: '3.4rem', lg: '4rem' }}
        color={t.text}
      >
        {title}
      </Heading>
      {subtitle && (
        <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} lineHeight="1.7" maxW="620px">
          {subtitle}
        </Text>
      )}
    </VStack>
  );
};

/** Glass card with a soft spotlight that follows the pointer. */
export const GlowCard = ({ children, p = { base: 5, md: 7 }, radius = '22px', sx, ...props }) => {
  const t = useLandingTokens();
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Box
      ref={ref}
      onMouseMove={onMove}
      position="relative"
      overflow="hidden"
      borderRadius={radius}
      background="linear-gradient(180deg, rgba(236,231,220,0.045), rgba(236,231,220,0.012))"
      border="1px solid"
      borderColor={t.hairline}
      boxShadow="inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 80px -48px rgba(0,0,0,0.9)"
      transition="border-color .35s ease"
      _hover={{ borderColor: 'rgba(235,181,114,0.24)' }}
      p={p}
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(460px circle at var(--mx, 50%) var(--my, 0%), rgba(235,181,114,0.10), transparent 45%)',
          opacity: 0,
          transition: 'opacity .35s ease',
          pointerEvents: 'none',
        },
        '&:hover::before': { opacity: 1 },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
};

export const SurfaceCard = ({ children, p = 6, ...props }) => (
  <GlowCard p={p} {...props}>
    {children}
  </GlowCard>
);

const NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

/** Fixed film-grain layer that gives the dark surfaces a printed, tactile feel. */
export const Grain = () => (
  <Box
    aria-hidden
    position="fixed"
    inset={0}
    zIndex={2}
    pointerEvents="none"
    opacity={0.045}
    mixBlendMode="overlay"
    backgroundImage={NOISE}
    backgroundSize="180px 180px"
  />
);

const buttonVariants = (t) => ({
  primary: {
    color: '#1A120A',
    bgGradient: 'linear(180deg, #F3CF98, #EBB572 55%, #DFA25E)',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.45), 0 14px 36px -12px rgba(235,181,114,0.5)',
    _hover: {
      bgGradient: 'linear(180deg, #F7DBAE, #F1C98D 55%, #E5AC6A)',
      transform: 'translateY(-1px)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), 0 20px 44px -12px rgba(235,181,114,0.6)',
    },
    _active: { transform: 'translateY(0)' },
  },
  secondary: {
    bg: 'rgba(236,231,220,0.03)',
    color: t.text,
    border: '1px solid',
    borderColor: 'rgba(236,231,220,0.16)',
    backdropFilter: 'blur(8px)',
    _hover: {
      borderColor: 'rgba(235,181,114,0.5)',
      color: t.primaryHover,
      bg: 'rgba(235,181,114,0.06)',
      transform: 'translateY(-1px)',
    },
    _active: { transform: 'translateY(0)' },
  },
});

export const LandingButton = ({ variant = 'primary', children, size = 'lg', ...props }) => {
  const t = useLandingTokens();
  const styles = buttonVariants(t)[variant];
  const dims = size === 'lg' ? { h: '54px', px: 8, fontSize: 'md' } : { h: '44px', px: 5, fontSize: 'sm' };
  return (
    <Button
      fontWeight="600"
      borderRadius="full"
      letterSpacing="0"
      transition="all .25s ease"
      {...dims}
      {...styles}
      {...props}
    >
      {children}
    </Button>
  );
};
