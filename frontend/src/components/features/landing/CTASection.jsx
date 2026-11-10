/* eslint-disable react/prop-types */
import { useNavigate } from 'react-router-dom';
import { Box, Container, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import { HiArrowRight, HiGlobeAlt } from 'react-icons/hi2';
import { Accent, Eyebrow, LandingButton, MONO, MotionBox, SERIF, fadeInUp, useLandingTokens } from './landingUI';

const PERKS = ['Country collections', 'Year-aware uploads', 'Timeline films'];

const CTASection = ({ onOpenRegister }) => {
  const navigate = useNavigate();
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 16, md: 28 }} bg={t.bg}>
      <Container maxW="container.xl">
        <MotionBox {...fadeInUp}>
          <Box
            position="relative"
            overflow="hidden"
            borderRadius={{ base: '24px', md: '32px' }}
            border="1px solid"
            borderColor="rgba(235,181,114,0.22)"
            boxShadow="0 60px 120px -60px rgba(0,0,0,0.9)"
            px={{ base: 6, md: 14 }}
            py={{ base: 20, md: 28 }}
          >
            {/* Photo backdrop */}
            <Box
              as="img"
              src="/cities/santorini.jpg"
              alt=""
              position="absolute"
              inset={0}
              w="full"
              h="full"
              objectFit="cover"
              transform="scale(1.04)"
              filter="saturate(0.9)"
            />
            <Box
              position="absolute"
              inset={0}
              background="linear-gradient(180deg, rgba(10,12,17,0.72) 0%, rgba(10,12,17,0.82) 55%, rgba(10,12,17,0.95) 100%), radial-gradient(600px 300px at 50% 0%, rgba(235,181,114,0.18), transparent 70%)"
            />

            <VStack spacing={7} textAlign="center" position="relative">
              <Eyebrow>Start your atlas</Eyebrow>

              <Heading
                as="h2"
                fontFamily={SERIF}
                fontWeight="400"
                letterSpacing="-0.02em"
                lineHeight="0.98"
                fontSize={{ base: '2.8rem', md: '4.4rem', lg: '5.4rem' }}
                color={t.text}
                maxW="900px"
              >
                Put your next trip
                <br />
                <Accent>on the map.</Accent>
              </Heading>

              <Text fontSize={{ base: 'md', md: 'lg' }} color={t.textSoft} lineHeight="1.7" maxW="560px">
                Create an account, choose a destination and upload your photos. PhotoMap does the rest.
              </Text>

              <HStack spacing={3} flexWrap="wrap" justify="center" pt={2}>
                <LandingButton onClick={onOpenRegister} rightIcon={<HiArrowRight />}>
                  Create your atlas
                </LandingButton>
                <LandingButton variant="secondary" leftIcon={<HiGlobeAlt />} onClick={() => navigate('/map')}>
                  Open world map
                </LandingButton>
              </HStack>

              <HStack spacing={{ base: 3, md: 5 }} flexWrap="wrap" justify="center" pt={4} rowGap={2}>
                {PERKS.map((perk, i) => (
                  <HStack key={perk} spacing={{ base: 3, md: 5 }}>
                    {i > 0 && <Box w="4px" h="4px" borderRadius="full" bg={t.primary} opacity={0.6} />}
                    <Text fontSize="12px" color={t.textSoft} fontFamily={MONO} letterSpacing="0.1em" textTransform="uppercase">
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
