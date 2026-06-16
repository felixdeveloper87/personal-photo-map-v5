/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { Box, Container, Grid, HStack, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { HiArrowRight, HiCalendarDays, HiGlobeAlt, HiMapPin, HiVideoCamera } from 'react-icons/hi2';
import WorldGlobe from './WorldGlobe';
import { Eyebrow, LandingButton, MotionBox, fadeInUp, useLandingTokens } from './landingUI';

const STATS = [
  { icon: HiMapPin, value: 'Country', label: 'photo grouping' },
  { icon: HiCalendarDays, value: 'EXIF', label: 'year detection' },
  { icon: HiVideoCamera, value: 'MP4/WebM', label: 'timeline export' },
];

const HeroSection = ({ onOpenRegister }) => {
  const navigate = useNavigate();
  const t = useLandingTokens();

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      bg={t.bg}
      pt={{ base: 24, lg: 30 }}
      pb={{ base: 12, lg: 18 }}
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(720px 480px at 74% 24%, rgba(111,208,196,0.13), transparent 68%), radial-gradient(520px 420px at 12% 34%, rgba(235,181,114,0.10), transparent 68%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          opacity: 0.23,
          backgroundImage:
            'linear-gradient(rgba(236,231,220,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(236,231,220,0.055) 1px, transparent 1px)',
          backgroundSize: '82px 82px',
          pointerEvents: 'none',
        },
      }}
    >
      <Container maxW="container.xl" position="relative" zIndex={1}>
        <Grid
          templateColumns={{ base: '1fr', lg: '0.92fr 1.08fr' }}
          gap={{ base: 10, lg: 8 }}
          alignItems="center"
        >
          <VStack align="start" spacing={7}>
            <MotionBox {...fadeInUp}>
              <Eyebrow icon={HiGlobeAlt}>Private travel atlas</Eyebrow>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.06 }}>
              <Heading
                as="h1"
                fontFamily="'Instrument Serif', Georgia, serif"
                fontWeight="400"
                letterSpacing="0"
                lineHeight="0.96"
                fontSize={{ base: '3.4rem', sm: '4.2rem', md: '5.4rem', xl: '6.6rem' }}
                color={t.text}
                maxW="680px"
              >
                Personal Photo Map
              </Heading>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.12 }}>
              <Text fontSize={{ base: 'lg', md: 'xl' }} color={t.textSoft} lineHeight="1.75" maxW="600px">
                Turn travel photos into a private atlas. Upload images by country, keep the year
                detected from EXIF or file data, explore real country indicators, and export a
                timeline video when the trip is ready to share.
              </Text>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.18 }}>
              <HStack spacing={3} flexWrap="wrap">
                <LandingButton onClick={onOpenRegister} rightIcon={<HiArrowRight />}>
                  Create your map
                </LandingButton>
                <LandingButton variant="secondary" leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')}>
                  Explore world map
                </LandingButton>
              </HStack>
            </MotionBox>

            <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.24 }} w="full">
              <HStack spacing={{ base: 4, md: 6 }} pt={2} flexWrap="wrap">
                {STATS.map((s) => (
                  <HStack key={s.label} spacing={2.5}>
                    <Icon as={s.icon} boxSize={4} color={t.primary} />
                    <Text fontSize="sm" color={t.textSoft}>
                      <Box as="span" fontWeight="700" color={t.text}>
                        {s.value}
                      </Box>{' '}
                      {s.label}
                    </Text>
                  </HStack>
                ))}
              </HStack>
            </MotionBox>
          </VStack>

          <MotionBox
            initial={{ opacity: 0, y: 26, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
            position="relative"
          >
            <WorldGlobe />
          </MotionBox>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroSection;
