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

  const actionButtonBase = {
    size: 'sm',
    borderRadius: '10px',
    height: { base: '36px', md: '38px' },
    fontWeight: '600',
    fontSize: { base: 'xs', md: 'sm' },
    transition: 'all .2s ease',
    minW: 0,
    px: { base: 3, md: 3.5 },
  };

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
          <Flex direction={{ base: 'column', md: 'row' }} align="stretch" gap={{ base: 4, md: 6 }}>
            <Box
              flex={{ base: 'none', md: '1 1 44%' }}
              display="flex"
              justifyContent="center"
              alignItems="center"
              borderRadius="14px"
              overflow="hidden"
              h={{ base: '170px', sm: '210px', md: '280px', lg: '320px' }}
              bg={t.surfaceSubtle}
              border="1px solid"
              borderColor={t.hairline}
            >
              <Box w="100%" h="100%" display="flex" justifyContent="center" alignItems="center">
                <EnhancedFlag countryCode={countryId?.toUpperCase()} isHero={false} />
              </Box>
            </Box>

            <Flex flex={{ base: 'none', md: '1 1 56%' }} direction="column" justify="space-between">
              <VStack align="start" spacing={2.5} mb={{ base: 3, md: 4 }}>
                <HStack spacing={2}>
                  <Box w="20px" h="2px" borderRadius="full" bg={t.primary} />
                  <Text fontSize="xs" fontWeight="700" letterSpacing="0.14em" textTransform="uppercase" color={t.primary}>
                    Country overview
                  </Text>
                </HStack>

                <Flex
                  w="full"
                  align={{ base: 'flex-start', xl: 'center' }}
                  justify="space-between"
                  gap={{ base: 2, md: 3 }}
                  direction={{ base: 'column', xl: 'row' }}
                >
                  <Text
                    fontSize={{ base: 'xl', md: '2xl' }}
                    fontWeight="800"
                    color={t.text}
                    lineHeight="1.1"
                    minW={0}
                    noOfLines={{ base: 2, xl: 1 }}
                  >
                    {countryName}
                  </Text>

                  <Grid
                    templateColumns={{ base: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(3, max-content)' }}
                    gap={1.5}
                    w={{ base: 'full', xl: 'auto' }}
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

              <Grid templateColumns="repeat(3, 1fr)" gap={{ base: 2, sm: 3 }} mb={{ base: 3, md: 4 }} w="full">
                <InfoBox icon={FaLanguage} label="Language" value={countryInfo?.officialLanguage} colorScheme="blue" {...compactBoxProps} />
                <InfoBox
                  icon={FaUsers}
                  label="Population"
                  value={countryInfo?.population ? countryInfo.population.toLocaleString('en-US') : 'N/A'}
                  colorScheme="blue"
                  {...compactBoxProps}
                />
                <InfoBox
                  icon={FaThermometerHalf}
                  label="Temperature"
                  value={weatherData?.temperature !== undefined ? `${weatherData.temperature} C` : 'N/A'}
                  colorScheme="blue"
                  {...compactBoxProps}
                />
              </Grid>

              <Grid
                templateColumns="repeat(3, 1fr)"
                gap={{ base: 2, sm: 3 }}
                mb={{ base: 3, md: 4 }}
                w="full"
                display={{ base: 'none', md: 'grid' }}
              >
                <InfoBox
                  icon={FaChartLine}
                  label="GDP per capita"
                  value={indicatorsData?.gdpPerCapitaCurrent?.value || 'N/A'}
                  colorScheme="blue"
                  {...compactBoxProps}
                />
                <InfoBox
                  icon={FaPoundSign}
                  label="Exchange Rate"
                  value={exchangeRate ? `GBP 1 = ${exchangeRate} ${countryInfo?.currency || ''}` : 'N/A'}
                  colorScheme="blue"
                  {...compactBoxProps}
                />
                <InfoBox
                  icon={FaHeartbeat}
                  label="Life Expectancy"
                  value={indicatorsData?.lifeExpectancy?.value || 'N/A'}
                  colorScheme="blue"
                  {...compactBoxProps}
                />
              </Grid>
            </Flex>
          </Flex>
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
