import { useState, useCallback } from 'react';
import { Box, Icon, Text, useColorModeValue } from '@chakra-ui/react';
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

  const commonStyles = {
    position: 'relative',
    width: '100%',
    height: '100%',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'opacity 0.2s ease'
  };

  const imageStyles = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center center',
    borderRadius: '20px',
    transition: 'opacity 0.2s ease'
  };

  if (fallbackImage) {
    return (
      <Box {...commonStyles} opacity={0.8}>
        <img
          src={fallbackImage}
          alt={`Flag of ${countryCode}`}
          onError={() => setFallbackImage(null)}
          onLoad={handleImageLoad}
          style={imageStyles}
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
            borderRadius="20px"
            animation="pulse 1s ease-in-out infinite"
          >
            <Icon as={FaGlobe} boxSize={8} color="white" />
          </Box>
        )}
      </Box>
    );
  }

  if (flagError) {
    return (
      <Box
        bg={fallbackBg}
        border="2px dashed"
        borderColor={fallbackBorder}
        borderRadius="20px"
        transition="all 0.2s ease"
        opacity={0.7}
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
        width="100%"
        height="100%"
        _hover={{
          bg: hoverBg,
          borderColor: hoverBorder,
          opacity: 0.9
        }}
      >
        <Icon as={FaGlobe} boxSize={16} color={fallbackText} mb={3} />
        <Text fontSize="lg" color={fallbackText} textAlign="center" fontWeight="semibold">
          {countryCode}
        </Text>
        <Text fontSize="sm" color={fallbackText} textAlign="center">
          Flag not available
        </Text>
      </Box>
    );
  }

  return (
    <Box {...commonStyles} opacity={0.9}>
      <Flag
        code={correctedCode}
        onError={handleFlagError}
        onLoad={handleImageLoad}
        style={imageStyles}
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
          borderRadius="20px"
        >
          <Icon as={FaGlobe} boxSize={8} color="white" />
        </Box>
      )}
    </Box>
  );
};

export default EnhancedFlag;
