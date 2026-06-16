import { Box, Container, Grid, HStack, Text, VStack } from '@chakra-ui/react';
import { HiCamera, HiCalendarDays, HiGlobeAlt, HiLockClosed, HiMapPin } from 'react-icons/hi2';
import { Eyebrow, MotionBox, fadeInUp, useLandingTokens } from './landingUI';

const POINTS = [
  { icon: HiMapPin, label: 'Grouped by country' },
  { icon: HiCalendarDays, label: 'Organized by year' },
  { icon: HiGlobeAlt, label: 'Backed by country data' },
  { icon: HiLockClosed, label: 'Your account, your photos' },
];

const ManifestoSection = () => {
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg={t.bg2} borderY="1px solid" borderColor={t.hairline}>
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: '0.9fr 1.1fr' }} gap={{ base: 10, lg: 16 }} alignItems="center">
          <MotionBox {...fadeInUp}>
            <VStack align="start" spacing={6}>
              <Eyebrow icon={HiCamera}>Manifesto</Eyebrow>
              <Text
                as="h2"
                color={t.text}
                fontFamily="'Instrument Serif', Georgia, serif"
                fontSize={{ base: '2.4rem', md: '3.6rem', lg: '4.4rem' }}
                lineHeight="0.98"
                letterSpacing="0"
              >
                A private atlas for the places you remember.
              </Text>
            </VStack>
          </MotionBox>

          <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.08 }}>
            <VStack align="stretch" spacing={8}>
              <Text color={t.textSoft} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.8">
                A camera roll is hard to read after a few thousand photos. PhotoMap turns it into a
                travel atlas: upload the images, keep the date detected from metadata or file data,
                place them in the country they belong to, and explore that destination with real
                economic, social and geographic context.
              </Text>
              <Grid templateColumns={{ base: '1fr', sm: '1fr 1fr' }} gap={3}>
                {POINTS.map((point) => (
                  <HStack
                    key={point.label}
                    spacing={3}
                    p={4}
                    bg={t.surface}
                    border="1px solid"
                    borderColor={t.hairline}
                    borderRadius="8px"
                  >
                    <Box as={point.icon} color={t.primary} boxSize={5} flexShrink={0} />
                    <Text color={t.text} fontWeight="600" fontSize="sm">
                      {point.label}
                    </Text>
                  </HStack>
                ))}
              </Grid>
            </VStack>
          </MotionBox>
        </Grid>
      </Container>
    </Box>
  );
};

export default ManifestoSection;
