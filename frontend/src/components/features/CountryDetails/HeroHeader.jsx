import {
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  HStack,
  IconButton,
  Text,
  VStack,
  chakra,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import countries from 'i18n-iso-countries';
import moment from 'moment-timezone';
import {
  FaBed,
  FaChartBar,
  FaChartLine,
  FaHeartbeat,
  FaLanguage,
  FaPlane,
  FaPoundSign,
  FaThermometerHalf,
  FaUsers,
} from 'react-icons/fa';
import EnhancedFlag from './EnhancedFlag';
import InfoBox from './InfoBox';
import BaseModal from '../../modals/BaseModal';
import IndicatorsModal from './IndicatorsModal';
import { useLandingTokens } from '../landing/landingUI';

export default function HeroHeader({
  countryId,
  countryInfo,
  weatherData,
  currentTime,
  exchangeRate,
  indicatorsData,
  factbookData,
  navigate,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true });
  const t = useLandingTokens();

  const isSmall = useBreakpointValue({ base: true, md: false });
  const buttonText = useBreakpointValue({ base: 'View Data', md: 'View Indicators' });
  const flightsButtonText = useBreakpointValue({ base: 'Flights', md: 'Check Flights' });
  const hotelsButtonText = useBreakpointValue({ base: 'Hotels', md: 'Find Hotels' });

  const countryName = countries.getName(countryId?.toUpperCase() || '', 'en') || countryId?.toUpperCase();
  const dateFormatted = weatherData?.timezone
    ? moment().utcOffset(weatherData.timezone / 60).format('DD/MM/YYYY')
    : moment().format('DD/MM/YYYY');

  const compactBoxProps = {
    size: 'compact',
    variant: 'flat',
    sx: {
      p: { base: 2, sm: 2.5, md: 3 },
      minH: { base: '74px', sm: '82px', md: '96px' },
      borderRadius: '12px',
      boxShadow: 'none',
    },
  };
  const mobileBoxProps = {
    size: 'compact',
    variant: 'flat',
    sx: {
      p: 2,
      minH: '92px',
      borderRadius: '10px',
      boxShadow: 'none',
    },
  };

  const actionButtonBase = {
    size: 'sm',
    borderRadius: '10px',
    height: { base: '36px', md: '38px' },
    fontWeight: '600',
    fontSize: { base: 'xs', md: '13px' },
    transition: 'all .2s ease',
    minW: 0,
    px: { base: 2.5, md: 3 },
    whiteSpace: 'nowrap',
  };

  const metricCards = [
    {
      icon: FaLanguage,
      label: 'Language',
      value: countryInfo?.officialLanguage,
    },
    {
      icon: FaUsers,
      label: 'Population',
      value: countryInfo?.population ? countryInfo.population.toLocaleString('en-US') : 'N/A',
    },
    {
      icon: FaThermometerHalf,
      label: 'Temperature',
      value: weatherData?.temperature !== undefined ? `${weatherData.temperature} C` : 'N/A',
    },
    {
      icon: FaChartLine,
      label: 'GDP per capita',
      value: indicatorsData?.gdpPerCapitaCurrent?.value || 'N/A',
    },
    {
      icon: FaPoundSign,
      label: 'Exchange Rate',
      value: exchangeRate ? `GBP 1 = ${exchangeRate} ${countryInfo?.currency || ''}` : 'N/A',
    },
    {
      icon: FaHeartbeat,
      label: 'Life Expectancy',
      value: indicatorsData?.lifeExpectancy?.value || 'N/A',
    },
  ];
  const mobileMetricSlides = [
    metricCards.slice(0, 3),
    metricCards.slice(3, 6),
  ];

  const OneLine = () => (
    <Text
      fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
      color={t.text}
      noOfLines={1}
      whiteSpace="nowrap"
      overflow="hidden"
      textOverflow="ellipsis"
    >
      <chakra.span fontWeight="800">{countryName}</chakra.span>
      {countryInfo?.capital && <chakra.span color={t.textSoft}> - {countryInfo.capital}</chakra.span>}
      <chakra.span color={t.textSoft}> - {currentTime || '--:--:--'}</chakra.span>
      <chakra.span color={isSmall ? t.textMuted : t.textSoft} fontSize={isSmall ? '10px' : 'inherit'}>
        {' '}
        - {dateFormatted}
      </chakra.span>
    </Text>
  );

  return (
    <Box mb={{ base: 3, md: 4 }} w="100%">
      <Box
        px={{ base: 2.5, sm: 4, md: 5 }}
        py={{ base: 2, sm: 2.5 }}
        borderRadius="14px"
        border="1px solid"
        borderColor={t.hairline}
        bg={t.surface}
        boxShadow={t.shadowSm}
      >
        <Grid templateColumns="auto 1fr auto" alignItems="center" columnGap={{ base: 2, md: 3 }}>
          <IconButton
            aria-label="Go back"
            icon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            size="sm"
            borderRadius="10px"
            bg={t.surfaceSubtle}
            border="1px solid"
            borderColor={t.hairline}
            color={t.textSoft}
            _hover={{ bg: t.primarySoftBg, borderColor: t.primary, color: t.primary }}
          />

          <Box minW={0} textAlign="center">
            <OneLine />
          </Box>

          <IconButton
            aria-label="Toggle details"
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onToggle}
            size="sm"
            borderRadius="10px"
            bg={t.surfaceSubtle}
            border="1px solid"
            borderColor={t.hairline}
            color={t.textSoft}
            _hover={{ bg: t.primarySoftBg, borderColor: t.primary, color: t.primary }}
          />
        </Grid>
      </Box>

      <Collapse in={isExpanded} animateOpacity>
        <Box
          mt={3}
          borderRadius="16px"
          border="1px solid"
          borderColor={t.hairline}
          p={{ base: 3, sm: 4, md: 5, xl: 6 }}
          boxShadow={t.shadowMd}
          bg={t.surface}
          position="relative"
          overflow="hidden"
          _after={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            bg: t.primary,
          }}
        >
          <Grid
            templateColumns={{ base: '1fr', lg: 'minmax(300px, 0.72fr) minmax(0, 1.28fr)' }}
            alignItems="stretch"
            gap={{ base: 4, lg: 6 }}
          >
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius="14px"
              overflow="hidden"
              h={{ base: '170px', sm: '210px', md: '260px', lg: '100%' }}
              minH={{ lg: '304px', xl: '316px' }}
              bg={t.surfaceSubtle}
              border="1px solid"
              borderColor={t.hairline}
            >
              <Box w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
                <EnhancedFlag countryCode={countryId?.toUpperCase()} isHero={false} />
              </Box>
            </Box>

            <Flex minW={0} direction="column" justify="space-between">
              <VStack align="stretch" spacing={2.5} mb={{ base: 3, md: 4 }}>
                <HStack spacing={2}>
                  <Box w="20px" h="2px" borderRadius="full" bg={t.primary} />
                  <Text fontSize="xs" fontWeight="700" letterSpacing="0.14em" textTransform="uppercase" color={t.primary}>
                    Country overview
                  </Text>
                </HStack>

                <Flex
                  w="full"
                  align={{ base: 'stretch', xl: 'center' }}
                  justify="space-between"
                  gap={{ base: 2, md: 3 }}
                  direction={{ base: 'column', xl: 'row' }}
                  minW={0}
                >
                  <Text
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="800"
                    color={t.text}
                    lineHeight="1.1"
                    minW={0}
                    maxW="100%"
                    noOfLines={{ base: 2, xl: 1 }}
                  >
                    {countryName}
                  </Text>

                  <Grid
                    templateColumns={{ base: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(3, max-content)' }}
                    gap={1.5}
                    w={{ base: 'full', xl: 'auto' }}
                    maxW="full"
                    flexShrink={0}
                  >
                    <Button
                      onClick={onOpen}
                      leftIcon={<FaChartBar />}
                      bg={t.primary}
                      color="white"
                      boxShadow={t.shadowSm}
                      _hover={{ transform: 'translateY(-1px)', boxShadow: t.shadowMd, bg: t.primaryHover }}
                      _active={{ transform: 'translateY(0)' }}
                      {...actionButtonBase}
                    >
                      {buttonText}
                    </Button>
                    <Button
                      onClick={() => window.open(`https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(countryName)}`, '_blank')}
                      leftIcon={<FaPlane />}
                      bg="transparent"
                      border="1px solid"
                      borderColor={t.hairlineStrong}
                      color={t.text}
                      _hover={{ transform: 'translateY(-1px)', boxShadow: t.shadowMd, bg: t.primarySoftBg, color: t.primary, borderColor: t.primary }}
                      _active={{ transform: 'translateY(0)' }}
                      {...actionButtonBase}
                    >
                      {flightsButtonText}
                    </Button>
                    <Button
                      onClick={() => window.open(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(countryName)}`, '_blank')}
                      leftIcon={<FaBed />}
                      bg="transparent"
                      border="1px solid"
                      borderColor={t.hairlineStrong}
                      color={t.text}
                      _hover={{ transform: 'translateY(-1px)', boxShadow: t.shadowMd, bg: t.primarySoftBg, color: t.primary, borderColor: t.primary }}
                      _active={{ transform: 'translateY(0)' }}
                      {...actionButtonBase}
                    >
                      {hotelsButtonText}
                    </Button>
                  </Grid>
                </Flex>

                <Text fontSize="sm" color={t.textSoft}>
                  Essential trip context, live conditions, and travel actions.
                </Text>
              </VStack>

              <Box
                display={{ base: 'block', md: 'none' }}
                w="full"
                mb={3}
                position="relative"
                overflowX="auto"
                overflowY="hidden"
                pb={3}
                sx={{
                  scrollSnapType: 'x mandatory',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'none',
                  '&::-webkit-scrollbar': { display: 'none' },
                }}
                _after={{
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bottom: '12px',
                  w: '28px',
                  pointerEvents: 'none',
                  bg: `linear-gradient(90deg, rgba(0,0,0,0), ${t.surface})`,
                }}
              >
                <HStack align="stretch" spacing={3} w="max-content">
                  {mobileMetricSlides.map((slide, index) => (
                    <Box key={index} w="calc(100vw - 48px)" maxW="560px" scrollSnapAlign="start">
                      <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
                        {slide.map((card) => (
                          <InfoBox
                            key={card.label}
                            icon={card.icon}
                            label={card.label}
                            value={card.value}
                            colorScheme="blue"
                            layout="stacked"
                            {...mobileBoxProps}
                          />
                        ))}
                      </Grid>
                    </Box>
                  ))}
                </HStack>
                <HStack spacing={1.5} justify="center" mt={2}>
                  {mobileMetricSlides.map((_, index) => (
                    <Box
                      key={index}
                      w={index === 0 ? '18px' : '7px'}
                      h="7px"
                      borderRadius="full"
                      bg={index === 0 ? t.primary : t.hairlineStrong}
                    />
                  ))}
                </HStack>
              </Box>

              <Grid
                templateColumns={{ md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }}
                gap={{ base: 2, sm: 3 }}
                mb={{ base: 3, md: 4 }}
                w="full"
                display={{ base: 'none', md: 'grid' }}
              >
                {metricCards.map((card) => (
                  <InfoBox key={card.label} icon={card.icon} label={card.label} value={card.value} colorScheme="blue" {...compactBoxProps} />
                ))}
              </Grid>
            </Flex>
          </Grid>
        </Box>
      </Collapse>

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
}
