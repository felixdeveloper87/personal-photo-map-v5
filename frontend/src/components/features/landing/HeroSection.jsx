/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { HiArrowRight, HiGlobeAlt } from 'react-icons/hi2';
import WorldGlobe from './WorldGlobe';
import { Accent, LandingButton, MONO, MotionBox, Pill, SERIF, useLandingTokens } from './landingUI';

const HIGHLIGHTS = [
  { k: 'By country', v: 'Every photo has a place' },
  { k: 'By year', v: 'Dates read from your files' },
  { k: 'As a film', v: 'Timeline video export' },
];

const reveal = (delay) => ({
  initial: { opacity: 0, y: 22, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay },
});

const Polaroid = ({ src, label, ...pos }) => (
  <Box
    position="absolute"
    display={{ base: 'none', md: 'block' }}
    w={{ md: '128px', xl: '146px' }}
    p="7px"
    pb="30px"
    bg="#EEE8DC"
    borderRadius="4px"
    boxShadow="0 30px 60px -20px rgba(0,0,0,0.75), 0 0 0 1px rgba(0,0,0,0.2)"
    zIndex={2}
    sx={{
      animation: 'heroFloat 7s ease-in-out infinite',
      '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
    }}
    {...pos}
  >
    <Box as="img" src={src} alt="" w="full" h={{ md: '112px', xl: '128px' }} objectFit="cover" borderRadius="2px" />
    <Text position="absolute" left="9px" bottom="8px" fontSize="10px" fontWeight="600" color="#3A3127" fontFamily={MONO} letterSpacing="0.06em">
      {label}
    </Text>
  </Box>
);

const HeroSection = ({ onOpenRegister }) => {
  const navigate = useNavigate();
  const t = useLandingTokens();

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg={t.bg}
      minH={{ lg: '100svh' }}
      display="flex"
      alignItems="center"
      pt={{ base: 32, lg: 36 }}
      pb={{ base: 8, lg: 16 }}
      sx={{
        '@keyframes heroFloat': {
          '0%, 100%': { transform: 'translateY(0) rotate(var(--r))' },
          '50%': { transform: 'translateY(-12px) rotate(var(--r))' },
        },
      }}
    >
      {/* Ambient light */}
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        pointerEvents="none"
        background="radial-gradient(900px 600px at 78% 38%, rgba(111,208,196,0.12), transparent 62%), radial-gradient(700px 500px at 8% 20%, rgba(235,181,114,0.10), transparent 65%), radial-gradient(1200px 400px at 50% 110%, rgba(235,181,114,0.06), transparent 70%)"
      />
      {/* Fine grid fading out toward the edges */}
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        pointerEvents="none"
        opacity={0.5}
        backgroundImage="linear-gradient(rgba(236,231,220,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(236,231,220,0.045) 1px, transparent 1px)"
        backgroundSize="88px 88px"
        sx={{
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 75%)',
        }}
      />

      {/* Blend the hero's glow into the next section */}
      <Box
        aria-hidden
        position="absolute"
        left={0}
        right={0}
        bottom={0}
        h="220px"
        pointerEvents="none"
        bgGradient={`linear(to-b, transparent, ${t.bg})`}
      />

      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 6, lg: 6 }} alignItems="center">
          <VStack align="start" spacing={{ base: 7, md: 8 }}>
            <MotionBox {...reveal(0)}>
              <Pill>Personal Photo Map</Pill>
            </MotionBox>

            <MotionBox {...reveal(0.08)}>
              <Heading
                as="h1"
                fontFamily={SERIF}
                fontWeight="400"
                letterSpacing="-0.02em"
                lineHeight="0.94"
                fontSize={{ base: '3.5rem', sm: '4.4rem', md: '5.6rem', xl: '6.8rem' }}
                color={t.text}
              >
                Your travels,
                <br />
                <Accent>beautifully</Accent> mapped.
              </Heading>
            </MotionBox>

            <MotionBox {...reveal(0.16)}>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color={t.textSoft} lineHeight="1.7" maxW="520px">
                A private atlas for your photographs. Every image finds its country and its year,
                every destination comes with real context, and every trip can become a film.
              </Text>
            </MotionBox>

            <MotionBox {...reveal(0.24)}>
              <HStack spacing={3} flexWrap="wrap">
                <LandingButton onClick={onOpenRegister} rightIcon={<HiArrowRight />}>
                  Start your atlas
                </LandingButton>
                <LandingButton variant="secondary" leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')}>
                  Explore the map
                </LandingButton>
              </HStack>
            </MotionBox>

            <MotionBox {...reveal(0.32)} w="full" pt={{ base: 2, md: 4 }} display={{ base: 'none', sm: 'block' }}>
              <Grid
                templateColumns={{ base: '1fr', sm: 'repeat(3, 1fr)' }}
                maxW="560px"
                borderTop="1px solid"
                borderColor={t.hairline}
              >
                {HIGHLIGHTS.map((h, i) => (
                  <Box
                    key={h.k}
                    pt={5}
                    pb={{ base: 3, sm: 0 }}
                    pl={{ base: 0, sm: i === 0 ? 0 : 5 }}
                    pr={{ base: 0, sm: 5 }}
                    borderLeft={{ base: 'none', sm: i === 0 ? 'none' : '1px solid' }}
                    borderColor={t.hairline}
                  >
                    <Text fontFamily={SERIF} fontSize="xl" color={t.text} lineHeight="1.1">
                      {h.k}
                    </Text>
                    <Text fontSize="13px" color={t.textMuted} mt={1}>
                      {h.v}
                    </Text>
                  </Box>
                ))}
              </Grid>
            </MotionBox>
          </VStack>

          <MotionBox
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            position="relative"
          >
            {/* Halo behind the globe */}
            <Box
              aria-hidden
              position="absolute"
              left="50%"
              top="50%"
              w="78%"
              h="78%"
              transform="translate(-50%, -50%)"
              borderRadius="full"
              background="radial-gradient(circle, rgba(111,208,196,0.22), rgba(235,181,114,0.08) 45%, transparent 70%)"
              filter="blur(40px)"
              pointerEvents="none"
            />
            <WorldGlobe />
            <Polaroid src="/cities/lisbon.jpg" label="LISBON · 2024" top="8%" left="-2%" style={{ '--r': '-7deg' }} />
            <Polaroid
              src="/cities/tokyo.jpg"
              label="TOKYO · 2023"
              bottom="6%"
              right="0%"
              style={{ '--r': '6deg', animationDelay: '-3.5s' }}
            />
          </MotionBox>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
