import { useCallback, useState } from 'react';
import { Box, Icon, Text } from '@chakra-ui/react';
import Flag from 'react-world-flags';
import { FaGlobe } from 'react-icons/fa';
import countries from 'i18n-iso-countries';
import { getCachedFlag, normalizeCountryCode } from '../../../utils/flagNormalizer';
import { useLandingTokens } from '../landing/landingUI';

/**
 * Country flag that is never cropped, at any size.
 *
 * Flags have very different aspect ratios (Switzerland 1:1, Qatar 11:28, Nepal isn't even
 * rectangular), so the flag is always rendered with `object-fit: contain` and fills whatever
 * box the parent gives it. With `backdrop`, the leftover space is filled by a blurred copy of
 * the same flag, so letterboxing reads as intentional instead of empty bars.
 */
const EnhancedFlag = ({ countryCode, backdrop = false }) => {
  const t = useLandingTokens();
  const [flagError, setFlagError] = useState(false);
  const [fallbackImage, setFallbackImage] = useState(null);

  const correctedCode = normalizeCountryCode(countryCode);
  const countryName = countries.getName(countryCode || '', 'en') || countryCode;
  const alt = `Flag of ${countryName}`;

  const handleFlagError = useCallback(async () => {
    if (flagError) return;
    setFlagError(true);
    try {
      const altFlag = await getCachedFlag(countryCode, { preferFormat: 'png', maxRetries: 2, timeout: 3000 });
      if (altFlag) {
        setFallbackImage(altFlag);
        setFlagError(false);
      }
    } catch (error) {
      console.debug('Flag fallback failed:', error.message);
    }
  }, [countryCode, flagError]);

  if (flagError && !fallbackImage) {
    return (
      <Box
        w="100%"
        h="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={1}
        color={t.textMuted}
        role="img"
        aria-label={`${alt} (not available)`}
      >
        <Icon as={FaGlobe} boxSize={{ base: 6, md: 10 }} opacity={0.7} />
        {backdrop && (
          <Text fontSize={{ base: 'xs', md: 'sm' }} fontWeight="600" letterSpacing="0.06em">
            {countryCode}
          </Text>
        )}
      </Box>
    );
  }

  // Same element for the sharp flag and its blurred backdrop.
  const renderFlag = (sx, extraProps = {}) =>
    fallbackImage ? (
      <Box as="img" src={fallbackImage} alt={alt} onError={() => setFallbackImage(null)} sx={sx} {...extraProps} />
    ) : (
      <Box as={Flag} code={correctedCode} alt={alt} onError={handleFlagError} sx={sx} {...extraProps} />
    );

  return (
    <Box position="relative" w="100%" h="100%" overflow="hidden">
      {backdrop &&
        renderFlag(
          {
            position: 'absolute',
            inset: '-15%',
            width: '130%',
            height: '130%',
            objectFit: 'cover',
            filter: 'blur(32px) saturate(1.3)',
            opacity: 0.35,
            pointerEvents: 'none',
          },
          { 'aria-hidden': true, alt: '', onError: undefined }
        )}

      <Box
        position="relative"
        w="100%"
        h="100%"
        p={backdrop ? { base: 4, sm: 5, md: 6, lg: 7 } : 0}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {renderFlag({
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center',
          // drop-shadow follows the visible flag pixels, so it hugs the real shape
          // even with letterboxing (a box-shadow would outline the whole box).
          filter: backdrop ? 'drop-shadow(0 10px 24px rgba(0,0,0,0.45))' : 'none',
        })}
      </Box>
    </Box>
  );
};

export default EnhancedFlag;
