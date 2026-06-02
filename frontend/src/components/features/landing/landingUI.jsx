import React from 'react';
import {
  Box,
  Button,
  HStack,
  VStack,
  Heading,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { motion } from 'framer-motion';

/**
 * Landing design system — "Refined Blue".
 * One brand colour used with intent, neutral surfaces, calm motion.
 * Everything on the landing pulls from here so the page stays consistent.
 */

export const BRAND = {
  primary: '#2563EB',
  primaryHover: '#1D4ED8',
  primaryActive: '#1E40AF',
  accent: '#F59E0B', // reserved for rare highlights (e.g. rating stars)
};

// Calm, single motion language for the whole page.
export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
};

export const MotionBox = motion.create(Box);

export function useLandingTokens() {
  return {
    primary: BRAND.primary,
    primaryHover: BRAND.primaryHover,
    accent: BRAND.accent,

    text: useColorModeValue('#0F172A', '#F8FAFC'),
    textSoft: useColorModeValue('#475569', '#9FB0C8'),
    textMuted: useColorModeValue('#64748B', '#6B7A90'),

    bg: useColorModeValue('#FFFFFF', '#06070B'),
    surface: useColorModeValue('#FFFFFF', '#0E1424'),
    surfaceSubtle: useColorModeValue('#F8FAFC', '#0A0F1C'),

    hairline: useColorModeValue('#E5E7EB', 'rgba(255,255,255,0.08)'),
    hairlineStrong: useColorModeValue('#D5DBE3', 'rgba(255,255,255,0.16)'),

    primarySoftBg: useColorModeValue('rgba(37,99,235,0.06)', 'rgba(37,99,235,0.14)'),
    primarySoftBorder: useColorModeValue('rgba(37,99,235,0.16)', 'rgba(37,99,235,0.32)'),
    accentSoftBg: useColorModeValue('rgba(245,158,11,0.10)', 'rgba(245,158,11,0.16)'),

    shadowSm: useColorModeValue(
      '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.05)',
      '0 1px 2px rgba(0,0,0,0.5)'
    ),
    shadowMd: useColorModeValue(
      '0 8px 24px -10px rgba(15,23,42,0.12)',
      '0 10px 28px -12px rgba(0,0,0,0.6)'
    ),
    shadowLg: useColorModeValue(
      '0 24px 50px -20px rgba(15,23,42,0.20)',
      '0 28px 60px -24px rgba(0,0,0,0.7)'
    ),
  };
}

/** Small uppercase label with a leading rule — replaces the big gradient badges. */
export const Eyebrow = ({ children, icon }) => {
  const t = useLandingTokens();
  return (
    <HStack spacing={2.5} align="center">
      <Box w="22px" h="2px" borderRadius="full" bg={t.primary} />
      {icon && <Icon as={icon} boxSize={3.5} color={t.primary} />}
      <Text
        fontSize="xs"
        fontWeight="700"
        letterSpacing="0.14em"
        textTransform="uppercase"
        color={t.primary}
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
  maxW = '720px',
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
        fontWeight="800"
        letterSpacing="-0.02em"
        lineHeight="1.1"
        fontSize={{ base: '1.75rem', md: '2.4rem', lg: '2.7rem' }}
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

/** Neutral elevated card with a calm lift on hover. */
export const SurfaceCard = ({ children, hover = true, p = 6, ...props }) => {
  const t = useLandingTokens();
  return (
    <Box
      bg={t.surface}
      border="1px solid"
      borderColor={t.hairline}
      borderRadius="20px"
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
    color: 'white',
    boxShadow: '0 1px 2px rgba(15,23,42,0.12)',
    _hover: { bg: t.primaryHover, transform: 'translateY(-1px)', boxShadow: t.shadowMd },
    _active: { transform: 'translateY(0)', bg: t.primary },
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
      borderRadius="14px"
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
