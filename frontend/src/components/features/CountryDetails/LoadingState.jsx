import { Box, HStack, Text, VStack, usePrefersReducedMotion } from '@chakra-ui/react';
import { color, type } from '../../../design/tokens';

// `mutedTextColor` is accepted for backwards compatibility.
// eslint-disable-next-line no-unused-vars
const LoadingState = ({ mutedTextColor }) => {
  const reduced = usePrefersReducedMotion();

  return (
    <Box minH="100vh" bg={color.bg} display="flex" alignItems="center" justifyContent="center" p={6} role="status" aria-live="polite">
      <VStack spacing={6}>
        {/* Map pin with a sonar ring */}
        <Box position="relative" w="64px" h="64px" display="flex" alignItems="center" justifyContent="center">
          {[0, 0.8].map((delay) => (
            <Box
              key={delay}
              position="absolute"
              inset={0}
              borderRadius="full"
              border="1px solid"
              borderColor={color.primary}
              sx={{
                '@keyframes atlasSonar': {
                  '0%': { transform: 'scale(0.4)', opacity: 0.8 },
                  '100%': { transform: 'scale(1.4)', opacity: 0 },
                },
                animation: reduced ? 'none' : `atlasSonar 1.6s ease-out ${delay}s infinite`,
                opacity: reduced ? 0.4 : undefined,
              }}
            />
          ))}
          <Box
            w="16px"
            h="16px"
            borderRadius="50% 50% 50% 0"
            bg={color.primary}
            transform="rotate(-45deg)"
            boxShadow="0 0 24px rgba(235,181,114,0.6)"
          />
        </Box>

        <VStack spacing={2}>
          <Text {...type.display} color={color.text}>
            Charting this country
          </Text>
          <HStack spacing={2}>
            <Text {...type.eyebrow} color={color.textMuted}>
              Gathering data from multiple sources
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default LoadingState;
