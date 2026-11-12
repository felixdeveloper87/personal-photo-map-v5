import { Navigate, useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react';
import { useCallback, useContext, useMemo } from 'react';
import { CountriesContext } from '../../../context/CountriesContext';
import { useLandingTokens } from '../landing/landingUI';
import { fetchWorldBankIndicators } from '../../../data/worldBankService';

import HeroHeader from './HeroHeader';
import PhotoManager from '../photos/PhotoManager';
import LoadingState from './LoadingState';
import { fetchCountryData, fetchWeatherData, fetchExchangeRates, fetchFactbookData } from './services';
import useBaseCurrency, { formatExchange } from './useBaseCurrency';

const COUNTRY_ID_RE = /^[a-z]{2}$/i;

const CountryDetails = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const t = useLandingTokens();
  const { base: baseCurrency, cycleBase } = useBaseCurrency();

  const isValidId = COUNTRY_ID_RE.test(countryId ?? '');

  const {
    data: countryInfo,
    isLoading: countryLoading,
    isError: countryError,
    refetch: refetchCountry,
    isFetching: countryFetching,
  } = useQuery({
    queryKey: ['country', countryId],
    queryFn: () => fetchCountryData(countryId),
    enabled: isValidId,
    staleTime: 10 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const { data: weatherData } = useQuery({
    queryKey: ['weather', countryId, countryInfo?.capital],
    queryFn: () => fetchWeatherData(countryInfo.capital, countryId),
    enabled: !!countryInfo?.capital && countryInfo.capital !== 'N/A',
    staleTime: 5 * 60 * 1000,
  });

  const { data: exchangeRates } = useQuery({
    queryKey: ['exchangeRates', 'USD'],
    queryFn: fetchExchangeRates,
    enabled: !!countryInfo?.currency && countryInfo.currency !== 'N/A',
    staleTime: 60 * 60 * 1000,
  });

  const { data: factbookData } = useQuery({
    queryKey: ['factbook', countryId],
    queryFn: () => fetchFactbookData(countryId),
    enabled: isValidId,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const { data: indicatorsData, isLoading: indicatorsLoading } = useQuery({
    queryKey: ['worldBank', countryId],
    queryFn: () => fetchWorldBankIndicators(countryId),
    enabled: isValidId,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  const exchange = useMemo(
    () => formatExchange(exchangeRates, baseCurrency, countryInfo?.currency),
    [exchangeRates, baseCurrency, countryInfo?.currency]
  );

  const handleUploadSuccess = useCallback(async () => {
    await Promise.all(
      ['allImages', 'years', 'albums', 'userPhotos'].map((key) =>
        queryClient.invalidateQueries({ queryKey: [key, countryId] })
      )
    );
    await refreshCountriesWithPhotos(true);
  }, [queryClient, countryId, refreshCountriesWithPhotos]);

  if (!isValidId) return <Navigate to="/not-found" replace />;
  if (countryLoading) return <LoadingState mutedTextColor={t.textSoft} />;

  if (countryError) {
    return (
      <Box bg={t.bg} minH="100vh" display="flex" alignItems="center" justifyContent="center" px={4}>
        <VStack
          spacing={4}
          maxW="420px"
          textAlign="center"
          p={{ base: 6, md: 8 }}
          borderRadius="16px"
          border="1px solid"
          borderColor={t.hairline}
          bg={t.surface}
        >
          <Text fontSize="xl" fontWeight="700" color={t.text}>
            Couldn&apos;t load this country
          </Text>
          <Text fontSize="sm" color={t.textSoft}>
            The country information service didn&apos;t respond. Check your connection and try again.
          </Text>
          <HStack spacing={2}>
            <Button
              onClick={() => refetchCountry()}
              isLoading={countryFetching}
              bg={t.primary}
              color={t.bg}
              _hover={{ bg: t.primaryHover }}
              size="sm"
              borderRadius="10px"
            >
              Try again
            </Button>
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              borderColor={t.hairlineStrong}
              color={t.text}
              _hover={{ bg: t.primarySoftBg }}
              size="sm"
              borderRadius="10px"
            >
              Back to map
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box bg={t.bg} minH="100vh" className="country-details-page">
      <Box
        px={{ base: 3, sm: 4, lg: 6 }}
        pt={{ base: 3, md: 5 }}
        pb={{ base: 8, md: 10 }}
        position="relative"
        maxW={{ base: '100%', lg: '1500px', '2xl': '1680px' }}
        mx="auto"
      >
        <HeroHeader
          countryId={countryId}
          countryInfo={countryInfo}
          weatherData={weatherData}
          exchange={exchange}
          onCycleBaseCurrency={cycleBase}
          indicatorsData={indicatorsData}
          indicatorsLoading={indicatorsLoading}
          factbookData={factbookData}
          onUploadSuccess={handleUploadSuccess}
        />

        <Box mt={{ base: 3, md: 4 }}>
          <PhotoManager countryId={countryId} onUploadSuccess={handleUploadSuccess} />
        </Box>
      </Box>
    </Box>
  );
};

export default CountryDetails;
