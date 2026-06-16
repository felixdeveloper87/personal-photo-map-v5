import { Box, Container, HStack, Heading, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { HiArrowUpTray, HiCalendarDays, HiChartBarSquare, HiVideoCamera } from 'react-icons/hi2';
import { MotionBox, SectionHeading, fadeInUp, useLandingTokens } from './landingUI';

const STEPS = [
  {
    n: '01',
    icon: HiArrowUpTray,
    title: 'Upload photos',
    desc: 'Select images for a country collection and review the metadata PhotoMap can read from each file.',
  },
  {
    n: '02',
    icon: HiCalendarDays,
    title: 'Keep the right year',
    desc: 'Use EXIF or file date automatically, or set a manual year when older files need correction.',
  },
  {
    n: '03',
    icon: HiChartBarSquare,
    title: 'Explore the destination',
    desc: 'Open country pages with indicators, regional context and details from trusted data sources.',
  },
  {
    n: '04',
    icon: HiVideoCamera,
    title: 'Generate a timeline',
    desc: 'Create a share-ready video from the photos in your trip, with format and transition controls.',
  },
];

const HowItWorksSection = () => {
  const t = useLandingTokens();

  return (
    <Box
      id="workflow"
      as="section"
      py={{ base: 16, md: 24 }}
      bg={t.bg2}
      borderY="1px solid"
      borderColor={t.hairline}
      scrollMarginTop="110px"
    >
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="Workflow"
              title="From camera roll to mapped travel story"
              subtitle="The path stays practical: upload, organize by year, learn from the destination, then turn the gallery into a video."
            />
          </MotionBox>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} w="full">
            {STEPS.map((step, i) => (
              <MotionBox key={step.n} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.08 }} h="full">
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
                  <HStack justify="space-between" w="full">
                    <Box display="inline-flex" p={3} borderRadius="8px" bg={t.primarySoftBg} color={t.primary}>
                      <Icon as={step.icon} boxSize={5} />
                    </Box>
                    <Text fontSize="sm" fontWeight="800" color={t.textMuted}>
                      {step.n}
                    </Text>
                  </HStack>
                  <VStack align="start" spacing={2}>
                    <Heading fontSize="lg" fontWeight="700" color={t.text} letterSpacing="0">
                      {step.title}
                    </Heading>
                    <Text fontSize="sm" color={t.textSoft} lineHeight="1.65">
                      {step.desc}
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

export default HowItWorksSection;
