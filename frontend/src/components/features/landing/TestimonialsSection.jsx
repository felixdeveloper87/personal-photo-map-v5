import React from 'react';
import { Box, Container, VStack, HStack, Heading, Text, SimpleGrid, Icon } from '@chakra-ui/react';
import { HiStar } from 'react-icons/hi2';
import { useLandingTokens, SectionHeading, MotionBox, fadeInUp } from './landingUI';

const TESTIMONIALS = [
  {
    name: 'Dr. Sarah Johnson',
    role: 'Geography Professor · NYU',
    initials: 'SJ',
    text: 'It makes complex development concepts accessible. The real-time data and interactive map are now part of how I teach.',
  },
  {
    name: 'Michael Chen',
    role: 'International Business Analyst · London',
    initials: 'MC',
    text: 'Perfect for understanding the economic and social profile of countries I visit. The World Bank integration is invaluable.',
  },
  {
    name: 'Emma Rodriguez',
    role: 'Cultural Anthropologist · Barcelona',
    initials: 'ER',
    text: 'Exploring cultural data alongside my own travel photos feels like having a living world encyclopedia.',
  },
];

const TestimonialsSection = () => {
  const t = useLandingTokens();

  return (
    <Box as="section" py={{ base: 16, md: 24 }}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }}>
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="Trusted in the field"
              title="Built for educators, researchers and travellers"
              subtitle="People who work with the world's data every day rely on it to teach, research and explore."
            />
          </MotionBox>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} w="full">
            {TESTIMONIALS.map((item, i) => (
              <MotionBox key={item.name} {...fadeInUp} transition={{ ...fadeInUp.transition, delay: i * 0.08 }} h="full">
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
                  <HStack spacing={1}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Icon key={s} as={HiStar} color={t.accent} boxSize={4} />
                    ))}
                  </HStack>

                  <Text fontSize="md" color={t.text} lineHeight="1.7" flex="1">
                    “{item.text}”
                  </Text>

                  <HStack spacing={3} pt={1}>
                    <Box
                      w="42px"
                      h="42px"
                      borderRadius="full"
                      bg={t.primarySoftBg}
                      color={t.primary}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="700"
                      fontSize="sm"
                      letterSpacing="0.02em"
                    >
                      {item.initials}
                    </Box>
                    <VStack align="start" spacing={0}>
                      <Text fontSize="sm" fontWeight="700" color={t.text}>{item.name}</Text>
                      <Text fontSize="xs" color={t.textMuted}>{item.role}</Text>
                    </VStack>
                  </HStack>
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
