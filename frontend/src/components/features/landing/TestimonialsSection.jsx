import { Box, Container, Grid, HStack, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { HiAcademicCap, HiArrowUpRight, HiCamera, HiFilm, HiGlobeAmericas } from 'react-icons/hi2';
import { Accent, MotionBox, SERIF, SectionHeading, fadeInUp, useLandingTokens } from './landingUI';

const USE_CASES = [
  {
    icon: HiCamera,
    title: 'Travel archivists',
    text: 'Find any trip by country and year instead of digging through folders or a flat camera roll.',
  },
  {
    icon: HiAcademicCap,
    title: 'Students & educators',
    text: 'Connect the places in a journey with population, economy and global development data.',
  },
  {
    icon: HiFilm,
    title: 'Storytellers',
    text: 'Turn a photo set into a vertical or landscape film with transitions and optional audio.',
  },
  {
    icon: HiGlobeAmericas,
    title: 'Curious travellers',
    text: 'Go beyond the picture: understand the economy, people and region behind every destination.',
  },
];

const TestimonialsSection = () => {
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 20, md: 32 }} bg={t.bg}>
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', lg: '0.85fr 1.15fr' }} gap={{ base: 12, lg: 20 }} alignItems="start">
          <MotionBox {...fadeInUp} position={{ lg: 'sticky' }} top={{ lg: '140px' }}>
            <SectionHeading
              align="start"
              eyebrow="Made for"
              title={
                <>
                  More than <Accent>photo storage</Accent>
                </>
              }
              subtitle="Part private gallery, part travel timeline, part world map, and a lightweight research tool when you want one."
            />
          </MotionBox>

          <VStack align="stretch" spacing={0} borderTop="1px solid" borderColor={t.hairline}>
            {USE_CASES.map((item, i) => (
              <MotionBox key={item.title} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.08 }}>
                <HStack
                  role="group"
                  align="start"
                  spacing={{ base: 5, md: 7 }}
                  py={{ base: 7, md: 9 }}
                  borderBottom="1px solid"
                  borderColor={t.hairline}
                  transition="padding .35s ease"
                  _hover={{ pl: { md: 3 } }}
                >
                  <Box
                    flexShrink={0}
                    w="48px"
                    h="48px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor={t.hairline}
                    color={t.primary}
                    transition="all .35s ease"
                    _groupHover={{ borderColor: 'rgba(235,181,114,0.5)', bg: 'rgba(235,181,114,0.08)' }}
                  >
                    <Icon as={item.icon} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={2} flex="1">
                    <Heading
                      fontFamily={SERIF}
                      fontWeight="400"
                      fontSize={{ base: '1.8rem', md: '2.2rem' }}
                      color={t.text}
                      letterSpacing="-0.01em"
                      lineHeight="1"
                    >
                      {item.title}
                    </Heading>
                    <Text fontSize={{ base: 'sm', md: 'md' }} color={t.textSoft} lineHeight="1.7" maxW="520px">
                      {item.text}
                    </Text>
                  </VStack>
                  <Icon
                    as={HiArrowUpRight}
                    boxSize={5}
                    color={t.textMuted}
                    display={{ base: 'none', md: 'block' }}
                    mt={2}
                    transition="all .35s ease"
                    _groupHover={{ color: t.primary, transform: 'translate(2px,-2px)' }}
                  />
                </HStack>
              </MotionBox>
            ))}
          </VStack>
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
