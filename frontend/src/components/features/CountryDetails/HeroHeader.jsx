import { Box, Flex, Heading, Text, IconButton, useColorModeValue, useDisclosure, Icon, useBreakpointValue, Collapse, Button } from '@chakra-ui/react';
import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import countries from 'i18n-iso-countries';
import moment from 'moment-timezone';
import {
  FaClock,
  FaCity,
  FaThermometerHalf,
  FaSun,
  FaUsers,
  FaLanguage,
  FaCalendarAlt,
  FaDollarSign,
  FaChartLine,
  FaBalanceScale,
  FaHandHoldingUsd,
  FaHeartbeat,
  FaWifi,
  FaBook,
  FaPercent,
  FaPrayingHands,
  FaPlane,
  FaArrowRight
} from 'react-icons/fa';
import EnhancedFlag from './EnhancedFlag';
import InfoBox from './InfoBox';
import BaseModal from '../../modals/BaseModal';
import IndicatorsModal from './IndicatorsModal';

const formatPopulation = (pop) => (typeof pop === 'number' ? pop.toLocaleString('en-US') : 'N/A');

const HeroHeader = ({ countryId, countryInfo, weatherData, currentTime, exchangeRate, indicatorsData, factbookData, navigate }) => {
  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Text colors for theme-aware country name
  const countryNameColor = useColorModeValue('gray.800', 'white');
  const countryNameTextShadow = useColorModeValue(
    '0 4px 8px rgba(0,0,0,0.1)',
    '0 4px 8px rgba(0,0,0,0.9)'
  );

  // Enhanced colors for better contrast
  const countryNameColorEnhanced = useColorModeValue('gray.900', 'gray.100');
  const nativeNameColor = useColorModeValue('gray.600', 'gray.300');

  // Modal control
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Collapse control for HeroHeader
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true });

  // Responsive values
  const headerPadding = useBreakpointValue({ base: 1, sm: 1, md: 2, lg: 2 });
  const headerBorderRadius = useBreakpointValue({ base: "8px", sm: "10px", md: "12px", lg: "14px" });
  const countryNameSize = useBreakpointValue({ base: "sm", sm: "md", md: "lg", lg: "xl" });
  const capitalTextSize = useBreakpointValue({ base: "xs", sm: "xs", md: "sm", lg: "sm" });
  // Flag height balanced with infoboxes - more proportional sizing
  const flagHeight = useBreakpointValue({ base: "180px", sm: "250px", md: "380px", lg: "280px", xl: "330px" });
  const flagBorderRadius = useBreakpointValue({ base: "12px", sm: "14px", md: "16px", lg: "18px" });
  const infoBoxGap = useBreakpointValue({ base: 1, sm: 2, md: 3, lg: 4 });
  const sectionGap = useBreakpointValue({ base: 2, sm: 3, md: 4, lg: 6 });

  // Header background gradient for a subtle, attractive hero feel
  const headerBg = useColorModeValue(
    'linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(245,247,250,0.8) 100%)',
    'linear-gradient(90deg, rgba(6,8,11,0.72) 0%, rgba(10,14,22,0.64) 100%)'
  );

   // base =  0px - 480px
  // sm = 481px - 768px 
  // md = 769px - 992px
  // lg = 993px - 1280px
  // xl = 1281px+

  return (
    <Box mb={2} position="relative">
      {/* Header: Nome do país, capital e botão de voltar alinhados */}
      <Box
        bg={headerBg}
        p={headerPadding}
        borderRadius={headerBorderRadius}
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
        position="relative"
        border={useColorModeValue('1px solid rgba(0,0,0,0.1)', '1px solid rgba(255,255,255,0.1)')}
        width="100%"
        maxW="1600px"
        mx="auto"
        minW="0"
        boxShadow={useColorModeValue('0 6px 30px rgba(2,6,23,0.06)', '0 6px 30px rgba(2,6,23,0.6)')}
      >
        {/* Back Button */}
        <IconButton
          aria-label="Go back"
          icon={<ArrowBackIcon />}
          onClick={() => navigate('/')}
          variant="outline"
          size={{ base: "xs", sm: "sm", md: "sm", lg: "md" }}
          colorScheme="teal"
          bg={useColorModeValue('white', 'gray.700')}
          color={useColorModeValue('teal.500', 'teal.300')}
          borderColor={useColorModeValue('teal.200', 'teal.600')}
          borderRadius="20px"
          boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.15)", "none")}
          _hover={{
            transform: 'scale(1.05)',
            bg: useColorModeValue("teal.50", "teal.900"),
            borderColor: useColorModeValue("teal.300", "teal.400"),
            boxShadow: useColorModeValue("0 6px 20px rgba(0, 0, 0, 0.25)", "none")
          }}
          transition="all 0.2s"
        />

        {/* Nome do país, nome local e capital centralizados */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={{ base: 1, sm: 1, md: 2, lg: 2 }}
          textAlign="center"
          flex="1"
          px={{ base: 1, sm: 2, md: 3, lg: 4 }}
        >
          {/* Nome do país em inglês, nome local e capital lado a lado */}
          <Flex
            direction={{ base: "column", sm: "row" }}
            align="center"
            justify="center"
            gap={{ base: 1, sm: 2, md: 2, lg: 3 }}
            flexWrap="wrap"
          >
            <Heading
              as="h1"
              size={countryNameSize}
              color={countryNameColorEnhanced}
              textShadow={countryNameTextShadow}
              fontWeight="bold"
              noOfLines={{ base: 3, sm: 2, md: 2, lg: 1 }}
              wordBreak="break-word"
              whiteSpace="normal"
              maxW="100%"
              lineHeight={{ base: "1.1", sm: "1.2", md: "1.3", lg: "1.4" }}
            >
              {countries.getName(countryId.toUpperCase(), 'en') || countryId.toUpperCase()}
              {countryInfo?.nativeName && countryInfo.nativeName !== countries.getName(countryId.toUpperCase(), 'en') && (
                <>
                  {' '}
                  <Text
                    as="span"
                    fontSize={countryNameSize}
                    color={nativeNameColor}
                    textShadow={countryNameTextShadow}
                    fontStyle="italic"
                    opacity={0.9}
                    fontFamily="serif"
                    letterSpacing="wide"
                    fontWeight="normal"
                  >
                    ({countryInfo.nativeName})
                  </Text>
                </>
              )}
            </Heading>

            {countryInfo?.capital && (
              <Flex
                direction={{ base: "column", sm: "row" }}
                align="center"
                justify="center"
                gap={{ base: 1, sm: 1, md: 2, lg: 2 }}
                flexWrap="wrap"
              >
                <Text
                  fontSize={capitalTextSize}
                  color={useColorModeValue('blue.600', 'blue.300')}
                  textShadow={countryNameTextShadow}
                  fontWeight="semibold"
                  opacity={0.9}
                  fontFamily="system-ui"
                  letterSpacing="wide"
                  textAlign="center"
                  bg={useColorModeValue('blue.50', 'blue.900')}
                  px={{ base: 2, sm: 2, md: 3, lg: 3 }}
                  py={{ base: 1, sm: 1, md: 1, lg: 1 }}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={useColorModeValue('blue.200', 'blue.700')}
                  noOfLines={1}
                >
                  Capital: {countryInfo.capital}
                </Text>

                <Text
                  fontSize={capitalTextSize}
                  color={useColorModeValue('teal.600', 'teal.300')}
                  textShadow={countryNameTextShadow}
                  fontWeight="semibold"
                  opacity={0.9}
                  fontFamily="system-ui"
                  letterSpacing="wide"
                  textAlign="center"
                  bg={useColorModeValue('teal.50', 'teal.900')}
                  px={{ base: 2, sm: 2, md: 3, lg: 3 }}
                  py={{ base: 1, sm: 1, md: 1, lg: 1 }}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={useColorModeValue('teal.200', 'teal.700')}
                  noOfLines={1}
                >
                  <Text as="span" fontSize="sm" opacity={0.8} fontWeight="normal">
                    Local Time:
                  </Text>
                  {' '}
                  <Text as="span" fontWeight="semibold">
                    {currentTime}
                  </Text>
                </Text>

                <Text
                  fontSize={capitalTextSize}
                  color={useColorModeValue('gray.600', 'gray.300')}
                  textShadow={countryNameTextShadow}
                  fontWeight="semibold"
                  opacity={0.9}
                  fontFamily="system-ui"
                  letterSpacing="wide"
                  textAlign="center"
                  bg={useColorModeValue('gray.50', 'gray.900')}
                  px={{ base: 2, sm: 2, md: 3, lg: 3 }}
                  py={{ base: 1, sm: 1, md: 1, lg: 1 }}
                  borderRadius="full"
                  border="1px solid"
                  borderColor={useColorModeValue('gray.200', 'gray.700')}
                  noOfLines={1}
                >
                  <Text as="span" fontSize="sm" opacity={0.8} fontWeight="normal">
                    Date:
                  </Text>
                  {' '}
                  <Text as="span" fontWeight="semibold">
                    {weatherData?.timezone ? moment().utcOffset(weatherData.timezone / 60).format('DD/MM/YYYY') : moment().format('DD/MM/YYYY')}
                  </Text>
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        {/* Botão de colapso/expansão */}
        <Button
          onClick={onToggle}
          variant="outline"
          size={{ base: "xs", sm: "sm" }}
          colorScheme="blue"
          bg={useColorModeValue('white', 'gray.700')}
          color={useColorModeValue('blue.500', 'blue.300')}
          borderColor={useColorModeValue('blue.200', 'blue.600')}
          borderRadius="20px"
          boxShadow={useColorModeValue("0 4px 12px rgba(0, 0, 0, 0.15)", "none")}
          _hover={{
            transform: 'scale(1.05)',
            bg: useColorModeValue("blue.50", "blue.900"),
            borderColor: useColorModeValue("blue.300", "blue.400"),
            boxShadow: useColorModeValue("0 6px 20px rgba(0, 0, 0, 0.25)", "none")
          }}
          _active={{
            transform: 'scale(0.95)'
          }}
          transition="all 0.2s ease-in-out"
          leftIcon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
          iconSpacing={{ base: 1, sm: 2, md: 3 }}
          px={{ base: 2, sm: 3, md: 4, lg: 4 }}
          py={{ base: 1, sm: 2, md: 2 }}
          fontWeight="semibold"
          aria-label={isExpanded ? "Hide details" : "Show details"}
        >
          <Text fontSize={{ base: "sm", sm: "sm", md: "md" }} display={{ base: "none", sm: "block" }}>
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Text>
        </Button>
      </Box>

      {/* Conteúdo colapsável */}
      <Collapse 
        in={isExpanded} 
        animateOpacity 
        transition={{
          enter: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
          exit: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
        }}
      >
        <Box
          mt={2}
          borderRadius="xl"
          overflow="hidden"
          bg={useColorModeValue('rgba(255,255,255,0.5)', 'rgba(0,0,0,0.3)')}
          backdropFilter="blur(10px)"
          border="1px solid"
          borderColor={useColorModeValue('rgba(0,0,0,0.05)', 'rgba(255,255,255,0.05)')}
          p={{ base: 0.5, sm: 1, md: 2, lg: 3 }}
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            gap={{ base: 1, lg: 3 }}
            align="flex-start"
            maxW="1600px"
            mx="auto"
            minW="0"
          >
            <Box
              width={{ base: "100%", lg: "50%", xl: "50%" }}
              maxW={{ lg: "600px", xl: "700px" }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              flexShrink={0}
            >
              <Box
                width="100%"
                maxW={{ base: '100%', lg: '100%' }}
                height={flagHeight}
                borderRadius={flagBorderRadius}
                overflow="hidden"
                boxShadow={{
                  base: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  sm: "0 6px 16px rgba(0, 0, 0, 0.12)",
                  md: "0 8px 20px rgba(0, 0, 0, 0.15)",
                  lg: "0 10px 24px rgba(0, 0, 0, 0.18)"
                }}
                bg="linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)"
                _dark={{
                  bg: "linear-gradient(135deg, #1e293b 0%, #334155 100%)"
                }}
                _hover={{
                  transform: "scale(1.005)",
                  boxShadow: {
                    base: "0 6px 16px rgba(0, 0, 0, 0.15)",
                    sm: "0 8px 20px rgba(0, 0, 0, 0.18)",
                    md: "0 12px 28px rgba(0, 0, 0, 0.22)",
                    lg: "0 16px 32px rgba(0, 0, 0, 0.25)"
                  }
                }}
                transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                display="flex"
                alignItems="center"
                justifyContent="center"
                border="1px solid"
                borderColor={useColorModeValue('rgba(0,0,0,0.06)', 'rgba(255,255,255,0.08)')}
              >
                <EnhancedFlag countryCode={countryId.toUpperCase()} isHero={false} />
              </Box>
            </Box>

            {/* Lado Direito: Infoboxes e botões (50% em lg, 100% em mobile) */}
            <Box
              flex="1"
              display="flex"
              flexDirection="column"
              w={{ base: "100%", lg: "50%" }}
              alignSelf="stretch"
            >
              {/* Grid dinâmico de infoboxes - organizados automaticamente */}
              <Box
                display="grid"
                gridTemplateColumns={{
                  base: "repeat(2, 1fr)",
                  md: "repeat(3, 1fr)",
                  lg: "repeat(3, 1fr)"
                }}
                gap={{ base: 1.5, sm: 2, md: 2, lg: 2.5 }}
                w="full"
                alignItems="stretch"
                gridAutoRows="1fr"
              >

                {/* InfoBoxes principais */}
                <InfoBox icon={FaLanguage} label="Language" value={countryInfo?.officialLanguage} colorScheme="orange" size={{ base: "default", sm: "default", md: "default", lg: "compact", xl: "compactXl" }} />
                <InfoBox icon={FaUsers} label="Population" value={countryInfo?.population ? formatPopulation(countryInfo.population) : undefined} colorScheme="green" size={{ base: "default", sm: "default", md: "default", lg: "compact", xl: "compactXl" }} />
                <InfoBox icon={FaThermometerHalf} label="Temperature" value={weatherData?.temperature ? `${weatherData.temperature}°C` : undefined} colorScheme="red" size={{ base: "default", sm: "default", md: "default", lg: "compact", xl: "compactXl" }} />

                {/* See More com fundo destacado - cor mais sutil */}
                <Box
                  p={{ base: 2, sm: 3, md: 4, lg: 2, xl: 3 }}
                  bg="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="gray.200"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(197, 207, 226, 0.3)"
                  }}
                  transition="all 0.3s ease"
                  cursor="pointer"
                  onClick={onOpen}
                  color="gray.600"
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={{ base: 1, sm: 2, lg: 1, xl: 2 }}
                  h="100%"
                  minH={{ lg: "100px", xl: "160px" }}
                >
                  <Box p={{ base: 1, sm: 2 }} borderRadius="full" bg="rgba(0, 0, 0, 0.1)" color="gray.600">
                    <Icon as={FaBook} boxSize={{ base: 4, sm: 5, md: 6 }} />
                  </Box>
                  <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="bold">See more</Text>
                  <Text fontSize={{ base: "xs", sm: "sm" }} opacity={0.8}>More indicators</Text>
                </Box>

                {/* Check Flights com fundo destacado */}
                <Box
                  p={{ base: 2, sm: 3, md: 4, lg: 2, xl: 3 }}
                  bg="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="teal.200"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(168, 237, 234, 0.3)"
                  }}
                  transition="all 0.3s ease"
                  cursor="pointer"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(
                        countries.getName(countryId.toUpperCase(), 'en')
                      )}`,
                      '_blank'
                    )
                  }
                  color="gray.700"
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={{ base: 1, sm: 2, lg: 1, xl: 2 }}
                  h="100%"
                  minH={{ lg: "100px", xl: "160px" }}
                >
                  <Box p={{ base: 1, sm: 2 }} borderRadius="full" bg="rgba(0, 0, 0, 0.1)" color="gray.700">
                    <Icon as={FaPlane} boxSize={{ base: 4, sm: 5, md: 6 }} />
                  </Box>
                  <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="bold">Check Flights</Text>
                  <Text fontSize={{ base: "xs", sm: "sm" }} opacity={0.8}>
                    to {countries.getName(countryId.toUpperCase(), 'en')}
                  </Text>
                </Box>

                {/* Find Hotels com fundo destacado */}
                <Box
                  p={{ base: 2, sm: 3, md: 4, lg: 2, xl: 3 }}
                  bg="linear-gradient(135deg, #fff5e6 0%, #ffe4b3 100%)"
                  borderRadius="xl"
                  border="2px solid"
                  borderColor="orange.200"
                  _hover={{
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 25px rgba(255, 245, 230, 0.4)"
                  }}
                  transition="all 0.3s ease"
                  cursor="pointer"
                  onClick={() =>
                    window.open(
                      `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(
                        countries.getName(countryId.toUpperCase(), 'en')
                      )}`,
                      '_blank'
                    )
                  }
                  color="gray.700"
                  textAlign="center"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  gap={{ base: 1, sm: 2, lg: 1, xl: 2 }}
                  h="100%"
                  minH={{ lg: "100px", xl: "160px" }}
                >
                  <Box p={{ base: 1, sm: 2 }} borderRadius="full" bg="rgba(0, 0, 0, 0.08)" color="gray.700">
                    <Icon as={FaCity} boxSize={{ base: 4, sm: 5, md: 6 }} />
                  </Box>
                  <Text fontSize={{ base: "sm", sm: "md", md: "lg" }} fontWeight="bold">Find Hotels</Text>
                  <Text fontSize={{ base: "xs", sm: "sm" }} opacity={0.8}>
                    in {countries.getName(countryId.toUpperCase(), 'en')}
                  </Text>
                </Box>

              </Box>
            </Box>
          </Flex>
        </Box>
      </Collapse>

      {/* Modal com os indicadores usando o novo componente */}
      <BaseModal isOpen={isOpen} onClose={onClose} title="Detailed Indicators">
        <IndicatorsModal
          indicatorsData={indicatorsData}
          weatherData={weatherData}
          exchangeRate={exchangeRate}
          countryInfo={countryInfo}
          factbookData={factbookData}
        />
      </BaseModal>
    </Box>
  );
};

export default HeroHeader;