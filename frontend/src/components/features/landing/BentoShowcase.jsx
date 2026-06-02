import React from 'react';
import {
  Box, Container, Grid, GridItem, VStack, HStack, Heading, Text, Icon, useColorModeValue,
} from '@chakra-ui/react';
import {
  HiMapPin, HiChartBarSquare, HiCalendarDays, HiVideoCamera, HiPlay,
  HiCheckBadge, HiSparkles,
} from 'react-icons/hi2';
import Flag from 'react-world-flags';
import MiniMap from './MiniMap';
import { useLandingTokens, SectionHeading, MotionBox, fadeInUp } from './landingUI';

/* ----------------------------- small visuals ----------------------------- */

const StatRow = ({ label, value, pct }) => {
  const t = useLandingTokens();
  return (
    <VStack align="stretch" spacing={1.5}>
      <HStack justify="space-between">
        <Text fontSize="sm" color={t.textSoft} fontWeight="500">{label}</Text>
        <Text fontSize="sm" color={t.text} fontWeight="700">{value}</Text>
      </HStack>
      <Box h="6px" borderRadius="full" bg={t.hairline} overflow="hidden">
        <Box h="full" w={`${pct}%`} borderRadius="full" bg={t.primary} />
      </Box>
    </VStack>
  );
};

const MapPanel = () => {
  const t = useLandingTokens();
  return (
    <Box flex="1" borderRadius="16px" overflow="hidden" border="1px solid" borderColor={t.hairline} minH={{ base: '210px', lg: '250px' }}>
      <MiniMap width="100%" height="100%" isStatic />
    </Box>
  );
};

const DataPanel = () => {
  const t = useLandingTokens();
  return (
    <Box flex="1" borderRadius="16px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} p={5}>
      <HStack justify="space-between" mb={4}>
        <HStack spacing={2.5}>
          <Box
            w="34px"
            h="34px"
            borderRadius="9px"
            bg={t.surface}
            border="1px solid"
            borderColor={t.hairline}
            display="flex"
            alignItems="center"
            justifyContent="center"
            overflow="hidden"
          >
            <Flag code="JP" fallback={<Text fontSize="11px" fontWeight="700" color={t.textSoft}>JP</Text>} style={{ width: 22, height: 16, borderRadius: 2, objectFit: 'cover' }} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontSize="sm" fontWeight="700" color={t.text}>Japan</Text>
            <Text fontSize="11px" color={t.textMuted}>World Bank · 2023</Text>
          </VStack>
        </HStack>
        <Icon as={HiCheckBadge} color={t.primary} boxSize={4} />
      </HStack>
      <VStack align="stretch" spacing={3.5}>
        <StatRow label="GDP per capita" value="$33,800" pct={62} />
        <StatRow label="Life expectancy" value="84 yrs" pct={92} />
        <StatRow label="Literacy rate" value="99%" pct={99} />
      </VStack>
    </Box>
  );
};

const DatePanel = () => {
  const t = useLandingTokens();
  const rows = [['2024', 128], ['2023', 94], ['2022', 60]];
  const max = 128;
  return (
    <Box flex="1" borderRadius="16px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} p={5} display="flex" alignItems="center">
      <VStack align="stretch" spacing={3.5} w="full">
        {rows.map(([year, count]) => (
          <HStack key={year} spacing={3}>
            <Text fontSize="xs" fontWeight="700" color={t.textSoft} w="34px">{year}</Text>
            <Box flex="1" h="6px" bg={t.hairline} borderRadius="full" overflow="hidden">
              <Box h="full" w={`${(count / max) * 100}%`} bg={t.primary} borderRadius="full" />
            </Box>
            <Text fontSize="11px" color={t.textMuted} w="62px" textAlign="right">{count} photos</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

const VideoPanel = () => {
  const t = useLandingTokens();
  const frameBg = useColorModeValue('#0F172A', '#1E293B');
  return (
    <Box flex="1" display="flex" alignItems="center" justifyContent="center" borderRadius="16px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} py={6}>
      <Box position="relative" w="92px" h="132px" borderRadius="12px" bg={frameBg} overflow="hidden" boxShadow={t.shadowMd}>
        <Box position="absolute" inset={0} bgGradient="linear(160deg, rgba(37,99,235,0.45), rgba(15,23,42,0.05))" />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          w="36px"
          h="36px"
          borderRadius="full"
          bg="whiteAlpha.900"
          display="flex"
          alignItems="center"
          justifyContent="center"
          boxShadow="0 6px 16px rgba(0,0,0,0.35)"
        >
          <Icon as={HiPlay} color="#0F172A" boxSize={4} ml="2px" />
        </Box>
      </Box>
    </Box>
  );
};

const SourceChips = () => {
  const t = useLandingTokens();
  const items = ['World Bank', 'UN Data', 'REST Countries'];
  return (
    <HStack spacing={2} flexWrap="wrap">
      {items.map((s) => (
        <HStack key={s} spacing={1.5} bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} borderRadius="full" px={2.5} py={1}>
          <Box w="5px" h="5px" borderRadius="full" bg={t.primary} />
          <Text fontSize="11px" fontWeight="600" color={t.textSoft}>{s}</Text>
        </HStack>
      ))}
    </HStack>
  );
};

/* ------------------------------ bento card ------------------------------- */

const BentoCard = ({ colSpan, minH, eyebrow, icon, title, desc, visual, footer, delay }) => {
  const t = useLandingTokens();
  return (
    <GridItem colSpan={{ base: 1, lg: colSpan }}>
      <MotionBox {...fadeInUp} transition={{ ...fadeInUp.transition, delay }} h="full">
        <VStack
          align="stretch"
          spacing={5}
          h="full"
          minH={{ lg: minH }}
          bg={t.surface}
          border="1px solid"
          borderColor={t.hairline}
          borderRadius="20px"
          boxShadow={t.shadowSm}
          p={{ base: 6, md: 7 }}
          transition="border-color .25s ease, box-shadow .25s ease, transform .25s ease"
          _hover={{ borderColor: t.hairlineStrong, boxShadow: t.shadowMd, transform: 'translateY(-3px)' }}
        >
          {visual}
          <VStack align="start" spacing={2}>
            <HStack spacing={2.5}>
              <Box display="inline-flex" p={2} borderRadius="10px" bg={t.primarySoftBg} color={t.primary}>
                <Icon as={icon} boxSize={4} />
              </Box>
              <Text fontSize="11px" fontWeight="700" letterSpacing="0.12em" textTransform="uppercase" color={t.textMuted}>
                {eyebrow}
              </Text>
            </HStack>
            <Heading fontSize="xl" fontWeight="700" color={t.text} letterSpacing="-0.01em">{title}</Heading>
            <Text fontSize="sm" color={t.textSoft} lineHeight="1.65">{desc}</Text>
            {footer}
          </VStack>
        </VStack>
      </MotionBox>
    </GridItem>
  );
};

/* ------------------------------- section --------------------------------- */

const BentoShowcase = () => {
  return (
    <Box as="section" py={{ base: 16, md: 24 }}>
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }} align="stretch">
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="What you can do"
              eyebrowIcon={HiSparkles}
              title="Everything your journey needs, in one place"
              subtitle="From the first upload to a shareable video — your photos, geography and real-world data, quietly connected."
            />
          </MotionBox>

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={5}>
            <BentoCard
              colSpan={7}
              minH="340px"
              eyebrow="Map"
              icon={HiMapPin}
              title="Mapped by country"
              desc="Every photo lands on an interactive world map, grouped by the place it was taken — your travels become a picture you can read at a glance."
              visual={<MapPanel />}
              delay={0}
            />
            <BentoCard
              colSpan={5}
              minH="340px"
              eyebrow="Data"
              icon={HiChartBarSquare}
              title="Real country data"
              desc="Economic and social indicators for every destination, straight from the World Bank."
              visual={<DataPanel />}
              delay={0.08}
            />
            <BentoCard
              colSpan={4}
              minH="260px"
              eyebrow="Timeline"
              icon={HiCalendarDays}
              title="Organized by date"
              desc="Your library sorts itself into a clean, chronological journey."
              visual={<DatePanel />}
              delay={0.04}
            />
            <BentoCard
              colSpan={4}
              minH="260px"
              eyebrow="Video"
              icon={HiVideoCamera}
              title="Export social videos"
              desc="Turn a trip into a polished clip for Reels, TikTok and Shorts."
              visual={<VideoPanel />}
              delay={0.12}
            />
            <BentoCard
              colSpan={4}
              minH="260px"
              eyebrow="Coverage"
              icon={HiCheckBadge}
              title="Built on trusted sources"
              desc="195+ countries with indicators refreshed continuously from authoritative databases."
              footer={<SourceChips />}
              delay={0.16}
            />
          </Grid>
        </VStack>
      </Container>
    </Box>
  );
};

export default BentoShowcase;
