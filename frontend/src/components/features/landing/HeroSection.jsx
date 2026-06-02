import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, VStack, HStack, Heading, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { HiArrowRight, HiGlobeAlt, HiMapPin, HiCamera, HiChartBarSquare } from 'react-icons/hi2';
import MiniMap from './MiniMap';
import { useLandingTokens, Eyebrow, LandingButton, MotionBox, fadeInUp } from './landingUI';

const STATS = [
  { icon: HiGlobeAlt, value: '195+', label: 'countries' },
  { icon: HiChartBarSquare, value: 'Live', label: 'World Bank data' },
  { icon: HiCamera, value: '∞', label: 'photo storage' },
];

const HeroSection = ({ onOpenRegister }) => {
  const navigate = useNavigate();
  const t = useLandingTokens();
  const glow = useColorModeValue(
    'radial(55% 50% at 78% 18%, rgba(37,99,235,0.07), transparent 70%)',
    'radial(55% 50% at 78% 18%, rgba(37,99,235,0.16), transparent 70%)'
  );

  return (
    <Box as="section" position="relative" overflow="hidden" pt={{ base: 24, lg: 28 }} pb={{ base: 16, lg: 20 }}>
      <Box position="absolute" inset={0} pointerEvents="none" bgGradient={glow} />

      <Container maxW="container.xl" position="relative">
        <Grid templateColumns={{ base: '1fr', lg: '1.05fr 1fr' }} gap={{ base: 12, lg: 16 }} alignItems="center">

          {/* Copy */}
          <VStack align="start" spacing={7}>
            <MotionBox {...fadeInUp}>
              <Eyebrow icon={HiMapPin}>Educational travel platform</Eyebrow>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.06 }}>
              <Heading
                as="h1"
                fontWeight="800"
                letterSpacing="-0.03em"
                lineHeight="1.05"
                fontSize={{ base: '2.5rem', sm: '3rem', md: '3.5rem', xl: '3.9rem' }}
                color={t.text}
              >
                Travel photos that{' '}
                <Box as="span" color={t.primary}>teach you</Box>{' '}the world.
              </Heading>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.12 }}>
              <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} lineHeight="1.75" maxW="540px">
                Organize photos by country and date, explore real economic and social data from the
                World Bank for every destination, and export polished videos for social media.
              </Text>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.18 }}>
              <HStack spacing={3} flexWrap="wrap">
                <LandingButton onClick={onOpenRegister} rightIcon={<HiArrowRight />}>
                  Get started — free
                </LandingButton>
                <LandingButton variant="secondary" leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')}>
                  Explore the map
                </LandingButton>
              </HStack>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.24 }} w="full">
              <HStack spacing={{ base: 5, md: 8 }} pt={2} flexWrap="wrap">
                {STATS.map((s) => (
                  <HStack key={s.label} spacing={2.5}>
                    <Icon as={s.icon} boxSize={4} color={t.primary} />
                    <Text fontSize="sm" color={t.textSoft}>
                      <Box as="span" fontWeight="700" color={t.text}>{s.value}</Box> {s.label}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </MotionBox>
          </VStack>

          {/* Product specimen — the real map */}
          <MotionBox
            display={{ base: 'none', lg: 'block' }}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            <Box
              bg={t.surface}
              border="1px solid"
              borderColor={t.hairline}
              borderRadius="22px"
              boxShadow={t.shadowLg}
              overflow="hidden"
            >
              <HStack justify="space-between" px={5} py={3.5} borderBottom="1px solid" borderColor={t.hairline}>
                <HStack spacing={2.5}>
                  <Icon as={HiGlobeAlt} color={t.primary} boxSize={4} />
                  <Text fontSize="sm" fontWeight="700" color={t.text}>Interactive world map</Text>
                </HStack>
                <HStack spacing={2}>
                  <Box w="7px" h="7px" borderRadius="full" bg="#22C55E" />
                  <Text fontSize="xs" color={t.textMuted} fontWeight="600">Live</Text>
                </HStack>
              </HStack>
              <Box p={3}>
                <MiniMap width="100%" height="440px" />
              </Box>
            </Box>
          </MotionBox>

        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
