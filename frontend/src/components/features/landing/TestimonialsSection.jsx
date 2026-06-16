import { Box, Container, Heading, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { HiAcademicCap, HiCamera, HiFilm, HiGlobeAmericas } from 'react-icons/hi2';
import { MotionBox, SectionHeading, fadeInUp, useLandingTokens } from './landingUI';

const USE_CASES = [
  {
    icon: HiCamera,
    title: 'For personal travel archives',
    text: 'Find trips by country and year instead of digging through folders or a flat camera roll.',
  },
  {
    icon: HiAcademicCap,
    title: 'For students and educators',
    text: 'Connect the places in a journey with country indicators, population context and global development data.',
  },
  {
    icon: HiFilm,
    title: 'For social creators',
    text: 'Turn a photo set into a vertical or landscape timeline video with transitions and optional audio.',
  },
  {
    icon: HiGlobeAmericas,
    title: 'For curious travellers',
    text: 'Open a destination and understand more than the photo: economy, people, region and local context.',
  },
];

const TestimonialsSection = () => {
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg={t.bg}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="Use cases"
              title="Built for people who want more than photo storage"
              subtitle="PhotoMap sits between a private gallery, a travel timeline, a world map and a lightweight research tool."
            />
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5} w="full">
            {USE_CASES.map((item, i) => (
              <MotionBox key={item.title} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.08 }} h="full">
                <VStack
                  align="start"
                  spacing={5}
                  h="full"
                  bg={t.surface}
                  border="1px solid"
                  borderColor={t.hairline}
                  borderRadius="8px"
                  boxShadow={t.shadowSm}
                  p={6}
                  transition="border-color .25s ease, box-shadow .25s ease, transform .25s ease"
                  _hover={{ borderColor: t.hairlineStrong, boxShadow: t.shadowMd, transform: 'translateY(-3px)' }}
                >
                  <Box display="inline-flex" p={3} borderRadius="8px" bg={t.primarySoftBg} color={t.primary}>
                    <Icon as={item.icon} boxSize={5} />
                  </Box>
                  <VStack align="start" spacing={2}>
                    <Heading fontSize="lg" fontWeight="700" color={t.text} letterSpacing="0">
                      {item.title}
                    </Heading>
                    <Text fontSize="sm" color={t.textSoft} lineHeight="1.7">
                      {item.text}
                    </Text>
                  </VStack>
                </VStack>
              </MotionBox>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;
