/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { Box, Container, HStack, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { HiArrowRight, HiCalendarDays, HiGlobeAlt, HiMapPin } from 'react-icons/hi2';
import { Eyebrow, LandingButton, MotionBox, fadeInUp, useLandingTokens } from './landingUI';

const PERKS = ['Country collections', 'Year-aware uploads', 'Timeline video export'];

const CTASection = ({ onOpenRegister }) => {
  const navigate = useNavigate();
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg={t.bg2} borderTop="1px solid" borderColor={t.hairline}>
      <Container maxW="container.lg">
        <MotionBox {...fadeInUp}>
          <Box
            position="relative"
            overflow="hidden"
            bg={t.surface}
            border="1px solid"
            borderColor={t.hairlineStrong}
            borderRadius="8px"
            boxShadow={t.shadowLg}
            px={{ base: 6, md: 14 }}
            py={{ base: 10, md: 14 }}
            sx={{
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(440px 260px at 50% 0%, rgba(235,181,114,0.16), transparent 70%), radial-gradient(420px 260px at 100% 100%, rgba(111,208,196,0.12), transparent 70%)',
                pointerEvents: 'none',
              },
            }}
          >
            <VStack spacing={6} textAlign="center" position="relative">
              <Eyebrow icon={HiMapPin}>Start your atlas</Eyebrow>

              <Heading
                as="h2"
                fontFamily="'Instrument Serif', Georgia, serif"
                fontWeight="400"
                letterSpacing="0"
                lineHeight="1.04"
                fontSize={{ base: '2.4rem', md: '3.5rem', lg: '4.1rem' }}
                color={t.text}
                maxW="720px"
              >
                Put your next trip on the map.
              </Heading>

              <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} lineHeight="1.7" maxW="600px">
                Create an account, choose a destination, upload photos, and let PhotoMap turn the trip into
                a country collection with year-aware organization and video export.
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify="center" pt={1}>
                <LandingButton onClick={onOpenRegister} rightIcon={<HiArrowRight />}>
                  Create account
                </LandingButton>
                <LandingButton variant="secondary" leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')}>
                  Open world map
                </LandingButton>
              </HStack>

              <HStack spacing={{ base: 4, md: 6 }} flexWrap="wrap" justify="center" pt={2}>
                {PERKS.map((perk, index) => (
                  <HStack key={perk} spacing={2}>
                    <Icon as={index === 1 ? HiCalendarDays : HiMapPin} color={t.primary} boxSize={4} />
                    <Text fontSize="sm" color={t.textSoft} fontWeight="500">
                      {perk}
                    </Text>
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
