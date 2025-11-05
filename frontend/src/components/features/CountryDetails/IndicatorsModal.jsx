import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  HStack,
  VStack,
  Badge,
  useColorModeValue,
  Divider,
  Heading,
  Icon,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
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
  FaSun, FaThermometerHalf, FaBolt, FaHospital, FaGlobe, FaMapMarkedAlt, FaPoundSign,
  FaList,
} from 'react-icons/fa';
import { fetchFullRanking } from '../../../data/worldBankService';

/**
 * indicatorsData esperado (exemplos):
 * {
 *   gdpPerCapitaCurrent: { value: "$45,800", year: "2022" },
 *   lifeExpectancy: { value: "82.1 years", year: "2022" },
 *   inflationCPI: { value: "4.3%", year: "2022" },
 *   rankings: {
 *     gdpPerCapitaCurrent: { rank: 27, total: 196, year: "2022" },
 *     lifeExpectancy: { rank: 18, total: 196, year: "2022" },
 *     inflationCPI: { rank: 102, total: 196, year: "2022" }
 *   }
 * }
 */

export default function IndicatorsModal({ indicatorsData, weatherData, exchangeRate, countryInfo }) {
  const [activeTab, setActiveTab] = useState('economic');
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [rankingData, setRankingData] = useState(null);
  const [loadingRanking, setLoadingRanking] = useState(false);

  const bg = useColorModeValue('gray.50', '#0e1015');
  const cardBg = useColorModeValue('white', 'gray.800');
  const border = useColorModeValue('gray.200', 'gray.700');
  const text = useColorModeValue('gray.700', 'gray.300');
  const heading = useColorModeValue('gray.900', 'white');

  const tabs = [
    { id: 'economic', label: 'Economy', icon: FaDollarSign, color: 'green' },
    { id: 'social', label: 'Society', icon: FaUsers, color: 'blue' },
    { id: 'infrastructure', label: 'Infrastructure', icon: FaBolt, color: 'teal' },
    { id: 'weather', label: 'Weather', icon: FaSun, color: 'orange' },
  ];

  // Helpers visuais para ranking
  const getRankStyle = (rankObj) => {
    if (!rankObj?.rank || !rankObj?.total) {
      return { badgeColor: 'gray', label: '', medal: null };
    }
    const { rank, total } = rankObj;
    const percentile = rank / total; // menor = melhor posição

    // Medalhas top 3
    let medal = null;
    if (rank === 1) medal = '🥇';
    else if (rank === 2) medal = '🥈';
    else if (rank === 3) medal = '🥉';

    // Cores por faixa
    // top 25% => verde | meio 50% => amarelo | bottom 25% => vermelho
    let badgeColor = 'yellow';
    if (percentile <= 0.25) badgeColor = 'green';
    else if (percentile >= 0.75) badgeColor = 'red';

    const label = `#${rank} / ${total}`;

    return { badgeColor, label, medal };
  };

  const withRank = (key) => indicatorsData?.rankings?.[key] || null;

  const handleOpenRanking = async () => {
    setIsRankingModalOpen(true);
    setLoadingRanking(true);
    setRankingData(null);
    
    try {
      const year = indicatorsData?.gdp?.year || '2024';
      const ranking = await fetchFullRanking('NY.GDP.MKTP.CD', year);
      setRankingData(ranking);
    } catch (error) {
      console.error('Error fetching ranking:', error);
    } finally {
      setLoadingRanking(false);
    }
  };

  const economicData = [
    {
      icon: FaDollarSign,
      label: 'GDP (Total)',
      key: 'gdp',
      value: indicatorsData?.gdp?.value || 'N/A',
      year: indicatorsData?.gdp?.year,
      color: 'green',
      rank: withRank('gdp'),
    },
    {
      icon: FaChartLine,
      label: 'GDP Growth',
      key: 'gdpGrowth',
      value: indicatorsData?.gdpGrowth?.value || 'N/A',
      year: indicatorsData?.gdpGrowth?.year,
      color: 'green',
      rank: withRank('gdpGrowth'),
    },
    {
      icon: FaHandHoldingUsd,
      label: 'GDP Per Capita',
      key: 'gdpPerCapitaCurrent',
      value: indicatorsData?.gdpPerCapitaCurrent?.value
        ? `${indicatorsData.gdpPerCapitaCurrent.value.toLocaleString?.() || indicatorsData.gdpPerCapitaCurrent.value}`
        : 'N/A',
      year: indicatorsData?.gdpPerCapitaCurrent?.year,
      color: 'green',
      rank: withRank('gdpPerCapitaCurrent'),
    },
    {
      icon: FaBalanceScale,
      label: 'Public Debt (% GDP)',
      key: 'debtToGDP',
      value: indicatorsData?.debtToGDP?.value || 'N/A',
      year: indicatorsData?.debtToGDP?.year,
      color: 'orange',
      rank: withRank('debtToGDP'),
    },
    {
      icon: FaPercent,
      label: 'Inflation (CPI)',
      key: 'inflationCPI',
      value: indicatorsData?.inflationCPI?.value || 'N/A',
      year: indicatorsData?.inflationCPI?.year,
      color: 'red',
      rank: withRank('inflationCPI'),
    },
    {
      icon: FaPoundSign,
      label: 'Exchange Rate',
      key: 'exchangeRate',
      value: exchangeRate ? `£1 = ${exchangeRate} ${countryInfo?.currency || 'USD'}` : 'N/A',
      color: 'teal',
      rank: null, // não ranqueia câmbio bilateral
    },
  ];

  const socialData = [
    {
      icon: FaHeartbeat,
      label: 'Life Expectancy',
      key: 'lifeExpectancy',
      value: indicatorsData?.lifeExpectancy?.value || 'N/A',
      year: indicatorsData?.lifeExpectancy?.year,
      color: 'pink',
      rank: withRank('lifeExpectancy'),
    },
    {
      icon: FaWifi,
      label: 'Internet Users (%)',
      key: 'internetUsers',
      value: indicatorsData?.internetUsers?.value || 'N/A',
      year: indicatorsData?.internetUsers?.year,
      color: 'blue',
      rank: withRank('internetUsers'),
    },
    {
      icon: FaCity,
      label: 'Urban Population (%)',
      key: 'urbanPopulation',
      value: indicatorsData?.urbanPopulation?.value || 'N/A',
      year: indicatorsData?.urbanPopulation?.year,
      color: 'purple',
      rank: withRank('urbanPopulation'),
    },
    {
      icon: FaBook,
      label: 'Literacy Rate',
      key: 'education',
      value: indicatorsData?.education?.value || 'N/A',
      year: indicatorsData?.education?.year,
      color: 'cyan',
      rank: withRank('education'),
    },
    {
      icon: FaUsers,
      label: 'Net Migration',
      key: 'netMigration',
      value: indicatorsData?.netMigration?.value || 'N/A',
      year: indicatorsData?.netMigration?.year,
      color: 'indigo',
      rank: withRank('netMigration'),
    },
  ];

  const infrastructureData = [
    {
      icon: FaBolt,
      label: 'Electricity Access (%)',
      key: 'accessToEletricity',
      value: indicatorsData?.accessToEletricity?.value || 'N/A',
      year: indicatorsData?.accessToEletricity?.year,
      color: 'yellow',
      rank: withRank('accessToEletricity'),
    },
    {
      icon: FaHospital,
      label: 'Health Expenditure (% GDP)',
      key: 'healthExpenses',
      value: indicatorsData?.healthExpenses?.value || 'N/A',
      year: indicatorsData?.healthExpenses?.year,
      color: 'red',
      rank: withRank('healthExpenses'),
    },
  ];

  const weatherDataList = [
    { icon: FaSun, label: 'Condition', value: weatherData?.description || 'N/A', color: 'yellow' },
    { icon: FaThermometerHalf, label: 'Temperature', value: weatherData?.temperature ? `${weatherData.temperature}°C` : 'N/A', color: 'red' },
    { icon: FaMapMarkedAlt, label: 'Coordinates', value: weatherData?.coord ? `${weatherData.coord.lat.toFixed(2)}, ${weatherData.coord.lon.toFixed(2)}` : 'N/A', color: 'teal' },
  ];

  const dataMap = {
    economic: economicData,
    social: socialData,
    infrastructure: infrastructureData,
    weather: weatherDataList,
  };
  const currentData = dataMap[activeTab];

  const StatCard = ({ icon, label, value, color, rank, year }) => {
    const style = getRankStyle(rank);

    return (
      <Box
        bg={cardBg}
        border="1px solid"
        borderColor={border}
        borderRadius="xl"
        p={4}
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
        sx={{
          backgroundImage: useColorModeValue(
            `repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(0,0,0,0.02) 10px, rgba(0,0,0,0.02) 20px)`,
            `repeating-linear-gradient(135deg, transparent, transparent 10px, rgba(255,255,255,0.02) 10px, rgba(255,255,255,0.02) 20px)`
          ),
        }}
      >
        <HStack spacing={3} align="center">
          <Box
            p={2.5}
            borderRadius="md"
            bg={`${color}.100`}
            border="1px solid"
            borderColor={`${color}.200`}
          >
            <Icon as={icon} color={`${color}.500`} boxSize={5} />
          </Box>

          <VStack align="start" spacing={0}>
            <Text fontSize="xs" color="gray.500" fontWeight="medium">
              {label}
            </Text>

            <HStack spacing={2} align="center">
              <Text fontSize="lg" fontWeight="bold" color={heading}>
                {value}
              </Text>

              {rank && rank.rank && rank.total && (
                <Tooltip
                  hasArrow
                  placement="top"
                  label={`Based on ${rank.year || year || 'latest'} World Bank data`}
                >
                  <Badge
                    fontSize="xs"
                    colorScheme={style.badgeColor}
                    variant="subtle"
                    borderRadius="md"
                    display="inline-flex"
                    alignItems="center"
                    gap="4px"
                    px={2}
                    py={0.5}
                  >
                    {style.medal && <span style={{ lineHeight: 1 }}>{style.medal}</span>}
                    {`#${rank.rank} / ${rank.total}`}
                  </Badge>
                </Tooltip>
              )}
            </HStack>

            {year && (
              <Text fontSize="10px" color="gray.500">
                {`Year: ${year}`}
              </Text>
            )}
          </VStack>
        </HStack>
      </Box>
    );
  };

  return (
    <Box p={4} bg={bg} borderRadius="xl">
      {/* Header */}
      <VStack spacing={1} mb={4}>
        <Heading size="sm" color={heading}>National Indicators Overview</Heading>
        <Text fontSize="xs" color={text}>Data by World Bank, OpenWeatherMap & Wikipedia</Text>
      </VStack>

      {/* Tabs */}
      <HStack spacing={2} mb={5} justify="center" flexWrap="wrap">
        {tabs.map((tab) => (
          <Badge
            key={tab.id}
            as="button"
            onClick={() => setActiveTab(tab.id)}
            px={3.5}
            py={1.5}
            borderRadius="full"
            fontSize="xs"
            fontWeight="semibold"
            bg={activeTab === tab.id ? `${tab.color}.500` : cardBg}
            color={activeTab === tab.id ? 'white' : text}
            border="1px solid"
            borderColor={activeTab === tab.id ? `${tab.color}.500` : border}
            transition="all 0.2s ease"
            _hover={{ bg: activeTab === tab.id ? `${tab.color}.600` : useColorModeValue('gray.100', 'gray.700') }}
            display="flex"
            alignItems="center"
            gap={1.5}
          >
            <Icon as={tab.icon} boxSize={3.5} />
            {tab.label}
          </Badge>
        ))}
      </HStack>

      {/* Grid (mobile-first) */}
      <SimpleGrid columns={1} spacing={4}>
        {currentData.map((item, idx) => {
          const { key, icon, label, value, color, rank, year } = item;
          const isGDP = key === 'gdp';
          
          return (
            <Box key={key || idx}>
              {isGDP && rank && (
                <Button
                  size="sm"
                  leftIcon={<Icon as={FaList} />}
                  onClick={handleOpenRanking}
                  mb={2}
                  colorScheme="green"
                  variant="outline"
                  width="100%"
                  fontSize="xs"
                >
                  Ver ranking completo de GDP Total
                </Button>
              )}
              <StatCard icon={icon} label={label} value={value} color={color} rank={rank} year={year} />
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Footer */}
      <Divider my={5} />
      <VStack spacing={1}>
        <HStack spacing={1.5}>
          <Icon as={FaGlobe} color="blue.400" boxSize={3.5} />
          <Text fontSize="xs" color="gray.500" fontWeight="medium">
            Source: World Bank, OpenWeatherMap, Wikipedia
          </Text>
        </HStack>
        <Text fontSize="xs" color="gray.500">
          Updated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
        </Text>
      </VStack>

      {/* Modal de Ranking Completo */}
      <Modal isOpen={isRankingModalOpen} onClose={() => setIsRankingModalOpen(false)} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent bg={cardBg} maxH="80vh">
          <ModalHeader color={heading}>
            Ranking Completo - GDP Total ({rankingData?.year || indicatorsData?.gdp?.year || 'N/A'})
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingRanking ? (
              <Box textAlign="center" py={8}>
                <Spinner size="xl" color="green.500" />
                <Text mt={4} color={text}>Carregando ranking...</Text>
              </Box>
            ) : rankingData && rankingData.ranking ? (
              <Box>
                <Text fontSize="sm" color={text} mb={4}>
                  Total de países: {rankingData.total}
                </Text>
                <Box overflowY="auto" maxH="50vh">
                  <Table variant="simple" size="sm">
                    <Thead>
                      <Tr>
                        <Th>Posição</Th>
                        <Th>País</Th>
                        <Th isNumeric>GDP Total</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {rankingData.ranking.slice(0, 50).map((item) => (
                        <Tr key={item.position}>
                          <Td>
                            <HStack spacing={2}>
                              {item.position === 1 && <span>🥇</span>}
                              {item.position === 2 && <span>🥈</span>}
                              {item.position === 3 && <span>🥉</span>}
                              <Text fontWeight={item.position <= 3 ? 'bold' : 'normal'}>
                                #{item.position}
                              </Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Text fontWeight={item.position <= 3 ? 'bold' : 'normal'}>
                              {item.countryName}
                            </Text>
                          </Td>
                          <Td isNumeric>
                            <Text fontWeight={item.position <= 3 ? 'bold' : 'normal'}>
                              {item.formattedValue}
                            </Text>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                  {rankingData.ranking.length > 50 && (
                    <Text fontSize="xs" color={text} mt={4} textAlign="center">
                      Mostrando top 50 de {rankingData.total} países
                    </Text>
                  )}
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={8}>
                <Text color={text}>Erro ao carregar ranking. Tente novamente.</Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
