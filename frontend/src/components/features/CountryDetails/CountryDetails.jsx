import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Box, useToast } from '@chakra-ui/react';
import { useState, useEffect, useContext } from 'react';
import moment from 'moment-timezone';
import { CountriesContext } from '../../../context/CountriesContext';
import { useLandingTokens } from '../landing/landingUI';

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
  const t = useLandingTokens();


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

  if (countryLoading) return <LoadingState mutedTextColor={t.textSoft} />;
  if (countryError) return null;

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

        <CountryInsightsSection
          countryInfo={countryInfo}
          countryId={countryId}
          onUploadSuccess={() => {
            queryClient.invalidateQueries(['allImages', countryId]);
            queryClient.invalidateQueries(['years', countryId]);
            queryClient.invalidateQueries(['albums', countryId]);
            refreshCountriesWithPhotos(true);
          }}
        />

        {/* Photo Gallery */}
        <Box mt={{ base: 3, md: 4 }}>
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
