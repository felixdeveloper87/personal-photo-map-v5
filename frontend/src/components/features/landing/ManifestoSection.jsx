import { Box, Container, HStack, Text, VStack } from '@chakra-ui/react';
import { Accent, Eyebrow, MONO, MotionBox, SERIF, fadeInUp, useLandingTokens } from './landingUI';

const POINTS = ['Grouped by country', 'Organized by year', 'Backed by real data', 'Private to your account'];

const ManifestoSection = () => {
  const t = useLandingTokens();

  return (
    <Box
      as="section"
      position="relative"
      overflow="hidden"
      py={{ base: 24, md: 36 }}
      bg={t.bg2}
      borderY="1px solid"
      borderColor={t.hairline}
    >
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        pointerEvents="none"
        background="radial-gradient(800px 360px at 50% 50%, rgba(235,181,114,0.07), transparent 70%)"
      />
      <Container maxW="container.lg" position="relative">
        <VStack spacing={{ base: 10, md: 12 }} textAlign="center">
          <MotionBox {...fadeInUp}>
            <Eyebrow>Manifesto</Eyebrow>
          </MotionBox>

          <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.06 }}>
            <Text
              as="h2"
              color={t.text}
              fontFamily={SERIF}
              fontSize={{ base: '2.4rem', md: '3.8rem', lg: '4.6rem' }}
              lineHeight="1.02"
              letterSpacing="-0.015em"
            >
              A camera roll forgets. <br />
              An atlas <Accent>remembers</Accent>.
            </Text>
          </MotionBox>

          <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.12 }}>
            <Text color={t.textSoft} fontSize={{ base: 'lg', md: 'xl' }} lineHeight="1.8" maxW="680px" mx="auto">
              After a few thousand photos, the trips blur together. PhotoMap gives each image back its
              place and its year, and puts every destination in context, with its economy, its people
              and its geography.
            </Text>
          </MotionBox>

          <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.18 }}>
            <HStack spacing={{ base: 3, md: 5 }} flexWrap="wrap" justify="center" rowGap={3}>
              {POINTS.map((point, i) => (
                <HStack key={point} spacing={{ base: 3, md: 5 }}>
                  {i > 0 && <Box w="4px" h="4px" borderRadius="full" bg={t.primary} opacity={0.6} />}
                  <Text
                    color={t.textMuted}
                    fontSize="12px"
                    fontFamily={MONO}
                    letterSpacing="0.1em"
                    textTransform="uppercase"
                  >
                    {point}
                  </Text>
                </HStack>
              ))}
            </HStack>
          </MotionBox>
        </VStack>
      </Container>
    </Box>
  );
};

export default ManifestoSection;
