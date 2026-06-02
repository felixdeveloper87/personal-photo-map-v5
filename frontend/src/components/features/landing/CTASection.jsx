import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, VStack, HStack, Heading, Text, Icon, useColorModeValue } from '@chakra-ui/react';
import { HiArrowRight, HiGlobeAlt, HiCheckCircle } from 'react-icons/hi2';
import { useLandingTokens, Eyebrow, LandingButton, MotionBox, fadeInUp } from './landingUI';

const PERKS = ['No credit card', 'Unlimited maps', 'Ad-free for students'];

const CTASection = ({ onOpenRegister }) => {
  const navigate = useNavigate();
  const t = useLandingTokens();
  const glow = useColorModeValue(
    'radial(50% 60% at 50% 0%, rgba(37,99,235,0.07), transparent 70%)',
    'radial(50% 60% at 50% 0%, rgba(37,99,235,0.18), transparent 70%)'
  );

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg={t.surfaceSubtle} borderTop="1px solid" borderColor={t.hairline}>
      <Container maxW="container.lg">
        <MotionBox {...fadeInUp}>
          <Box
            position="relative"
            overflow="hidden"
            bg={t.surface}
            border="1px solid"
            borderColor={t.hairline}
            borderRadius="28px"
            boxShadow={t.shadowLg}
            px={{ base: 8, md: 16 }}
            py={{ base: 12, md: 16 }}
          >
            <Box position="absolute" inset={0} pointerEvents="none" bgGradient={glow} />

            <VStack spacing={6} textAlign="center" position="relative">
              <Eyebrow>Free forever for students</Eyebrow>

              <Heading
                as="h2"
                fontWeight="800"
                letterSpacing="-0.02em"
                lineHeight="1.1"
                fontSize={{ base: '1.9rem', md: '2.6rem', lg: '2.9rem' }}
                color={t.text}
                maxW="640px"
              >
                Start mapping your world today
              </Heading>

              <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} lineHeight="1.7" maxW="560px">
                Connect your travel photos to interactive maps, unlock live global data, and share
                automatically generated videos — all in one place.
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify="center" pt={1}>
                <LandingButton onClick={onOpenRegister} rightIcon={<HiArrowRight />}>
                  Create free account
                </LandingButton>
                <LandingButton variant="secondary" leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')}>
                  Explore the map
                </LandingButton>
              </HStack>

              <HStack spacing={{ base: 4, md: 6 }} flexWrap="wrap" justify="center" pt={2}>
                {PERKS.map((perk) => (
                  <HStack key={perk} spacing={2}>
                    <Icon as={HiCheckCircle} color={t.primary} boxSize={4} />
                    <Text fontSize="sm" color={t.textSoft} fontWeight="500">{perk}</Text>
                  </HStack>
                ))}
              </HStack>
            </VStack>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default CTASection;
