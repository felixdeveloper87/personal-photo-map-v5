import { Box, Container, Heading, Icon, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { HiArrowUpTray, HiCalendarDays, HiChartBarSquare, HiVideoCamera } from 'react-icons/hi2';
import { Accent, MotionBox, SERIF, SectionHeading, fadeInUp, useLandingTokens } from './landingUI';

const STEPS = [
  {
    n: '01',
    icon: HiArrowUpTray,
    title: 'Upload',
    desc: 'Choose a country and drop in your photos. PhotoMap reads what each file already knows.',
  },
  {
    n: '02',
    icon: HiCalendarDays,
    title: 'Organize',
    desc: 'The year comes from EXIF or file data automatically, and older files can be corrected by hand.',
  },
  {
    n: '03',
    icon: HiChartBarSquare,
    title: 'Discover',
    desc: 'Open each destination with real indicators, regional context and trusted data sources.',
  },
  {
    n: '04',
    icon: HiVideoCamera,
    title: 'Share',
    desc: 'Turn the trip into a vertical or landscape film, with transitions and optional audio.',
  },
];

const HowItWorksSection = () => {
  const t = useLandingTokens();

  return (
    <Box
      id="workflow"
      as="section"
      py={{ base: 20, md: 32 }}
      bg={t.bg2}
      borderY="1px solid"
      borderColor={t.hairline}
      scrollMarginTop="110px"
    >
      <Container maxW="container.xl">
        <VStack spacing={{ base: 14, md: 20 }}>
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="How it works"
              title={
                <>
                  From camera roll to <Accent>travel story</Accent>
                </>
              }
              subtitle="Four quiet steps. No folders to manage, no spreadsheets to keep."
            />
          </MotionBox>

          <Box position="relative" w="full">
            {/* Connecting rule behind the step nodes (desktop) */}
            <Box
              aria-hidden
              display={{ base: 'none', lg: 'block' }}
              position="absolute"
              top="27px"
              left="28px"
              right="28px"
              h="1px"
              bgGradient={`linear(to-r, ${t.primary}, rgba(235,181,114,0.25) 60%, rgba(111,208,196,0.4))`}
              opacity={0.5}
            />
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacingX={{ base: 8, lg: 10 }} spacingY={12} w="full">
              {STEPS.map((step, i) => (
                <MotionBox key={step.n} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.1 }}>
                  <VStack align="start" spacing={6}>
                    <Box
                      position="relative"
                      w="56px"
                      h="56px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bg={t.bg2}
                      border="1px solid"
                      borderColor="rgba(235,181,114,0.35)"
                      color={t.primary}
                      boxShadow="0 0 0 6px #0E1118, 0 0 32px rgba(235,181,114,0.15)"
                    >
                      <Icon as={step.icon} boxSize={5} />
                    </Box>
                    <VStack align="start" spacing={3}>
                      <Text
                        fontFamily={SERIF}
                        fontStyle="italic"
                        fontSize="5xl"
                        lineHeight="0.8"
                        color="transparent"
                        sx={{ WebkitTextStroke: '1px rgba(235,181,114,0.55)' }}
                      >
                        {step.n}
                      </Text>
                      <Heading fontFamily={SERIF} fontWeight="400" fontSize="2rem" color={t.text} letterSpacing="-0.01em">
                        {step.title}
                      </Heading>
                      <Text fontSize="sm" color={t.textSoft} lineHeight="1.75" maxW="280px">
                        {step.desc}
                      </Text>
                    </VStack>
                  </VStack>
                </MotionBox>
              ))}
            </SimpleGrid>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default HowItWorksSection;
