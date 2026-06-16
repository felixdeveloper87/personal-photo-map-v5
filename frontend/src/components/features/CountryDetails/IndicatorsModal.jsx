import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  HStack,
  VStack,
  Icon,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '@chakra-ui/react';
import {
  FaDollarSign, FaChartLine, FaBalanceScale, FaHandHoldingUsd,
  FaPercent, FaUsers, FaHeartbeat, FaWifi, FaCity, FaBook,
  FaSun, FaThermometerHalf, FaBolt, FaHospital, FaGlobe, FaMapMarkedAlt, FaPoundSign, FaAward,
  FaPrayingHands, FaUserFriends,
} from 'react-icons/fa';
import { fetchFullRanking } from '../../../data/worldBankService';
import { buildApiUrl } from '../../../utils/apiConfig';
import { useLandingTokens } from '../landing/landingUI';

const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

// Cartographic tones — shared with InfoBox.
const TONES = {
  amber: { icon: '#EBB572', soft: 'rgba(235,181,114,0.12)', border: 'rgba(235,181,114,0.30)', glow: 'rgba(235,181,114,0.22)' },
  teal: { icon: '#6FD0C4', soft: 'rgba(111,208,196,0.12)', border: 'rgba(111,208,196,0.30)', glow: 'rgba(111,208,196,0.22)' },
  rose: { icon: '#E58A7B', soft: 'rgba(229,138,123,0.12)', border: 'rgba(229,138,123,0.32)', glow: 'rgba(229,138,123,0.24)' },
};
const TONE_CYCLE = ['amber', 'teal', 'rose'];

export default function IndicatorsModal({ indicatorsData, weatherData, exchangeRate, countryInfo }) {
  const t = useLandingTokens();
  const [activeTab, setActiveTab] = useState('economic');
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [rankingData, setRankingData] = useState(null);
  const [loadingRanking, setLoadingRanking] = useState(false);
  const [isDistributionModalOpen, setIsDistributionModalOpen] = useState(false);
  const [distributionData, setDistributionData] = useState(null);
  const [distributionTitle, setDistributionTitle] = useState('');

  const tabs = [
    { id: 'economic', label: 'Economic', icon: FaDollarSign },
    { id: 'social', label: 'Social', icon: FaUsers },
    { id: 'infrastructure', label: 'Infrastructure', icon: FaBolt },
    { id: 'weather', label: 'Weather', icon: FaSun },
  ];

  // Ranking badge tone by percentile (top = teal, mid = amber, bottom = rose).
  const getRankStyle = (rankObj) => {
    if (!rankObj?.rank || !rankObj?.total) {
      return { tone: TONES.amber, medal: null };
    }
    const { rank, total } = rankObj;
    const percentile = rank / total;

    let medal = null;
    if (rank === 1) medal = '🥇';
    else if (rank === 2) medal = '🥈';
    else if (rank === 3) medal = '🥉';

    let tone = TONES.amber;
    if (percentile <= 0.25) tone = TONES.teal;
    else if (percentile >= 0.75) tone = TONES.rose;

    return { tone, medal };
  };

  const withRank = (key) => indicatorsData?.rankings?.[key] || null;

  const indicatorCodeMap = {
    'gdp': 'NY.GDP.MKTP.CD',
    'gdpGrowth': 'NY.GDP.MKTP.KD.ZG',
    'gdpPerCapitaCurrent': 'NY.GDP.PCAP.CD',
    'debtToGDP': 'GC.DOD.TOTL.GD.ZS',
    'inflationCPI': 'FP.CPI.TOTL.ZG',
    'lifeExpectancy': 'SP.DYN.LE00.IN',
    'internetUsers': 'IT.NET.USER.ZS',
    'urbanPopulation': 'SP.URB.TOTL.IN.ZS',
    'education': 'SE.ADT.LITR.ZS',
    'netMigration': 'SM.POP.NETM',
    'accessToEletricity': 'EG.ELC.ACCS.ZS',
    'healthExpenses': 'SH.XPD.CHEX.GD.ZS',
  };

  const handleOpenRanking = async (indicatorKey, year) => {
    setIsRankingModalOpen(true);
    setLoadingRanking(true);
    setRankingData(null);

    try {
      if (indicatorKey === 'hdi') {
        const backendUrl = buildApiUrl('/api/countries/hdi/ranking');
        const response = await fetch(backendUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch HDI ranking: ${response.status}`);
        }
        const ranking = await response.json();
        setRankingData(ranking);
        return;
      }

      const indicatorCode = indicatorCodeMap[indicatorKey];
      if (!indicatorCode) {
        console.error('Indicator code not found for key:', indicatorKey);
        setLoadingRanking(false);
        return;
      }

      const ranking = await fetchFullRanking(indicatorCode, year || '2024');
      setRankingData(ranking);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const economicData = [
    { icon: FaDollarSign, label: 'GDP (Total)', key: 'gdp', value: indicatorsData?.gdp?.value || 'N/A', year: indicatorsData?.gdp?.year, rank: withRank('gdp') },
    { icon: FaChartLine, label: 'GDP Growth', key: 'gdpGrowth', value: indicatorsData?.gdpGrowth?.value || 'N/A', year: indicatorsData?.gdpGrowth?.year, rank: withRank('gdpGrowth') },
    {
      icon: FaHandHoldingUsd,
      label: 'GDP Per Capita',
      key: 'gdpPerCapitaCurrent',
      value: indicatorsData?.gdpPerCapitaCurrent?.value
        ? `${indicatorsData.gdpPerCapitaCurrent.value.toLocaleString?.() || indicatorsData.gdpPerCapitaCurrent.value}`
        : 'N/A',
      year: indicatorsData?.gdpPerCapitaCurrent?.year,
      rank: withRank('gdpPerCapitaCurrent'),
    },
    { icon: FaBalanceScale, label: 'Public Debt (% GDP)', key: 'debtToGDP', value: indicatorsData?.debtToGDP?.value || 'N/A', year: indicatorsData?.debtToGDP?.year, rank: withRank('debtToGDP') },
    { icon: FaPercent, label: 'Inflation (CPI)', key: 'inflationCPI', value: indicatorsData?.inflationCPI?.value || 'N/A', year: indicatorsData?.inflationCPI?.year, rank: withRank('inflationCPI') },
    { icon: FaPoundSign, label: 'Exchange Rate', key: 'exchangeRate', value: exchangeRate ? `£1 = ${exchangeRate} ${countryInfo?.currency || 'USD'}` : 'N/A', rank: null },
  ];

  const socialData = [
    {
      icon: FaAward,
      label: 'Human Development Index (HDI)',
      key: 'hdi',
      value: indicatorsData?.hdi?.value
        ? typeof indicatorsData.hdi.value === 'number'
          ? indicatorsData.hdi.value.toFixed(3)
          : indicatorsData.hdi.value
        : 'N/A',
      year: indicatorsData?.hdi?.year,
      rank: withRank('hdi'),
    },
    { icon: FaHeartbeat, label: 'Life Expectancy', key: 'lifeExpectancy', value: indicatorsData?.lifeExpectancy?.value || 'N/A', year: indicatorsData?.lifeExpectancy?.year, rank: withRank('lifeExpectancy') },
    { icon: FaWifi, label: 'Internet Users (%)', key: 'internetUsers', value: indicatorsData?.internetUsers?.value || 'N/A', year: indicatorsData?.internetUsers?.year, rank: withRank('internetUsers') },
    { icon: FaCity, label: 'Urban Population (%)', key: 'urbanPopulation', value: indicatorsData?.urbanPopulation?.value || 'N/A', year: indicatorsData?.urbanPopulation?.year, rank: withRank('urbanPopulation') },
    { icon: FaBook, label: 'Literacy Rate', key: 'education', value: indicatorsData?.education?.value || 'N/A', year: indicatorsData?.education?.year, rank: withRank('education') },
    { icon: FaUsers, label: 'Net Migration', key: 'netMigration', value: indicatorsData?.netMigration?.value || 'N/A', year: indicatorsData?.netMigration?.year, rank: withRank('netMigration') },
    {
      icon: FaPrayingHands,
      label: 'Religion',
      key: 'religion',
      value: indicatorsData?.religion?.data ? 'View Distribution' : 'N/A',
      year: indicatorsData?.religion?.year,
      rank: null,
      isDistribution: true,
      distributionData: indicatorsData?.religion?.data,
    },
    {
      icon: FaUserFriends,
      label: 'Ethnic Groups',
      key: 'ethnicGroups',
      value: indicatorsData?.ethnicGroups?.data ? 'View Distribution' : 'N/A',
      year: indicatorsData?.ethnicGroups?.year,
      rank: null,
      isDistribution: true,
      distributionData: indicatorsData?.ethnicGroups?.data,
    },
  ];

  const infrastructureData = [
    { icon: FaBolt, label: 'Electricity Access (%)', key: 'accessToEletricity', value: indicatorsData?.accessToEletricity?.value || 'N/A', year: indicatorsData?.accessToEletricity?.year, rank: withRank('accessToEletricity') },
    { icon: FaHospital, label: 'Health Expenditure (% GDP)', key: 'healthExpenses', value: indicatorsData?.healthExpenses?.value || 'N/A', year: indicatorsData?.healthExpenses?.year, rank: withRank('healthExpenses') },
  ];

  const weatherDataList = [
    { icon: FaSun, label: 'Condition', value: weatherData?.description || 'N/A' },
    { icon: FaThermometerHalf, label: 'Temperature', value: weatherData?.temperature ? `${weatherData.temperature}°C` : 'N/A' },
    { icon: FaMapMarkedAlt, label: 'Coordinates', value: weatherData?.coord ? `${weatherData.coord.lat.toFixed(2)}, ${weatherData.coord.lon.toFixed(2)}` : 'N/A' },
  ];

  const dataMap = {
    economic: economicData,
    social: socialData,
    infrastructure: infrastructureData,
    weather: weatherDataList,
  };
  const currentData = dataMap[activeTab];

  const handleOpenDistribution = (title, data) => {
    setDistributionTitle(title);
    setDistributionData(data);
    setIsDistributionModalOpen(true);
  };

  const StatCard = ({ icon, label, value, tone, rank, year, indicatorKey, isDistribution, distributionData }) => {
    const style = getRankStyle(rank);
    const clickable = isDistribution && distributionData;

    return (
      <Box
        position="relative"
        bg={t.surfaceSubtle}
        border="1px solid"
        borderColor={t.hairline}
        borderRadius="12px"
        p={3.5}
        overflow="hidden"
        cursor={clickable ? 'pointer' : 'default'}
        onClick={clickable ? () => handleOpenDistribution(label, distributionData) : undefined}
        transition="border-color .2s ease, transform .2s ease, box-shadow .2s ease"
        _hover={clickable ? { transform: 'translateY(-2px)', boxShadow: t.shadowMd, borderColor: tone.border } : { borderColor: tone.border }}
        _before={{
          content: '""',
          position: 'absolute',
          top: '-40%',
          right: '-25%',
          w: '60%',
          h: '120%',
          bg: `radial-gradient(circle at center, ${tone.glow}, transparent 70%)`,
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      >
        <HStack spacing={3} align="center" position="relative">
          <Box
            w="40px"
            h="40px"
            minW="40px"
            borderRadius="11px"
            bg={tone.soft}
            border="1px solid"
            borderColor={tone.border}
            color={tone.icon}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
            boxShadow={`0 0 0 4px ${tone.soft}`}
          >
            <Icon as={icon} boxSize={4.5} />
          </Box>

          <VStack align="start" spacing={0.5} flex="1" minW={0}>
            <Text
              fontFamily={MONO}
              fontSize="10px"
              fontWeight="700"
              letterSpacing="0.08em"
              textTransform="uppercase"
              color={t.textMuted}
              noOfLines={1}
              maxW="full"
            >
              {label}
            </Text>
            <Text fontFamily={MONO} fontSize="md" fontWeight="700" color={t.text} noOfLines={1} maxW="full" lineHeight="1.25">
              {value}
            </Text>
            {year && (
              <Text fontFamily={MONO} fontSize="10px" color={t.textMuted}>
                {`YEAR ${year}`}
              </Text>
            )}
            {clickable && (
              <Text fontSize="11px" color={tone.icon} fontStyle="italic">
                Tap to view distribution
              </Text>
            )}
          </VStack>

          {rank && rank.rank && rank.total && (
            <Tooltip
              hasArrow
              placement="top"
              label={`Click to see the full ranking — based on ${rank.year || year || 'latest'} World Bank data`}
            >
              <HStack
                spacing={1}
                px={2.5}
                py={1}
                borderRadius="full"
                bg={style.tone.soft}
                border="1px solid"
                borderColor={style.tone.border}
                color={style.tone.icon}
                cursor="pointer"
                flexShrink={0}
                fontFamily={MONO}
                fontSize="xs"
                fontWeight="700"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenRanking(indicatorKey, rank.year || year);
                }}
                _hover={{ transform: 'scale(1.05)' }}
                transition="transform .2s ease"
              >
                {style.medal && <Box as="span" lineHeight={1}>{style.medal}</Box>}
                <Box as="span">{`#${rank.rank}/${rank.total}`}</Box>
              </HStack>
            </Tooltip>
          )}
        </HStack>
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <VStack spacing={1} mb={5} textAlign="center">
        <Text fontFamily={SERIF} fontSize="1.9rem" fontWeight="400" color={t.text} lineHeight="1.05">
          National Indicators Overview
        </Text>
        <Text fontFamily={MONO} fontSize="11px" letterSpacing="0.04em" color={t.textMuted}>
          World Bank · OpenWeatherMap · Wikipedia
        </Text>
      </VStack>

      {/* Tabs */}
      <HStack spacing={2} mb={5} justify="center" flexWrap="wrap">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <HStack
              key={tab.id}
              as="button"
              onClick={() => setActiveTab(tab.id)}
              spacing={1.5}
              px={3.5}
              py={1.5}
              borderRadius="full"
              fontSize="xs"
              fontWeight="700"
              bg={isActive ? t.primary : 'transparent'}
              color={isActive ? '#0A0C11' : t.textSoft}
              border="1px solid"
              borderColor={isActive ? t.primary : t.hairlineStrong}
              transition="all 0.2s ease"
              _hover={isActive ? {} : { bg: t.primarySoftBg, color: t.primary, borderColor: t.primary }}
            >
              <Icon as={tab.icon} boxSize={3.5} />
              <Box as="span">{tab.label}</Box>
            </HStack>
          );
        })}
      </HStack>

      {/* Grid */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
        {currentData.map((item, idx) => {
          const { key, icon, label, value, rank, year, isDistribution, distributionData } = item;
          return (
            <StatCard
              key={key || idx}
              icon={icon}
              label={label}
              value={value}
              tone={TONES[TONE_CYCLE[idx % TONE_CYCLE.length]]}
              rank={rank}
              year={year}
              indicatorKey={key}
              isDistribution={isDistribution}
              distributionData={distributionData}
            />
          );
        })}
      </SimpleGrid>

      {/* Footer */}
      <HStack spacing={1.5} justify="center" mt={6} pt={4} borderTop="1px solid" borderColor={t.hairline}>
        <Icon as={FaGlobe} color={t.primary} boxSize={3} />
        <Text fontFamily={MONO} fontSize="10px" letterSpacing="0.04em" color={t.textMuted}>
          Updated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </HStack>

      {/* Full Ranking Modal */}
      <Modal isOpen={isRankingModalOpen} onClose={() => setIsRankingModalOpen(false)} size="xl" scrollBehavior="inside" isCentered>
        <ModalOverlay bg="rgba(2, 6, 23, 0.55)" backdropFilter="blur(6px)" />
        <ModalContent bg={t.surfaceSolid} border="1px solid" borderColor={t.hairline} borderRadius="16px" maxH="80vh" overflow="hidden">
          <ModalHeader
            fontFamily={SERIF}
            fontWeight="400"
            fontSize="1.6rem"
            color={t.text}
            borderBottom="1px solid"
            borderColor={t.hairline}
          >
            Full Ranking{' '}
            <Box as="span" fontFamily={MONO} fontSize="sm" color={t.textMuted}>
              ({rankingData?.year || 'N/A'})
            </Box>
          </ModalHeader>
          <ModalCloseButton color={t.textMuted} borderRadius="10px" _hover={{ bg: t.surfaceSubtle, color: t.text }} />
          <ModalBody pb={6}>
            {loadingRanking ? (
              <VStack py={10} spacing={4}>
                <Spinner size="lg" color={t.primary} thickness="3px" speed="0.7s" />
                <Text fontFamily={MONO} fontSize="xs" letterSpacing="0.08em" textTransform="uppercase" color={t.textMuted}>
                  Loading ranking…
                </Text>
              </VStack>
            ) : rankingData && rankingData.ranking ? (
              <Box>
                <Text fontFamily={MONO} fontSize="xs" color={t.textMuted} mb={4}>
                  {`Total countries: ${rankingData.total}`}
                </Text>
                <Box overflowY="auto" maxH="50vh">
                  <Table variant="unstyled" size="sm">
                    <Thead position="sticky" top={0} bg={t.surfaceSolid} zIndex={1}>
                      <Tr>
                        <Th fontFamily={MONO} color={t.textMuted} borderColor={t.hairline}>Rank</Th>
                        <Th fontFamily={MONO} color={t.textMuted} borderColor={t.hairline}>Country</Th>
                        <Th fontFamily={MONO} color={t.textMuted} borderColor={t.hairline} isNumeric>Value</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {rankingData.ranking.slice(0, 50).map((item) => {
                        const top = item.position <= 3;
                        return (
                          <Tr key={item.position || item.countryCode || Math.random()} _hover={{ bg: t.surfaceSubtle }}>
                            <Td borderColor={t.hairline}>
                              <HStack spacing={2}>
                                {item.position === 1 && <span>🥇</span>}
                                {item.position === 2 && <span>🥈</span>}
                                {item.position === 3 && <span>🥉</span>}
                                <Text fontFamily={MONO} fontWeight={top ? '700' : '400'} color={top ? t.primary : t.textSoft}>
                                  {`#${item.position}`}
                                </Text>
                              </HStack>
                            </Td>
                            <Td borderColor={t.hairline}>
                              <Text fontWeight={top ? '700' : '500'} color={t.text}>
                                {item.countryName}
                              </Text>
                            </Td>
                            <Td borderColor={t.hairline} isNumeric>
                              <Text fontFamily={MONO} fontWeight={top ? '700' : '400'} color={t.textSoft}>
                                {item.formattedValue}
                              </Text>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                  {rankingData.ranking.length > 50 && (
                    <Text fontFamily={MONO} fontSize="11px" color={t.textMuted} mt={4} textAlign="center">
                      {`Showing top 50 of ${rankingData.total} countries`}
                    </Text>
                  )}
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={10}>
                <Text color={t.textSoft}>Failed to load ranking. Please try again.</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Distribution Modal (Religion / Ethnic Groups) */}
      <Modal isOpen={isDistributionModalOpen} onClose={() => setIsDistributionModalOpen(false)} size="lg" scrollBehavior="inside" isCentered>
        <ModalOverlay bg="rgba(2, 6, 23, 0.55)" backdropFilter="blur(6px)" />
        <ModalContent bg={t.surfaceSolid} border="1px solid" borderColor={t.hairline} borderRadius="16px" maxH="80vh" overflow="hidden">
          <ModalHeader fontFamily={SERIF} fontWeight="400" fontSize="1.6rem" color={t.text} borderBottom="1px solid" borderColor={t.hairline}>
            {distributionTitle} Distribution
          </ModalHeader>
          <ModalCloseButton color={t.textMuted} borderRadius="10px" _hover={{ bg: t.surfaceSubtle, color: t.text }} />
          <ModalBody pb={6}>
            {distributionData ? (
              <VStack spacing={4} align="stretch">
                {Object.entries(distributionData)
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, percentage], idx) => {
                    const tone = TONES[TONE_CYCLE[idx % TONE_CYCLE.length]];
                    const pct = typeof percentage === 'number' ? percentage : parseFloat(percentage) || 0;
                    return (
                      <Box key={name}>
                        <HStack justify="space-between" mb={1.5}>
                          <Text fontSize="sm" fontWeight="600" color={t.text}>
                            {name}
                          </Text>
                          <Text fontFamily={MONO} fontSize="sm" fontWeight="700" color={tone.icon}>
                            {`${pct.toFixed(1)}%`}
                          </Text>
                        </HStack>
                        <Box w="100%" h="10px" bg={t.surfaceSubtle} border="1px solid" borderColor={t.hairline} borderRadius="full" overflow="hidden">
                          <Box h="100%" bg={tone.icon} width={`${pct}%`} transition="width 0.6s ease" borderRadius="full" />
                        </Box>
                      </Box>
                    );
                  })}
              </VStack>
            ) : (
              <Text color={t.textSoft}>No data available</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
