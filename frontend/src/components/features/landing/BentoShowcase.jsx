/* eslint-disable react/prop-types */
import { Box, Container, Grid, GridItem, HStack, Heading, Icon, Text, VStack } from '@chakra-ui/react';
import {
  HiArrowUpTray,
  HiChartBarSquare,
  HiCheckBadge,
  HiLockClosed,
  HiMapPin,
  HiPlay,
  HiSparkles,
  HiVideoCamera,
} from 'react-icons/hi2';
import { MotionBox, SectionHeading, fadeInUp, useLandingTokens } from './landingUI';

const SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=700&q=80';

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

const UploadPanel = () => {
  const t = useLandingTokens();
  return (
    <Box position="relative" h="230px" borderRadius="8px" overflow="hidden" bg={t.bg2} border="1px solid" borderColor={t.hairline}>
      <Box
        position="absolute"
        inset={0}
        opacity={0.36}
        backgroundImage="linear-gradient(rgba(236,231,220,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(236,231,220,0.07) 1px, transparent 1px)"
        backgroundSize="52px 52px"
      />
      <Box
        position="absolute"
        left={{ base: 5, md: 7 }}
        top={6}
        w="118px"
        h="154px"
        borderRadius="6px"
        bg="#ECE6D8"
        p="7px"
        transform="rotate(-5deg)"
        boxShadow="0 18px 42px rgba(0,0,0,0.46)"
      >
        <Box as="img" src={SAMPLE_PHOTO} alt="Lisbon travel memory" w="full" h="112px" objectFit="cover" borderRadius="4px" />
        <Text mt={2} color="#2F2921" fontSize="10px" fontWeight="800">
          LISBON / 2024
        </Text>
      </Box>
      <VStack
        position="absolute"
        right={{ base: 4, md: 7 }}
        bottom={6}
        align="start"
        spacing={2}
        bg="rgba(10,12,17,0.62)"
        border="1px solid"
        borderColor={t.hairline}
        borderRadius="8px"
        p={4}
      >
        <HStack spacing={2}>
          <Icon as={HiCheckBadge} color={t.primary} boxSize={4} />
          <Text color={t.text} fontWeight="700" fontSize="sm">
            Metadata read
          </Text>
        </HStack>
        <Text color={t.textSoft} fontSize="12px">
          Year from EXIF or file date
        </Text>
        <Text color={t.primary} fontFamily="'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace" fontSize="11px">
          GPS badge when available
        </Text>
      </VStack>
    </Box>
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
    <VStack align="stretch" spacing={4} borderRadius="8px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} p={5}>
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
    <VStack align="stretch" spacing={4} borderRadius="8px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} p={5}>
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
    <Box position="relative" h="174px" borderRadius="8px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} overflow="hidden">
      <Box position="absolute" inset={0} bgGradient="linear(135deg, rgba(235,181,114,0.22), rgba(111,208,196,0.12), rgba(229,138,123,0.12))" />
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="92px"
        h="132px"
        borderRadius="8px"
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

const SourceChips = () => {
  const t = useLandingTokens();
  const items = ['World Bank', 'REST Countries', 'Local photo library'];
  return (
    <HStack spacing={2} flexWrap="wrap">
      {items.map((s) => (
        <HStack key={s} spacing={1.5} bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} borderRadius="full" px={2.5} py={1}>
          <Box w="5px" h="5px" borderRadius="full" bg={t.primary} />
          <Text fontSize="11px" fontWeight="600" color={t.textSoft}>
            {s}
          </Text>
        </HStack>
      ))}
    </HStack>
  );
};

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
          borderRadius="8px"
          boxShadow={t.shadowSm}
          p={{ base: 5, md: 6 }}
          transition="border-color .25s ease, box-shadow .25s ease, transform .25s ease"
          _hover={{ borderColor: t.hairlineStrong, boxShadow: t.shadowMd, transform: 'translateY(-3px)' }}
        >
          {visual}
          <VStack align="start" spacing={2}>
            <HStack spacing={2.5}>
              <Box display="inline-flex" p={2} borderRadius="8px" bg={t.primarySoftBg} color={t.primary}>
                <Icon as={icon} boxSize={4} />
              </Box>
              <Text fontSize="11px" fontWeight="700" letterSpacing="0" textTransform="uppercase" color={t.textMuted}>
                {eyebrow}
              </Text>
            </HStack>
            <Heading fontSize="xl" fontWeight="700" color={t.text} letterSpacing="0">
              {title}
            </Heading>
            <Text fontSize="sm" color={t.textSoft} lineHeight="1.65">
              {desc}
            </Text>
            {footer}
          </VStack>
        </VStack>
      </MotionBox>
    </GridItem>
  );
};

const BentoShowcase = () => {
  const t = useLandingTokens();

  return (
    <Box id="features" as="section" py={{ base: 16, md: 24 }} bg={t.bg} scrollMarginTop="110px">
      <Container maxW="container.xl">
        <VStack spacing={{ base: 12, md: 16 }} align="stretch">
          <MotionBox {...fadeInUp}>
            <SectionHeading
              eyebrow="Product features"
              eyebrowIcon={HiSparkles}
              title="A travel library that knows place, time and context"
              subtitle="PhotoMap connects your uploaded images with country, year, map exploration, destination data and timeline video creation."
            />
          </MotionBox>

          <Grid templateColumns={{ base: '1fr', lg: 'repeat(12, 1fr)' }} gap={5}>
            <BentoCard
              colSpan={7}
              minH="390px"
              eyebrow="Upload"
              icon={HiArrowUpTray}
              title="Read metadata before upload"
              desc="PhotoMap reads the year from EXIF or file data and shows whether GPS metadata exists before the images are saved."
              visual={<UploadPanel />}
              delay={0}
            />
            <BentoCard
              colSpan={5}
              minH="390px"
              eyebrow="Countries"
              icon={HiMapPin}
              title="Organized by country and year"
              desc="Your photo library becomes easier to scan because each destination keeps its own chronological collection."
              visual={<CountryTimelinePanel />}
              delay={0.08}
            />
            <BentoCard
              colSpan={4}
              minH="300px"
              eyebrow="Data"
              icon={HiChartBarSquare}
              title="Country insights"
              desc="Explore economic, social and geographic indicators for the places connected to your photos."
              visual={<DataPanel />}
              delay={0.04}
            />
            <BentoCard
              colSpan={4}
              minH="300px"
              eyebrow="Video"
              icon={HiVideoCamera}
              title="Timeline video export"
              desc="Turn a country gallery into a polished video with configurable duration, transitions, resolution and audio."
              visual={<VideoPanel />}
              delay={0.12}
            />
            <BentoCard
              colSpan={4}
              minH="300px"
              eyebrow="Privacy"
              icon={HiLockClosed}
              title="Built around your account"
              desc="Uploads are tied to authenticated users, with country collections fetched only for the signed-in account."
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
