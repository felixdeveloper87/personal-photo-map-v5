import { useState, useCallback } from 'react';
import { Box, Icon, Text, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';
import Flag from 'react-world-flags';
import { FaGlobe } from 'react-icons/fa';
import { getCachedFlag, normalizeCountryCode } from '../../../utils/flagNormalizer';

const EnhancedFlag = ({ countryCode }) => {
  const [flagError, setFlagError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackBg = useColorModeValue('gray.100', 'gray.700');
  const fallbackBorder = useColorModeValue('gray.300', 'gray.600');
  const fallbackText = useColorModeValue('gray.600', 'gray.300');
  const hoverBg = useColorModeValue('gray.200', 'gray.600');
  const hoverBorder = useColorModeValue('gray.400', 'gray.500');

  const correctedCode = normalizeCountryCode(countryCode);
  
  // Define objectFit responsivamente: cover para mobile/medium, contain para desktop
  const objectFit = useBreakpointValue({ base: 'cover', sm: 'cover', md: 'contain', lg: 'contain' });

  const handleFlagError = useCallback(async () => {
    if (flagError) return;
    
    setFlagError(true);
    setIsLoading(true);
    
    try {
      const altFlag = await getCachedFlag(countryCode, {
        preferFormat: 'png',
        maxRetries: 2,
        timeout: 3000
      });
      
      if (altFlag) {
        setFallbackImage(altFlag);
        setFlagError(false);
      }
    } catch (error) {
      console.debug('Flag fallback failed:', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [countryCode, flagError]);

  const handleImageLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Responsive styles
  const commonStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: { base: '12px', sm: '16px', md: '20px' },
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease'
  };

  const getResponsiveImageStyles = () => ({
    width: '100%',
    height: '100%',
    objectFit: objectFit,
    objectPosition: 'center center',
    transition: 'all 0.3s ease',
    maxWidth: '100%',
    maxHeight: '100%'
  });

  if (fallbackImage) {
    return (
      <Box {...commonStyles} opacity={{ base: 0.75, md: 0.85 }}>
        <Box
          as="img"
          src={fallbackImage}
          alt={`Flag of ${countryCode}`}
          onError={() => setFallbackImage(null)}
          onLoad={handleImageLoad}
          sx={getResponsiveImageStyles()}
        />
        {isLoading && (
          <Box
            position="absolute"
            inset="0"
            bg="rgba(0, 0, 0, 0.6)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={10}
            borderRadius={{ base: '12px', sm: '16px', md: '20px' }}
            animation="pulse 1.5s ease-in-out infinite"
          >
            <Icon 
              as={FaGlobe} 
              boxSize={{ base: 6, sm: 7, md: 8 }} 
              color="white" 
            />
          </Box>
        )}
      </Box>
    );
  }

  if (flagError) {
    return (
      <Box
        bg={fallbackBg}
        border={{ base: '1px dashed', md: '2px dashed' }}
        borderColor={fallbackBorder}
        borderRadius={{ base: '12px', sm: '16px', md: '20px' }}
        transition="all 0.3s ease"
        opacity={{ base: 0.65, md: 0.75 }}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width="100%"
        height="100%"
        p={{ base: 3, sm: 4, md: 5 }}
        _hover={{
          bg: hoverBg,
          borderColor: hoverBorder,
          opacity: 0.9,
          transform: 'scale(1.02)'
        }}
      >
        <Icon 
          as={FaGlobe} 
          boxSize={{ base: 10, sm: 12, md: 16 }} 
          color={fallbackText} 
          mb={{ base: 2, md: 3 }} 
        />
        <Text 
          fontSize={{ base: 'md', sm: 'lg', md: 'xl' }} 
          color={fallbackText} 
          textAlign="center" 
          fontWeight="semibold"
        >
          {countryCode}
        </Text>
        <Text 
          fontSize={{ base: 'xs', sm: 'sm', md: 'md' }} 
          color={fallbackText} 
          textAlign="center"
        >
          Flag not available
        </Text>
      </Box>
    );
  }

  return (
    <Box {...commonStyles} opacity={{ base: 0.85, md: 0.95 }}>
      <Box
        as={Flag}
        code={correctedCode}
        onError={handleFlagError}
        onLoad={handleImageLoad}
        sx={getResponsiveImageStyles()}
      />
      {isLoading && (
        <Box
          position="absolute"
          inset="0"
          bg="rgba(0, 0, 0, 0.6)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={10}
          borderRadius={{ base: '12px', sm: '16px', md: '20px' }}
        >
          <Icon 
            as={FaGlobe} 
            boxSize={{ base: 6, sm: 7, md: 8 }} 
            color="white" 
          />
        </Box>
      )}
    </Box>
  );
};

export default EnhancedFlag;
