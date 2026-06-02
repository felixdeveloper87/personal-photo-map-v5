import React from 'react';
import { Box, Container, VStack, HStack, Heading, Text, SimpleGrid, Icon } from '@chakra-ui/react';
import { HiArrowUpTray, HiMapPin, HiAcademicCap, HiVideoCamera } from 'react-icons/hi2';
import { useLandingTokens, SectionHeading, MotionBox, fadeInUp } from './landingUI';

const STEPS = [
  { n: '01', icon: HiArrowUpTray, title: 'Upload your photos', desc: 'Add your travel photos — location and date are read automatically from each file.' },
  { n: '02', icon: HiMapPin, title: 'See them mapped', desc: 'Photos are grouped by country and date on an interactive world map.' },
  { n: '03', icon: HiAcademicCap, title: 'Learn the destination', desc: 'Explore GDP, population, literacy and cultural facts from the World Bank.' },
  { n: '04', icon: HiVideoCamera, title: 'Export & share', desc: 'Generate a polished video slideshow, ready for Instagram and TikTok.' },
];

const HowItWorksSection = () => {
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 16, md: 24 }} bg={t.surfaceSubtle} borderTop="1px solid" borderBottom="1px solid" borderColor={t.hairline}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="How it works"
              title="Four steps to a smarter journey"
              subtitle="From upload to insight to share — everything is connected, with nothing to set up."
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
                  borderRadius="20px"
                  boxShadow={t.shadowSm}
                  p={7}
                  transition="border-color .25s ease, box-shadow .25s ease, transform .25s ease"
                  _hover={{ borderColor: t.hairlineStrong, boxShadow: t.shadowMd, transform: 'translateY(-3px)' }}
                >
                  <HStack justify="space-between" w="full">
                    <Box display="inline-flex" p={3} borderRadius="12px" bg={t.primarySoftBg} color={t.primary}>
                      <Icon as={step.icon} boxSize={5} />
                    </Box>
                    <Text fontSize="sm" fontWeight="800" color={t.textMuted} letterSpacing="0.05em">{step.n}</Text>
                  </HStack>
                  <VStack align="start" spacing={2}>
                    <Heading fontSize="lg" fontWeight="700" color={t.text} letterSpacing="-0.01em">{step.title}</Heading>
                    <Text fontSize="sm" color={t.textSoft} lineHeight="1.65">{step.desc}</Text>
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
