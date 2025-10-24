import React from 'react';
import {
  Box, SimpleGrid, Divider, Text, Flex, Button, Icon, Badge, Collapse, useColorModeValue, useDisclosure, VStack, HStack,
} from '@chakra-ui/react';
import {
  FaDollarSign, FaChartLine, FaBalanceScale, FaHandHoldingUsd, FaPercent, FaUsers, FaHeartbeat, FaWifi, FaCity,
  FaBook, FaPrayingHands, FaSun, FaThermometerHalf, FaBolt, FaHospital, FaBaby, FaGraduationCap, FaGlobe,
  FaMapMarkedAlt, FaChevronDown, FaChevronUp, FaFlag, FaBuilding, FaMountain, FaUserFriends,
} from 'react-icons/fa';
import InfoBox from './InfoBox';

export default function IndicatorsModal({ indicatorsData, weatherData, exchangeRate, countryInfo, factbookData }) {
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBg = useColorModeValue('gray.50', 'gray.700');
  const buttonHover = useColorModeValue('gray.100', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.200');

  const compactBoxProps = {
    size: 'compact',
    sx: {
      p: { base: 2, sm: 2.5, md: 3 },
      fontSize: { base: 'xs', sm: 'sm' },
      '.chakra-icon': { fontSize: { base: '12px', sm: '14px' } },
    },
  };

  const sections = [
    {
      title: 'Economic',
      icon: FaDollarSign,
      color: 'green',
      disclosure: useDisclosure(),
      data: [
        { icon: FaChartLine, label: 'GDP Growth', value: indicatorsData?.gdpGrowth?.value && `${indicatorsData.gdpGrowth.value}%` },
        { icon: FaBalanceScale, label: 'Public Debt', value: indicatorsData?.debtToGDP?.value && `${indicatorsData.debtToGDP.value}%` },
        { icon: FaHandHoldingUsd, label: 'GDP Per Capita', value: indicatorsData?.gdpPerCapitaCurrent?.value && `$${indicatorsData.gdpPerCapitaCurrent.value}` },
        { icon: FaDollarSign, label: 'Exchange Rate', value: exchangeRate && `1 GBP = ${exchangeRate} ${countryInfo?.currencies?.[0] || 'USD'}` },
        { icon: FaPercent, label: 'Inflation Rate', value: indicatorsData?.inflationCPI?.value && `${indicatorsData.inflationCPI.value}%` },
      ],
    },
    {
      title: 'Demographics & Society',
      icon: FaUsers,
      color: 'blue',
      disclosure: useDisclosure(),
      data: [
        { icon: FaHeartbeat, label: 'Life Expectancy', value: indicatorsData?.lifeExpectancy?.value },
        { icon: FaWifi, label: 'Internet Users', value: indicatorsData?.internetUsers?.value && `${indicatorsData.internetUsers.value}%` },
        { icon: FaCity, label: 'Urban Population', value: indicatorsData?.urbanPopulation?.value && `${indicatorsData.urbanPopulation.value}%` },
        { icon: FaBook, label: 'Literacy Rate', value: indicatorsData?.education?.value && `${indicatorsData.education.value}%` },
        { icon: FaUsers, label: 'Net Migration', value: indicatorsData?.netMigration?.value },
      ],
    },
    {
      title: 'Infrastructure & Technology',
      icon: FaBolt,
      color: 'teal',
      disclosure: useDisclosure(),
      data: [
        { icon: FaBolt, label: 'Electricity Access', value: indicatorsData?.accessToEletricity?.value },
        { icon: FaHospital, label: 'Health Expenses', value: indicatorsData?.healthExpenses?.value },
      ],
    },
    {
      title: 'Weather & Environment',
      icon: FaSun,
      color: 'orange',
      disclosure: useDisclosure(),
      data: [
        { icon: FaSun, label: 'Weather', value: weatherData?.description },
        { icon: FaThermometerHalf, label: 'Temperature', value: weatherData?.temperature && `${weatherData.temperature}°C` },
        { icon: FaMapMarkedAlt, label: 'Coordinates', value: weatherData?.coord && `${weatherData.coord.lat.toFixed(2)}, ${weatherData.coord.lon.toFixed(2)}` },
      ],
    },
    {
      title: 'Culture & Religion',
      icon: FaBook,
      color: 'purple',
      disclosure: useDisclosure(),
      data: [
        { icon: FaPrayingHands, label: 'Religion', value: factbookData?.religion },
        { icon: FaBook, label: 'Language', value: countryInfo?.officialLanguage },
        { icon: FaCity, label: 'Capital', value: countryInfo?.capital },
      ],
    },
  ];

  const CollapsibleHeader = ({ icon, title, color, disclosure }) => (
    <Button
      onClick={disclosure.onToggle}
      w="full"
      variant="ghost"
      bg={buttonBg}
      _hover={{ bg: buttonHover }}
      p={{ base: 2.5, md: 4 }}
      border="1px solid"
      borderColor={dividerColor}
      borderRadius="lg"
      mb={2}
    >
      <Flex justify="space-between" w="full" align="center">
        <Flex align="center" gap={2}>
          <Icon as={icon} color={`${color}.500`} />
          <Text fontWeight="bold" color={textColor}>{title}</Text>
        </Flex>
        <Icon as={disclosure.isOpen ? FaChevronUp : FaChevronDown} color={`${color}.500`} />
      </Flex>
    </Button>
  );

  return (
    <Box>
      {sections.map((sec, i) => (
        <Box key={i} mb={6}>
          <CollapsibleHeader {...sec} />
          <Collapse in={sec.disclosure.isOpen} animateOpacity>
            <Box
              p={3}
              bg={useColorModeValue('gray.50', 'gray.800')}
              borderRadius="lg"
              border="1px solid"
              borderColor={dividerColor}
            >
              <SimpleGrid columns={{ base: 2, sm: 2, md: 3 }} gap={{ base: 2, md: 3 }}>
                {sec.data
                  .filter((d) => d.value)
                  .map((d, j) => (
                    <InfoBox key={j} icon={d.icon} label={d.label} value={d.value} colorScheme={sec.color} {...compactBoxProps} />
                  ))}
              </SimpleGrid>
            </Box>
          </Collapse>
          {i < sections.length - 1 && <Divider my={4} borderColor={dividerColor} />}
        </Box>
      ))}

      <VStack mt={8} spacing={1} fontSize="xs" color="gray.500">
        <Text>Data sources: World Bank, OpenWeatherMap, Wikipedia</Text>
        <HStack spacing={2}><Text>Last updated:</Text><Text>{new Date().toLocaleDateString()}</Text></HStack>
      </VStack>
    </Box>
  );
}
