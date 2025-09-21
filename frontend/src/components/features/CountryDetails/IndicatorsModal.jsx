import React from 'react';
import {
  Box,
  Flex,
  Text,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Divider,
  Badge,
  VStack,
  HStack,
  Collapse,
  Button,
  useDisclosure
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
  FaPrayingHands,
  FaSun,
  FaThermometerHalf,
  FaBolt,
  FaHospital,
  FaBaby,
  FaGraduationCap,
  FaGlobe,
  FaMapMarkedAlt,
  FaChevronDown,
  FaChevronUp,
  FaFlag,
  FaBuilding,
  FaMountain,
  FaUserFriends
} from 'react-icons/fa';
import InfoBox from './InfoBox';

const IndicatorsModal = ({ 
  indicatorsData, 
  weatherData, 
  exchangeRate, 
  countryInfo, 
  factbookData 
}) => {
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const dividerColor = useColorModeValue('gray.200', 'gray.600');
  const buttonBg = useColorModeValue('gray.50', 'gray.700');
  const buttonHoverBg = useColorModeValue('gray.100', 'gray.600');

  // Controles de colapso para cada categoria, definidos para iniciar fechados
  const economicDisclosure = useDisclosure({ defaultIsOpen: false });
  const demographicsDisclosure = useDisclosure({ defaultIsOpen: false });
  const infrastructureDisclosure = useDisclosure({ defaultIsOpen: false });
  const weatherDisclosure = useDisclosure({ defaultIsOpen: false });
  const cultureDisclosure = useDisclosure({ defaultIsOpen: false });

  // Função para formatar coordenadas
  const formatCoordinates = (coord) => {
    if (!coord?.lat || !coord?.lon) return undefined;
    return `${coord.lat.toFixed(2)}, ${coord.lon.toFixed(2)}`;
  };

  // Função para formatar área
  const formatArea = (area) => {
    if (!area) return undefined;
    if (area >= 1000000) {
      return `${(area / 1000000).toFixed(1)}M km²`;
    }
    if (area >= 1000) {
      return `${(area / 1000).toFixed(1)}K km²`;
    }
    return `${area} km²`;
  };

  // Funções para contar indicadores em cada seção
  const countEconomicIndicators = () => {
    let count = 5; // GDP Growth, Public Debt, GDP Per Capita, Exchange Rate, Inflation Rate
    if (indicatorsData?.gdp) count++;
    if (indicatorsData?.gniPerCapita) count++;
    if (indicatorsData?.unemployment) count++;
    return count;
  };

  const countDemographicsIndicators = () => {
    let count = 5; // Life Expectancy, Internet Users, Urban Population, Literacy Rate, Net Migration
    if (indicatorsData?.fertilityRate) count++;
    return count;
  };

  const countInfrastructureIndicators = () => {
    let count = 0;
    if (indicatorsData?.accessToEletricity) count++;
    if (indicatorsData?.healthExpenses) count++;
    return count;
  };

  const countWeatherIndicators = () => {
    let count = 2; // Weather, Temperature
    if (weatherData?.coord) count++;
    return count;
  };

  const countCultureIndicators = () => {
    let count = 2; // Language, Capital
    if (factbookData?.religion && factbookData.religion !== 'N/A') count++;
    if (factbookData?.culture && factbookData.culture !== 'N/A') count++;
    if (factbookData?.government && factbookData.government !== 'N/A') count++;
    if (factbookData?.economy && factbookData.economy !== 'N/A') count++;
    if (factbookData?.geography && factbookData.geography !== 'N/A') count++;
    if (factbookData?.people && factbookData.people !== 'N/A') count++;
    return count;
  };

  // Componente de cabeçalho colapsável reutilizável
  const CollapsibleHeader = ({ 
    icon, 
    title, 
    badgeText, 
    colorScheme, 
    disclosure, 
    isExpanded 
  }) => (
    <Button
      onClick={disclosure.onToggle}
      variant="ghost"
      w="full"
      h="auto"
      p={{ base: 3, md: 4 }}
      bg={buttonBg}
      _hover={{ bg: buttonHoverBg }}
      _active={{ bg: buttonHoverBg }}
      borderRadius="lg"
      border="1px solid"
      borderColor={useColorModeValue('gray.200', 'gray.600')}
      transition="all 0.2s"
      mb={2}
    >
      <Flex w="full" align="center" justify="space-between">
        <Flex align="center" gap={{ base: 2, md: 3 }}>
          <Icon as={icon} color={`${colorScheme}.500`} boxSize={{ base: 4, md: 5 }} />
          <Text fontSize={{ base: "sm", md: "lg" }} fontWeight="bold" color={textColor}>
            {title}
          </Text>
          <Badge 
            colorScheme={colorScheme} 
            variant="subtle" 
            borderRadius="full"
            fontSize={{ base: "xs", md: "sm" }}
            px={{ base: 2, md: 3 }}
          >
            {badgeText}
          </Badge>
        </Flex>
        <Icon 
          as={isExpanded ? FaChevronUp : FaChevronDown} 
          color={`${colorScheme}.500`} 
          boxSize={{ base: 3, md: 4 }}
          transition="transform 0.2s"
          transform={isExpanded ? "rotate(0deg)" : "rotate(0deg)"}
        />
      </Flex>
    </Button>
  );

  return (
    <Box>
      {/* Categoria: Economia */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaDollarSign}
          title="Economic"
          badgeText={`${countEconomicIndicators()}`}
          colorScheme="green"
          disclosure={economicDisclosure}
          isExpanded={economicDisclosure.isOpen}
        />
        
        <Collapse in={economicDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <InfoBox 
                icon={FaChartLine} 
                label="GDP Growth" 
                value={indicatorsData?.gdpGrowth ? `${indicatorsData.gdpGrowth.value}%` : undefined} 
                colorScheme="green" 
                size="compact"
              />
              <InfoBox 
                icon={FaBalanceScale} 
                label="Public Debt" 
                value={indicatorsData?.debtToGDP ? `${indicatorsData.debtToGDP.value}%` : undefined} 
                colorScheme="red" 
                size="compact"
              />
              <InfoBox 
                icon={FaHandHoldingUsd} 
                label="GDP Per Capita" 
                value={indicatorsData?.gdpPerCapitaCurrent ? `$${indicatorsData.gdpPerCapitaCurrent.value}` : undefined} 
                colorScheme="purple" 
                size="compact"
              />
              <InfoBox 
                icon={FaDollarSign} 
                label="Exchange Rate" 
                value={exchangeRate ? `1 GBP = ${exchangeRate} ${countryInfo?.currencies?.[0] || 'USD'}` : undefined} 
                colorScheme="yellow" 
                size="compact"
              />
              <InfoBox 
                icon={FaPercent} 
                label="Inflation Rate" 
                value={indicatorsData?.inflationCPI ? `${indicatorsData.inflationCPI.value}%` : undefined} 
                colorScheme="orange" 
                size="compact"
              />
              {indicatorsData?.gdp && (
                <InfoBox 
                  icon={FaGlobe} 
                  label="Total GDP" 
                  value={indicatorsData.gdp.value} 
                  colorScheme="teal" 
                  size="compact"
                />
              )}
              {indicatorsData?.gniPerCapita && (
                <InfoBox 
                  icon={FaGraduationCap} 
                  label="GNI Per Capita" 
                  value={indicatorsData.gniPerCapita.value} 
                  colorScheme="cyan" 
                  size="compact"
                />
              )}
              {indicatorsData?.unemployment && (
                <InfoBox 
                  icon={FaUsers} 
                  label="Unemployment" 
                  value={indicatorsData.unemployment.value} 
                  colorScheme="red" 
                  size="compact"
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Demografia */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaUsers}
          title="Demographics & Society"
          badgeText={`${countDemographicsIndicators()}`}
          colorScheme="blue"
          disclosure={demographicsDisclosure}
          isExpanded={demographicsDisclosure.isOpen}
        />
        
        <Collapse in={demographicsDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <InfoBox 
                icon={FaHeartbeat} 
                label="Life Expectancy" 
                value={indicatorsData?.lifeExpectancy ? indicatorsData.lifeExpectancy.value : undefined} 
                colorScheme="pink" 
                size="compact"
              />
              <InfoBox 
                icon={FaWifi} 
                label="Internet Users" 
                value={indicatorsData?.internetUsers ? `${indicatorsData.internetUsers.value}%` : undefined} 
                colorScheme="blue" 
                size="compact"
              />
              <InfoBox 
                icon={FaCity} 
                label="Urban Population" 
                value={indicatorsData?.urbanPopulation ? `${indicatorsData.urbanPopulation.value}%` : undefined} 
                colorScheme="green" 
                size="compact"
              />
              <InfoBox 
                icon={FaBook} 
                label="Literacy Rate" 
                value={indicatorsData?.education ? `${indicatorsData.education.value}%` : undefined} 
                colorScheme="indigo" 
                size="compact"
              />
              <InfoBox 
                icon={FaUsers} 
                label="Net Migration" 
                value={indicatorsData?.netMigration ? indicatorsData.netMigration.value : undefined} 
                colorScheme="cyan" 
                size="compact"
              />
              {indicatorsData?.fertilityRate && (
                <InfoBox 
                  icon={FaBaby} 
                  label="Fertility Rate" 
                  value={indicatorsData.fertilityRate.value} 
                  colorScheme="purple" 
                  size="compact"
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Infraestrutura e Tecnologia */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaBolt}
          title="Infrastructure & Technology"
          badgeText={`${countInfrastructureIndicators()}`}
          colorScheme="teal"
          disclosure={infrastructureDisclosure}
          isExpanded={infrastructureDisclosure.isOpen}
        />
        
        <Collapse in={infrastructureDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              {indicatorsData?.accessToEletricity && (
                <InfoBox 
                  icon={FaBolt} 
                  label="Electricity Access" 
                  value={indicatorsData.accessToEletricity.value} 
                  colorScheme="yellow" 
                  size="compact"
                />
              )}
              {indicatorsData?.healthExpenses && (
                <InfoBox 
                  icon={FaHospital} 
                  label="Health Expenses" 
                  value={indicatorsData.healthExpenses.value} 
                  colorScheme="red" 
                  size="compact"
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Clima e Ambiente */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaSun}
          title="Weather & Environment"
          badgeText={`${countWeatherIndicators()}`}
          colorScheme="orange"
          disclosure={weatherDisclosure}
          isExpanded={weatherDisclosure.isOpen}
        />
        
        <Collapse in={weatherDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              <InfoBox 
                icon={FaSun} 
                label="Weather" 
                value={weatherData?.description ? weatherData.description : undefined} 
                colorScheme="yellow" 
                size="compact"
              />
              <InfoBox 
                icon={FaThermometerHalf} 
                label="Temperature" 
                value={weatherData?.temperature ? `${weatherData.temperature}°C` : undefined} 
                colorScheme="red" 
                size="compact"
              />
              {weatherData?.coord && (
                <InfoBox 
                  icon={FaMapMarkedAlt} 
                  label="Coordinates" 
                  value={formatCoordinates(weatherData.coord)} 
                  colorScheme="green" 
                  size="compact"
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      <Divider mb={6} borderColor={dividerColor} />

      {/* Categoria: Cultura e Religião */}
      <Box mb={6}>
        <CollapsibleHeader
          icon={FaBook}
          title="Culture & Religion"
          badgeText={`${countCultureIndicators()}`}
          colorScheme="purple"
          disclosure={cultureDisclosure}
          isExpanded={cultureDisclosure.isOpen}
        />
        
        <Collapse in={cultureDisclosure.isOpen} animateOpacity>
          <Box
            p={4}
            bg={useColorModeValue('gray.50', 'gray.800')}
            borderRadius="lg"
            border="1px solid"
            borderColor={useColorModeValue('gray.200', 'gray.600')}
          >
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={3}>
              {factbookData?.religion && factbookData.religion !== 'N/A' && (
                <InfoBox 
                  icon={FaPrayingHands} 
                  label="Main Religion" 
                  value={factbookData.religion} 
                  colorScheme="purple" 
                  size="compact"
                />
              )}
              {factbookData?.culture && factbookData.culture !== 'N/A' && (
                <InfoBox 
                  icon={FaBook} 
                  label="Cultural Heritage" 
                  value={factbookData.culture} 
                  colorScheme="orange" 
                  size="compact"
                />
              )}
              <InfoBox 
                icon={FaBook} 
                label="Language" 
                value={countryInfo?.officialLanguage} 
                colorScheme="blue" 
                size="compact"
              />
              <InfoBox 
                icon={FaCity} 
                label="Capital" 
                value={countryInfo?.capital} 
                colorScheme="teal" 
                size="compact"
              />
              {factbookData?.government && factbookData.government !== 'N/A' && (
                <InfoBox 
                  icon={FaFlag} 
                  label="Government Type" 
                  value={factbookData.government} 
                  colorScheme="red" 
                  size="compact"
                />
              )}
              {factbookData?.economy && factbookData.economy !== 'N/A' && (
                <InfoBox 
                  icon={FaBuilding} 
                  label="Economy Type" 
                  value={factbookData.economy} 
                  colorScheme="green" 
                  size="compact"
                />
              )}
              {factbookData?.geography && factbookData.geography !== 'N/A' && (
                <InfoBox 
                  icon={FaMountain} 
                  label="Geography" 
                  value={factbookData.geography} 
                  colorScheme="yellow" 
                  size="compact"
                />
              )}
              {factbookData?.people && factbookData.people !== 'N/A' && (
                <InfoBox 
                  icon={FaUserFriends} 
                  label="Population Size" 
                  value={factbookData.people} 
                  colorScheme="cyan" 
                  size="compact"
                />
              )}
            </SimpleGrid>
          </Box>
        </Collapse>
      </Box>

      {/* Footer com informações adicionais */}
      <Box mt={8} p={4} bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
        <VStack spacing={2} align="center">
          <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.300')} textAlign="center">
            Data sources: World Bank, OpenWeatherMap, RestCountries, Wikipedia, Exchange Rate API
          </Text>
          <HStack spacing={4} fontSize="xs" color={useColorModeValue('gray.500', 'gray.400')}>
            <Text>Last updated: {new Date().toLocaleDateString()}</Text>
            <Text>•</Text>
            <Text>Total indicators: 25+</Text>
          </HStack>
        </VStack>
      </Box>
    </Box>
  );
};

export default IndicatorsModal;