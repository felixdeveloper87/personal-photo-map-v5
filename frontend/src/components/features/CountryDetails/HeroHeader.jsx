import { useCallback, useRef, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Grid,
  HStack,
  IconButton,
  Text,
  chakra,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowBackIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import countries from 'i18n-iso-countries';
import moment from 'moment-timezone';
import {
  FaBed,
  FaChartBar,
  FaChartLine,
  FaExchangeAlt,
  FaHeartbeat,
  FaLanguage,
  FaPlane,
  FaThermometerHalf,
  FaUsers,
} from 'react-icons/fa';
import EnhancedFlag from './EnhancedFlag';
import InfoBox from './InfoBox';
import LiveClock from './LiveClock';
import AddPhotosButton from './AddPhotosButton';
import BaseModal from '../../modals/BaseModal';
import IndicatorsModal from './IndicatorsModal';
import { useLandingTokens } from '../landing/landingUI';

const SERIF = "'Instrument Serif', Georgia, serif";
const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });

const hasValue = (v) => v !== undefined && v !== null && v !== '' && v !== 'N/A';

const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const formatUtcOffset = (offsetSeconds) =>
  offsetSeconds == null ? null : `UTC${moment().utcOffset(offsetSeconds / 60).format('Z').replace('-', '−')}`;

export default function HeroHeader({
  countryId,
  countryInfo,
  weatherData,
  exchange,
  onCycleBaseCurrency,
  indicatorsData,
  factbookData,
  onUploadSuccess,
}) {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isExpanded, onToggle } = useDisclosure({ defaultIsOpen: true });
  const t = useLandingTokens();

  const isSmall = useBreakpointValue({ base: true, md: false });
  const indicatorsText = useBreakpointValue({ base: 'Data', md: 'Indicators' });
  const flightsText = useBreakpointValue({ base: 'Flights', md: 'Check Flights' });
  const hotelsText = useBreakpointValue({ base: 'Hotels', md: 'Find Hotels' });

  const countryName = countries.getName(countryId?.toUpperCase() || '', 'en') || countryId?.toUpperCase();
  const offsetSeconds = weatherData?.timezone ?? null;
  const dateFormatted = (offsetSeconds != null ? moment().utcOffset(offsetSeconds / 60) : moment()).format('DD/MM/YYYY');
  const capital = hasValue(countryInfo?.capital) ? countryInfo.capital : null;

  // Return to wherever the user came from (country list, map…); fall back to the map on a fresh tab.
  const handleBack = useCallback(() => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/');
  }, [navigate]);

  // Country-specific subtitle instead of generic marketing copy.
  const subtitleParts = [
    capital && `Capital ${capital}`,
    hasValue(countryInfo?.currency) &&
      (hasValue(countryInfo?.currencyName) && countryInfo.currencyName !== 'Unknown Currency'
        ? `${countryInfo.currencyName} (${countryInfo.currency})`
        : countryInfo.currency),
    formatUtcOffset(offsetSeconds),
  ].filter(Boolean);

  const metricCards = [
    {
      icon: FaLanguage,
      label: 'Language',
      value: hasValue(countryInfo?.officialLanguage) ? countryInfo.officialLanguage : 'N/A',
      tone: 'amber',
    },
    {
      icon: FaUsers,
      label: 'Population',
      value: countryInfo?.population ? compactNumber.format(countryInfo.population) : 'N/A',
      tooltip: countryInfo?.population ? `${countryInfo.population.toLocaleString('en-US')} people` : null,
      tone: 'teal',
    },
    {
      icon: FaThermometerHalf,
      label: capital ? `Now in ${capital}` : 'Temperature',
      value: typeof weatherData?.temperature === 'number' ? `${Math.round(weatherData.temperature)}°C` : 'N/A',
      tooltip: weatherData?.description ? capitalize(weatherData.description) : null,
      tone: 'rose',
    },
    {
      icon: FaChartLine,
      label: 'GDP per capita',
      value: indicatorsData?.gdpPerCapitaCurrent?.value || 'N/A',
      tone: 'amber',
    },
    {
      icon: FaExchangeAlt,
      label: 'Exchange Rate',
      value: exchange?.label || 'N/A',
      tooltip: exchange ? 'Tap to switch base currency (USD · EUR · GBP · BRL)' : null,
      onClick: exchange ? onCycleBaseCurrency : undefined,
      tone: 'teal',
    },
    {
      icon: FaHeartbeat,
      label: 'Life Expectancy',
      value: indicatorsData?.lifeExpectancy?.value || 'N/A',
      tone: 'rose',
    },
  ];
  const mobileMetricSlides = [metricCards.slice(0, 3), metricCards.slice(3, 6)];

  // Mobile carousel: keep the pagination dots in sync with the scroll position.
  const carouselRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const handleCarouselScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const slideWidth = el.firstElementChild?.firstElementChild?.offsetWidth || el.clientWidth;
    setActiveSlide(Math.round(el.scrollLeft / slideWidth));
  }, []);
  const scrollToSlide = (index) => {
    const el = carouselRef.current;
    const slide = el?.firstElementChild?.children?.[index];
    if (el && slide) el.scrollTo({ left: slide.offsetLeft - el.firstElementChild.offsetLeft, behavior: 'smooth' });
  };

  const iconButtonProps = {
    size: 'sm',
    borderRadius: '10px',
    bg: t.surfaceSubtle,
    border: '1px solid',
    borderColor: t.hairline,
    color: t.textSoft,
    _hover: { bg: t.primarySoftBg, borderColor: t.primary, color: t.primary },
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
    flex: { base: '1 1 0', xl: '0 0 auto' },
    _active: { transform: 'translateY(0)' },
  };
  const primaryButton = {
    ...actionButtonBase,
    bg: t.primary,
    color: t.bg,
    boxShadow: t.shadowSm,
    _hover: { transform: 'translateY(-1px)', boxShadow: t.shadowMd, bg: t.primaryHover },
  };
  const outlineButton = {
    ...actionButtonBase,
    bg: 'transparent',
    border: '1px solid',
    borderColor: t.hairlineStrong,
    color: t.text,
    _hover: { transform: 'translateY(-1px)', boxShadow: t.shadowMd, bg: t.primarySoftBg, color: t.primary, borderColor: t.primary },
  };

  return (
    <Box mb={{ base: 3, md: 4 }} w="100%">
      {/* Top bar — the country name only appears here when the hero is collapsed */}
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
          <IconButton aria-label="Go back" icon={<ArrowBackIcon />} onClick={handleBack} {...iconButtonProps} />

          <Text
            minW={0}
            textAlign="center"
            fontSize={{ base: 'xs', sm: 'sm', md: 'md' }}
            color={t.text}
            noOfLines={1}
          >
            {!isExpanded && <chakra.span fontWeight="800">{countryName} · </chakra.span>}
            {capital && <chakra.span color={t.textSoft}>{capital} · </chakra.span>}
            <LiveClock offsetSeconds={offsetSeconds} fontFamily={MONO} color={t.primary} letterSpacing="0.02em" />
            <chakra.span
              fontFamily={MONO}
              color={isSmall ? t.textMuted : t.textSoft}
              fontSize={isSmall ? '10px' : 'xs'}
              letterSpacing="0.02em"
            >
              {' '}
              · {dateFormatted}
            </chakra.span>
          </Text>

          <IconButton
            aria-label={isExpanded ? 'Collapse country overview' : 'Expand country overview'}
            aria-expanded={isExpanded}
            icon={isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
            onClick={onToggle}
            {...iconButtonProps}
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
          _after={{ content: '""', position: 'absolute', top: 0, left: 0, right: 0, height: '3px', bg: t.primary }}
        >
          <Grid
            templateColumns={{ base: '1fr', lg: 'minmax(220px, 0.45fr) minmax(0, 1.55fr)' }}
            alignItems="stretch"
            gap={{ base: 4, lg: 6 }}
          >
            {/* Stacked layouts: height follows the width (2:1) but is capped so the flag never
                dominates the screen. Side-by-side (lg+): stretches to the row height. */}
            <Box
              position="relative"
              w="100%"
              borderRadius="14px"
              overflow="hidden"
              bg={t.surfaceSubtle}
              border="1px solid"
              borderColor={t.hairline}
              sx={{ aspectRatio: { base: '2 / 1', lg: 'auto' } }}
              maxH={{ base: '180px', sm: '220px', md: '260px', lg: 'none' }}
              h={{ lg: '100%' }}
              minH={{ base: '120px', lg: '240px' }}
            >
              <EnhancedFlag countryCode={countryId?.toUpperCase()} backdrop />
            </Box>

            <Flex minW={0} direction="column" justify="space-between" gap={{ base: 3, md: 4 }}>
              <Box>
                <HStack spacing={2.5} mb={2.5}>
                  <Box w="22px" h="2px" borderRadius="full" bg={t.primary} />
                  <Text
                    fontFamily={MONO}
                    fontSize="xs"
                    fontWeight="700"
                    letterSpacing="0.08em"
                    textTransform="uppercase"
                    color={t.primary}
                  >
                    Country overview
                  </Text>
                </HStack>

                <Flex
                  w="full"
                  align={{ base: 'stretch', xl: 'center' }}
                  justify="space-between"
                  gap={{ base: 2.5, md: 3 }}
                  direction={{ base: 'column', xl: 'row' }}
                  minW={0}
                >
                  <Box minW={0}>
                    <Text
                      as="h1"
                      fontFamily={SERIF}
                      fontSize={{ base: '2rem', md: '2.6rem' }}
                      fontWeight="400"
                      color={t.text}
                      lineHeight="1.04"
                      noOfLines={{ base: 2, xl: 1 }}
                    >
                      {countryName}
                    </Text>
                    {subtitleParts.length > 0 && (
                      <Text mt={1.5} fontSize="sm" color={t.textSoft} noOfLines={2}>
                        {subtitleParts.join(' · ')}
                      </Text>
                    )}
                  </Box>

                  <Flex gap={1.5} flexWrap={{ base: 'wrap', sm: 'nowrap' }} flexShrink={0}>
                    <AddPhotosButton countryId={countryId} onUploadSuccess={onUploadSuccess} {...primaryButton} />
                    <Button
                      onClick={() =>
                        window.open(
                          `https://www.google.com/travel/flights?q=Flights%20to%20${encodeURIComponent(countryName)}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      leftIcon={<FaPlane />}
                      {...outlineButton}
                    >
                      {flightsText}
                    </Button>
                    <Button
                      onClick={() =>
                        window.open(
                          `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(countryName)}`,
                          '_blank',
                          'noopener,noreferrer'
                        )
                      }
                      leftIcon={<FaBed />}
                      {...outlineButton}
                    >
                      {hotelsText}
                    </Button>
                    <Button onClick={onOpen} leftIcon={<FaChartBar />} {...outlineButton}>
                      {indicatorsText}
                    </Button>
                  </Flex>
                </Flex>
              </Box>

              {/* Mobile: two swipeable pages of three metrics */}
              <Box display={{ base: 'block', md: 'none' }} w="full">
                <Box
                  ref={carouselRef}
                  onScroll={handleCarouselScroll}
                  w="full"
                  overflowX="auto"
                  overflowY="hidden"
                  sx={{
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                  }}
                >
                  <HStack align="stretch" spacing={3} w="max-content">
                    {mobileMetricSlides.map((slide, index) => (
                      <Box key={index} w="calc(100vw - 72px)" maxW="560px" scrollSnapAlign="start">
                        <Grid templateColumns="repeat(3, minmax(0, 1fr))" gap={2}>
                          {slide.map((card) => (
                            <InfoBox
                              key={card.label}
                              icon={card.icon}
                              label={card.label}
                              value={card.value}
                              tooltip={card.tooltip}
                              onClick={card.onClick}
                              colorScheme={card.tone}
                              layout="stacked"
                              size="compact"
                              variant="flat"
                              sx={{ p: 2, minH: '92px', borderRadius: '10px', boxShadow: 'none' }}
                            />
                          ))}
                        </Grid>
                      </Box>
                    ))}
                  </HStack>
                </Box>
                <HStack spacing={1.5} justify="center" mt={2.5}>
                  {mobileMetricSlides.map((_, index) => (
                    <Box
                      key={index}
                      as="button"
                      type="button"
                      aria-label={`Show metrics page ${index + 1}`}
                      aria-current={activeSlide === index}
                      onClick={() => scrollToSlide(index)}
                      w={activeSlide === index ? '18px' : '7px'}
                      h="7px"
                      borderRadius="full"
                      bg={activeSlide === index ? t.primary : t.hairlineStrong}
                      transition="all .2s ease"
                    />
                  ))}
                </HStack>
              </Box>

              <Grid
                templateColumns={{ md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' }}
                gap={{ base: 2, sm: 3 }}
                w="full"
                display={{ base: 'none', md: 'grid' }}
              >
                {metricCards.map((card) => (
                  <InfoBox
                    key={card.label}
                    icon={card.icon}
                    label={card.label}
                    value={card.value}
                    tooltip={card.tooltip}
                    onClick={card.onClick}
                    colorScheme={card.tone}
                    size="compact"
                    variant="flat"
                    sx={{ p: { base: 2, sm: 2.5, md: 3 }, minH: { base: '74px', sm: '82px', md: '96px' }, borderRadius: '12px', boxShadow: 'none' }}
                  />
                ))}
              </Grid>
            </Flex>
          </Grid>
        </Box>
      </Collapse>

      <BaseModal isOpen={isOpen} onClose={onClose} title="Detailed Indicators" icon={FaChartBar} size="2xl">
        <IndicatorsModal
          indicatorsData={indicatorsData}
          weatherData={weatherData}
          exchange={exchange}
          countryInfo={countryInfo}
          factbookData={factbookData}
        />
      </BaseModal>
    </Box>
  );
}
