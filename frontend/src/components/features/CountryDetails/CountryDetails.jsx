import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, IconButton, useColorModeValue, Flex, Divider, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useState, useEffect, useContext } from 'react';
import moment from 'moment-timezone';
import { CountriesContext } from '../../../context/CountriesContext';

// Styles - Removed CSS dependency, using only Chakra UI

// Services
import { fetchWorldBankIndicators } from "../../../data/worldBankService";


// Components - Importing directly to avoid cache issues
import HeroHeader from './HeroHeader';
import CountryInsightsSection from './CountryInsightsSection';
import PhotoManager from '../photos/PhotoManager';
import LoadingState from './LoadingState';
import { fetchCountryData, fetchWeatherData, fetchExchangeRate, fetchFactbookData } from './services';

// =================== MAIN COMPONENT ===================
const CountryDetails = () => {
  const { countryId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshCountriesWithPhotos } = useContext(CountriesContext);
  const toast = useToast();


  // Early return if countryId is invalid
  if (!countryId || countryId === 'undefined') {
    console.error('CountryDetails: Invalid countryId, redirecting to not-found');
    toast({
      title: "Invalid Country",
      description: "The country you're trying to access is not valid.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    navigate('/not-found');
    return null;
  }

  // Color mode values
  const bgColor = useColorModeValue('white', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const mutedTextColor = useColorModeValue('gray.600', 'gray.300');

  // State for live clock
  const [currentTime, setCurrentTime] = useState(null);

  // Country base info
  const {
    data: countryInfo,
    isLoading: countryLoading,
    error: countryError,
  } = useQuery({
    queryKey: ['country', countryId],
    queryFn: () => {
      if (!countryId || countryId === 'undefined') {
        throw new Error('Invalid country ID');
      }
      return fetchCountryData(countryId);
    },
    enabled: !!countryId && countryId !== 'undefined' && countryId.length === 2, // Only run if countryId is valid and 2 characters
    staleTime: 10 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: false, // Don't retry on error
    onError: (error) => {
      console.error('Country query error:', error);
      toast({
        title: "Error Loading Country",
        description: "Failed to load country information. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      navigate('/not-found');
    },
  });

  // Weather (depende de capital)
  const { data: weatherData } = useQuery({
    queryKey: ['weather', countryId, countryInfo?.capital],
    queryFn: () => fetchWeatherData(countryInfo.capital, countryId),
    enabled: !!countryInfo?.capital && countryInfo.capital !== 'N/A',
    staleTime: 5 * 60 * 1000,
  });

  // Exchange rate data
  const { data: exchangeRate } = useQuery({
    queryKey: ['exchangeRate', countryInfo?.currency],
    queryFn: () => fetchExchangeRate(countryInfo.currency),
    enabled: !!countryInfo?.currency && countryInfo.currency !== 'N/A',
    staleTime: 60 * 60 * 1000,
  });


  // CIA Factbook data
  const { data: factbookData, isError: factbookError } = useQuery({
    queryKey: ['factbook', countryId],
    queryFn: () => fetchFactbookData(countryId),
    enabled: !!countryId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });

  // World Bank indicators - Economic and Social data
  const { data: indicatorsData, isLoading: indicatorsLoading } = useQuery({
    queryKey: ['worldBank', countryId],
    queryFn: () => {
      if (!countryId || countryId === 'undefined') {
        throw new Error('Invalid country ID');
      }
      return fetchWorldBankIndicators(countryId);
    },
    enabled: !!countryId && countryId !== 'undefined' && countryId.length === 2, // Only run if countryId is valid and 2 characters
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
  });

  // Live clock effect
  useEffect(() => {
    const updateTime = () => {
      if (weatherData?.timezone) {
        setCurrentTime(moment().utcOffset(weatherData.timezone / 60).format('HH:mm:ss'));
      } else {
        setCurrentTime(moment().format('HH:mm:ss'));
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [weatherData?.timezone]);

  // Debug indicators data
  useEffect(() => {
    if (indicatorsData) {
      console.log('Economic/Social indicators loaded for', countryId, indicatorsData);
    }
  }, [indicatorsData, countryId]);

  // Show success toast when country data is loaded
  useEffect(() => {
    if (countryInfo && !countryLoading) {
      const countryName = countryInfo.nativeName || countryId?.toUpperCase();
      toast({
        title: `Welcome to ${countryName}!`,
        description: "Country information loaded successfully.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    }
  }, [countryInfo, countryLoading, countryId, toast]);

  if (countryLoading) return <LoadingState mutedTextColor={mutedTextColor} />;
  if (countryError) return null;

  return (
    <Box bg={bgColor} minH="100vh" className="country-details-page">
      <Box px={6} pb={6} position="relative" maxW="1500px" mx="auto">
        {/* Hero Header */}
        <HeroHeader 
          countryId={countryId} 
          countryInfo={countryInfo} 
          weatherData={weatherData}
          currentTime={currentTime}
          exchangeRate={exchangeRate}
          indicatorsData={indicatorsData}
          indicatorsLoading={indicatorsLoading}
          factbookData={factbookData}
          navigate={navigate}
        />

        {/* Divider */}
        <Divider my={3} />

        {/* Country Insights Section */}
        <Flex gap="6">
          <Box flex="1">
            <CountryInsightsSection
              countryInfo={countryInfo}
              cardBg={cardBg}
              borderColor={borderColor}
              countryId={countryId}
              onUploadSuccess={() => {
                // Refresh data after upload
                queryClient.invalidateQueries(['allImages', countryId]);
                queryClient.invalidateQueries(['years', countryId]);
                queryClient.invalidateQueries(['albums', countryId]);
                // Force immediate refresh of countries data to update map
                refreshCountriesWithPhotos(true);
              }}
            />
          </Box>
        </Flex>

        {/* Photo Gallery */}
        <Box mt={1}>
          <PhotoManager 
            countryId={countryId} 
            onUploadSuccess={async () => {
              // Refresh all photo-related queries
              await queryClient.invalidateQueries(['allImages', countryId]);
              await queryClient.invalidateQueries(['years', countryId]);
              await queryClient.invalidateQueries(['albums', countryId]);
              await queryClient.invalidateQueries(['userPhotos', countryId]);
              // Force immediate refresh of countries data to update map
              await refreshCountriesWithPhotos(true);
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CountryDetails;
