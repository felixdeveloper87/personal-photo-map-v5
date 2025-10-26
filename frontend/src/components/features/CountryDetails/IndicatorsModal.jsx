import React, { useState } from 'react';
import {
  Box,
  SimpleGrid,
  Text,
  Flex,
  Icon,
  Badge,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FaDollarSign,
  FaChartLine,
  FaBalanceScale,
  FaHandHoldingUsd,
  FaPercent,
  FaUsers,
  FaHeartbeat,
  FaWifi,
  FaCity,
  FaBook,
  FaSun,
  FaThermometerHalf,
  FaBolt,
  FaHospital,
  FaGlobe,
  FaMapMarkedAlt,
} from 'react-icons/fa';
// Removed Framer Motion to prevent jumping animations

export default function IndicatorsModal({ indicatorsData, weatherData, exchangeRate, countryInfo, factbookData }) {
  const [activeTab, setActiveTab] = useState('economic');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const headingColor = useColorModeValue('gray.900', 'white');
  
  // Responsive sizes - mantendo estilo mobile para todas as telas
  const tabFontSize = 'xs';
  const iconSize = 4;
  const labelSize = '2xs';
  const valueSize = 'lg';
  const cardPadding = 3;
  const cardGap = 3;

  const tabs = [
    { id: 'economic', label: 'Economic', icon: FaDollarSign, color: 'green' },
    { id: 'social', label: 'Social', icon: FaUsers, color: 'blue' },
    { id: 'infrastructure', label: 'Infrastructure', icon: FaBolt, color: 'teal' },
    { id: 'weather', label: 'Weather', icon: FaSun, color: 'orange' },
  ];

  const economicData = [
    {
      icon: FaChartLine,
      label: 'GDP Growth',
      value: indicatorsData?.gdpGrowth?.value || 'N/A',
      color: 'green',
      trend: indicatorsData?.gdpGrowth?.value > 0 ? 'up' : 'down',
    },
    {
      icon: FaHandHoldingUsd,
      label: 'GDP Per Capita',
      value: indicatorsData?.gdpPerCapitaCurrent?.value
        ? `$${indicatorsData.gdpPerCapitaCurrent.value.toLocaleString()}`
        : 'N/A',
      color: 'green',
    },
    {
      icon: FaBalanceScale,
      label: 'Public Debt',
      value: indicatorsData?.debtToGDP?.value || 'N/A',
      color: 'orange',
    },
    {
      icon: FaPercent,
      label: 'Inflation',
      value: indicatorsData?.inflationCPI?.value || 'N/A',
      color: 'red',
    },
    {
      icon: FaDollarSign,
      label: 'Exchange Rate',
      value: exchangeRate ? `£1 = ${exchangeRate} ${countryInfo?.currency || 'USD'}` : 'N/A',
      color: 'teal',
    },
  ];

  const socialData = [
    {
      icon: FaHeartbeat,
      label: 'Life Expectancy',
      value: indicatorsData?.lifeExpectancy?.value || 'N/A',
      color: 'pink',
    },
    {
      icon: FaWifi,
      label: 'Internet Users',
      value: indicatorsData?.internetUsers?.value || 'N/A',
      color: 'blue',
    },
    {
      icon: FaCity,
      label: 'Urban Population',
      value: indicatorsData?.urbanPopulation?.value || 'N/A',
      color: 'purple',
    },
    {
      icon: FaBook,
      label: 'Literacy Rate',
      value: indicatorsData?.education?.value || 'N/A',
      color: 'cyan',
    },
    {
      icon: FaUsers,
      label: 'Net Migration',
      value: indicatorsData?.netMigration?.value || 'N/A',
      color: 'indigo',
    },
  ];

  const infrastructureData = [
    {
      icon: FaBolt,
      label: 'Electricity Access',
      value: indicatorsData?.accessToEletricity?.value || 'N/A',
      color: 'yellow',
    },
    {
      icon: FaHospital,
      label: 'Health Expenses',
      value: indicatorsData?.healthExpenses?.value || 'N/A',
      color: 'red',
    },
  ];

  const weatherDataList = [
    {
      icon: FaSun,
      label: 'Condition',
      value: weatherData?.description || 'N/A',
      color: 'yellow',
    },
    {
      icon: FaThermometerHalf,
      label: 'Temperature',
      value: weatherData?.temperature ? `${weatherData.temperature}°C` : 'N/A',
      color: 'red',
    },
    {
      icon: FaMapMarkedAlt,
      label: 'Coordinates',
      value: weatherData?.coord ? `${weatherData.coord.lat.toFixed(2)}, ${weatherData.coord.lon.toFixed(2)}` : 'N/A',
      color: 'teal',
    },
  ];

  const currentData = {
    economic: economicData,
    social: socialData,
    infrastructure: infrastructureData,
    weather: weatherDataList,
  }[activeTab];

  const StatCard = ({ icon, label, value, color }) => {
    const iconColor = useColorModeValue(
      {
        green: '#22c55e',
        blue: '#3b82f6',
        teal: '#14b8a6',
        orange: '#f97316',
        red: '#ef4444',
        pink: '#ec4899',
        purple: '#a855f7',
        cyan: '#06b6d4',
        indigo: '#6366f1',
        yellow: '#eab308',
      }[color] || 'gray.500',
      {
        green: '#4ade80',
        blue: '#60a5fa',
        teal: '#2dd4bf',
        orange: '#fb923c',
        red: '#f87171',
        pink: '#f472b6',
        purple: '#c084fc',
        cyan: '#22d3ee',
        indigo: '#818cf8',
        yellow: '#fde047',
      }[color] || 'gray.400'
    );

    return (
      <Box
        bg={cardBg}
        borderRadius="lg"
        p={cardPadding}
        border="1px solid"
        borderColor={borderColor}
        boxShadow="sm"
        position="relative"
        overflow="hidden"
        _hover={{
          boxShadow: 'md',
          transform: 'translateY(-2px)',
        }}
        sx={{
          backgroundImage: useColorModeValue(
            `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(0, 0, 0, 0.02) 8px,
              rgba(0, 0, 0, 0.02) 16px
            )`,
            `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 8px,
              rgba(255, 255, 255, 0.015) 8px,
              rgba(255, 255, 255, 0.015) 16px
            )`
          ),
          backgroundSize: '20px 20px',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: useColorModeValue(
              'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.08) 1px, transparent 0)',
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)'
            ),
            backgroundSize: '12px 12px',
            pointerEvents: 'none',
          },
        }}
      >
        <VStack align="start" spacing={2} position="relative" zIndex={1}>
          <Flex align="center" gap={2} w="full">
            <Box
              p={2}
              borderRadius="md"
              bg={`${color}.50`}
              border="1px solid"
              borderColor={`${color}.200`}
            >
              <Icon as={icon} color={iconColor} boxSize={iconSize} />
            </Box>
            <Box flex={1}>
              <Text fontSize={labelSize} fontWeight="semibold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                {label}
              </Text>
              <Text fontSize={valueSize} fontWeight="bold" color={headingColor} mt={0.5}>
                {value}
              </Text>
            </Box>
          </Flex>
        </VStack>
      </Box>
    );
  };

  return (
    <Box px={0} py={2}>
      {/* Tabs */}
      <Flex
        gap={1}
        mb={4}
        flexWrap="wrap"
        borderBottom="2px solid"
        borderColor={borderColor}
        pb={2}
      >
        {tabs.map((tab) => (
          <Badge
            key={tab.id}
            as="button"
            onClick={() => setActiveTab(tab.id)}
            px={3}
            py={1.5}
            borderRadius="full"
            fontSize={tabFontSize}
            fontWeight="semibold"
            cursor="pointer"
            bg={activeTab === tab.id ? `${tab.color}.500` : cardBg}
            color={activeTab === tab.id ? 'white' : textColor}
            border="1px solid"
            borderColor={activeTab === tab.id ? `${tab.color}.500` : borderColor}
            transition="all 0.2s ease"
            _hover={{
              bg: activeTab === tab.id ? `${tab.color}.600` : bgColor,
              borderColor: `${tab.color}.400`,
            }}
            display="flex"
            alignItems="center"
            gap={1.5}
          >
            <Icon as={tab.icon} boxSize={3} />
            {tab.label}
          </Badge>
        ))}
      </Flex>

      {/* Content */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={cardGap} mb={4}>
        {currentData.map((item, index) => (
          <StatCard
            key={index}
            icon={item.icon}
            label={item.label}
            value={item.value}
            color={item.color}
          />
        ))}
      </SimpleGrid>

      {/* Footer */}
      <Box
        mt={4}
        p={2.5}
        bg={cardBg}
        borderRadius="md"
        border="1px solid"
        borderColor={borderColor}
      >
        <HStack spacing={1.5} justify="center" mb={1.5}>
          <Icon as={FaGlobe} color="blue.500" boxSize={3.5} />
          <Text fontSize="2xs" fontWeight="semibold" color="gray.600">
            Data Sources: World Bank, OpenWeatherMap, Wikipedia
          </Text>
        </HStack>
        <Text fontSize="2xs" color="gray.500" textAlign="center">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
      </Box>
    </Box>
  );
}
