/* eslint-disable react/prop-types */
import { Box, Button, HStack, VStack, Heading, Text, Icon } from '@chakra-ui/react';
import { motion } from 'framer-motion';

export const BRAND = {
  bg: '#0A0C11',
  bg2: '#0E1118',
  primary: '#EBB572',
  primaryHover: '#F1C98D',
  primaryActive: '#D79A55',
  accent: '#6FD0C4',
  rose: '#E58A7B',
  cream: '#ECE7DC',
  muted: '#8B90A0',
};

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const MotionBox = motion.create(Box);

export function useLandingTokens() {
  return {
    bg: BRAND.bg,
    bg2: BRAND.bg2,
    primary: BRAND.primary,
    primaryHover: BRAND.primaryHover,
    primaryActive: BRAND.primaryActive,
    accent: BRAND.accent,
    rose: BRAND.rose,

    text: BRAND.cream,
    textSoft: '#B8B0A2',
    textMuted: BRAND.muted,

    surface: 'rgba(20,24,33,0.74)',
    surfaceSolid: '#11151E',
    surfaceSubtle: '#0E1118',

    hairline: 'rgba(236,231,220,0.10)',
    hairlineStrong: 'rgba(235,181,114,0.32)',

    primarySoftBg: 'rgba(235,181,114,0.12)',
    primarySoftBorder: 'rgba(235,181,114,0.28)',
    accentSoftBg: 'rgba(111,208,196,0.12)',

    shadowSm: '0 1px 2px rgba(0,0,0,0.36)',
    shadowMd: '0 18px 44px -24px rgba(0,0,0,0.72)',
    shadowLg: '0 34px 90px -38px rgba(0,0,0,0.88)',
  };
}

export const Eyebrow = ({ children, icon }) => {
  const t = useLandingTokens();
  return (
    <HStack spacing={2.5} align="center">
      <Box w="22px" h="2px" borderRadius="full" bg={t.primary} />
      {icon && <Icon as={icon} boxSize={3.5} color={t.primary} />}
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0"
        textTransform="uppercase"
        color={t.primary}
        fontFamily="'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace"
      >
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
  maxW = '760px',
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
        fontFamily="'Instrument Serif', Georgia, serif"
        fontWeight="400"
        letterSpacing="0"
        lineHeight="1.04"
        fontSize={{ base: '2.2rem', md: '3.1rem', lg: '3.6rem' }}
        color={t.text}
      >
        {title}
      </Heading>
      {subtitle && (
        <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} lineHeight="1.7" maxW="660px">
          {subtitle}
        </Text>
      )}
    </VStack>
  );
};

export const SurfaceCard = ({ children, hover = true, p = 6, ...props }) => {
  const t = useLandingTokens();
  return (
    <Box
      bg={t.surface}
      border="1px solid"
      borderColor={t.hairline}
      borderRadius="8px"
      boxShadow={t.shadowSm}
      p={p}
      transition="border-color .25s ease, box-shadow .25s ease, transform .25s ease"
      _hover={
        hover
          ? { borderColor: t.hairlineStrong, boxShadow: t.shadowMd, transform: 'translateY(-3px)' }
          : undefined
      }
      {...props}
    >
      {children}
    </Box>
  );
};

const buttonVariants = (t) => ({
  primary: {
    bg: t.primary,
    color: '#0A0C11',
    boxShadow: '0 12px 32px rgba(235,181,114,0.18)',
    _hover: { bg: t.primaryHover, transform: 'translateY(-1px)', boxShadow: t.shadowMd },
    _active: { transform: 'translateY(0)', bg: t.primaryActive },
  },
  secondary: {
    bg: 'transparent',
    color: t.text,
    border: '1px solid',
    borderColor: t.hairlineStrong,
    _hover: {
      borderColor: t.primary,
      color: t.primary,
      bg: t.primarySoftBg,
      transform: 'translateY(-1px)',
    },
    _active: { transform: 'translateY(0)' },
  },
});

export const LandingButton = ({ variant = 'primary', children, size = 'lg', ...props }) => {
  const t = useLandingTokens();
  const styles = buttonVariants(t)[variant];
  const dims = size === 'lg' ? { h: '52px', px: 7, fontSize: 'md' } : { h: '44px', px: 5, fontSize: 'sm' };
  return (
    <Button
      fontWeight="600"
      borderRadius="8px"
      letterSpacing="0"
      transition="all .2s ease"
      {...dims}
      {...styles}
      {...props}
    >
      {children}
    </Button>
  );
};
