/* eslint-disable react/prop-types */
import { Box, Container, Grid, GridItem, HStack, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import { HiChartBarSquare, HiMapPin, HiPlay, HiSparkles, HiVideoCamera } from 'react-icons/hi2';
import { Accent, GlowCard, MONO, MotionBox, SERIF, SectionHeading, fadeInUp, useLandingTokens } from './landingUI';

const StatRow = ({ label, value, pct }) => {
  const t = useLandingTokens();
  return (
    <VStack align="stretch" spacing={1.5}>
      <HStack justify="space-between">
        <Text fontSize="sm" color={t.textSoft} fontWeight="500">
          {label}
        </Text>
        <Text fontSize="sm" color={t.text} fontWeight="700">
          {value}
        </Text>
      </HStack>
      <Box h="6px" borderRadius="full" bg="rgba(236,231,220,0.08)" overflow="hidden">
        <Box h="full" w={`${pct}%`} borderRadius="full" bg={t.accent} />
      </Box>
    </VStack>
  );
};

const CountryTimelinePanel = () => {
  const t = useLandingTokens();
  const rows = [
    ['Portugal', '2024', 42, t.primary],
    ['Japan', '2023', 31, t.accent],
    ['Iceland', '2022', 18, t.rose],
  ];
  const max = 42;
  return (
    <VStack align="stretch" spacing={4} borderRadius="14px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} p={5}>
      {rows.map(([country, year, count, color]) => (
        <HStack key={country} spacing={3}>
          <Box w="8px" h="8px" borderRadius="2px" bg={color} flexShrink={0} />
          <Box minW="84px">
            <Text color={t.text} fontSize="sm" fontWeight="700">
              {country}
            </Text>
            <Text color={t.textMuted} fontSize="11px">
              {year}
            </Text>
          </Box>
          <Box flex="1" h="7px" borderRadius="full" bg="rgba(236,231,220,0.08)" overflow="hidden">
            <Box h="full" w={`${(count / max) * 100}%`} bg={color} borderRadius="full" />
          </Box>
          <Text color={t.textSoft} fontSize="11px" minW="54px" textAlign="right">
            {count} photos
          </Text>
        </HStack>
      ))}
    </VStack>
  );
};

const DataPanel = () => {
  const t = useLandingTokens();
  return (
    <VStack align="stretch" spacing={4} borderRadius="14px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} p={5}>
      <HStack justify="space-between">
        <VStack align="start" spacing={0}>
          <Text color={t.text} fontSize="sm" fontWeight="700">
            Japan
          </Text>
          <Text color={t.textMuted} fontSize="11px">
            World Bank indicators
          </Text>
        </VStack>
        <Text color={t.primary} fontFamily="'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace" fontSize="12px">
          JP
        </Text>
      </HStack>
      <StatRow label="Life expectancy" value="84 yrs" pct={92} />
      <StatRow label="Internet users" value="85%" pct={85} />
      <StatRow label="GDP per capita" value="$33.8k" pct={62} />
    </VStack>
  );
};

const VideoPanel = () => {
  const t = useLandingTokens();
  return (
    <Box position="relative" h="174px" borderRadius="14px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} overflow="hidden">
      <Box as="img" src="/cities/santorini.jpg" alt="" position="absolute" inset={0} w="full" h="full" objectFit="cover" filter="saturate(0.85)" />
      <Box position="absolute" inset={0} bgGradient="linear(to-t, rgba(8,10,15,0.9), rgba(8,10,15,0.35))" />
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="92px"
        h="132px"
        borderRadius="14px"
        bg="rgba(10,12,17,0.78)"
        border="1px solid"
        borderColor={t.hairline}
        display="flex"
        alignItems="center"
        justifyContent="center"
        boxShadow={t.shadowMd}
      >
        <Box
          w="42px"
          h="42px"
          borderRadius="full"
          bg={t.primary}
          color={t.bg}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Icon as={HiPlay} boxSize={5} ml="2px" />
        </Box>
      </Box>
      <HStack position="absolute" left={4} bottom={4} spacing={2}>
        <Box w="7px" h="7px" borderRadius="full" bg={t.accent} />
        <Text color={t.textSoft} fontSize="12px">
          vertical or landscape export
        </Text>
      </HStack>
    </Box>
  );
};

const BentoCard = ({ eyebrow, icon, title, desc, visual, footer, delay }) => {
  const t = useLandingTokens();
  return (
    <GridItem>
      <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay }} h="full">
        <GlowCard h="full" p={{ base: 5, md: 6 }}>
          <VStack align="stretch" spacing={6} h="full">
            {visual}
            <VStack align="start" spacing={2.5} mt="auto">
              <HStack spacing={2}>
                <Icon as={icon} boxSize={3.5} color={t.primary} />
                <Text fontSize="11px" fontWeight="600" letterSpacing="0.14em" textTransform="uppercase" color={t.textMuted} fontFamily={MONO}>
                  {eyebrow}
                </Text>
              </HStack>
              <Heading fontFamily={SERIF} fontSize={{ base: '1.7rem', md: '1.9rem' }} fontWeight="400" color={t.text} letterSpacing="-0.01em" lineHeight="1.1">
                {title}
              </Heading>
              <Text fontSize="sm" color={t.textSoft} lineHeight="1.7" maxW="460px">
                {desc}
              </Text>
              {footer}
            </VStack>
          </VStack>
        </GlowCard>
      </MotionBox>
    </GridItem>
  );
};

const BentoShowcase = () => {
  const t = useLandingTokens();

  return (
    <Box id="features" as="section" py={{ base: 14, md: 24 }} bg={t.bg} scrollMarginTop="110px">
      <Container maxW="container.xl">
        <VStack spacing={{ base: 10, md: 14 }} align="stretch">
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="What it does"
              eyebrowIcon={HiSparkles}
              title={<>A travel library that knows <Accent>place, time</Accent> and context</>}
              subtitle="Your photos, connected to where and when they were taken, to what makes each destination unique, and to the story you want to tell."
            />
          </MotionBox>

          <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={5}>
            <BentoCard
              eyebrow="Countries"
              icon={HiMapPin}
              title="Organized by country and year"
              desc="Upload your photos and the year is read from EXIF or file data. Every destination keeps its own timeline."
              visual={<CountryTimelinePanel />}
              delay={0}
            />
            <BentoCard
              eyebrow="Insights"
              icon={HiChartBarSquare}
              title="Real context for every place"
              desc="Economic, social and geographic indicators for the countries behind your photos."
              visual={<DataPanel />}
              delay={0.08}
            />
            <BentoCard
              eyebrow="Video"
              icon={HiVideoCamera}
              title="Every trip, a film"
              desc="Turn a country gallery into a vertical or landscape video with transitions and audio."
              visual={<VideoPanel />}
              delay={0.16}
            />
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default BentoShowcase;
