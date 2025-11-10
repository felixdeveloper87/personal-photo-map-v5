import { Box, VStack, HStack, Icon, Text, Spinner, useColorModeValue, usePrefersReducedMotion } from '@chakra-ui/react';
import { FaGlobe, FaMapMarkedAlt, FaCamera } from 'react-icons/fa';

const LoadingState = ({ mutedTextColor }) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const textColor = useColorModeValue('gray.700', 'gray.300');

  return (
    <Box p={6} textAlign="center" minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6}>
        {/* Animated Icons */}
        <HStack spacing={4} justify="center">
          <Box
            sx={{
              '@keyframes pulseIcon': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.2)', opacity: 1 },
              },
              animation: prefersReducedMotion ? 'none' : 'pulseIcon 1.5s ease-in-out infinite',
              animationDelay: '0s',
            }}
          >
            <Icon as={FaGlobe} boxSize={8} color={accentColor} />
          </Box>
          <Box
            sx={{
              '@keyframes pulseIcon': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.2)', opacity: 1 },
              },
              animation: prefersReducedMotion ? 'none' : 'pulseIcon 1.5s ease-in-out infinite',
              animationDelay: '0.3s',
            }}
          >
            <Icon as={FaMapMarkedAlt} boxSize={8} color={accentColor} />
          </Box>
          <Box
            sx={{
              '@keyframes pulseIcon': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                '50%': { transform: 'scale(1.2)', opacity: 1 },
              },
              animation: prefersReducedMotion ? 'none' : 'pulseIcon 1.5s ease-in-out infinite',
              animationDelay: '0.6s',
            }}
          >
            <Icon as={FaCamera} boxSize={8} color={accentColor} />
          </Box>
        </HStack>

        {/* Animated Spinner */}
        <Spinner size="xl" color={accentColor} thickness="4px" speed="0.8s" />

        {/* Animated Text */}
        <VStack spacing={2}>
          <Box
            sx={{
              '@keyframes fadeInUp': {
                from: { opacity: 0, transform: 'translateY(10px)' },
                to: { opacity: 1, transform: 'translateY(0)' },
              },
              animation: prefersReducedMotion ? 'none' : 'fadeInUp 0.5s ease-out forwards',
            }}
          >
            <Text fontSize="lg" color={textColor || mutedTextColor} fontWeight="semibold">
              Gathering data from multiple sources
            </Text>
          </Box>
          <Box
            sx={{
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
              '@keyframes pulseDot': {
                '0%, 100%': { opacity: 0.3 },
                '50%': { opacity: 1 },
              },
              animation: prefersReducedMotion ? 'none' : 'fadeIn 0.5s ease-out 0.3s forwards',
              opacity: 0,
            }}
          >
            <HStack spacing={1} justify="center">
              <Text
                as="span"
                fontSize="md"
                color={accentColor}
                fontWeight="medium"
                sx={{
                  animation: prefersReducedMotion ? 'none' : 'pulseDot 1.5s ease-in-out infinite',
                  animationDelay: '0s',
                }}
              >
                •
              </Text>
              <Text
                as="span"
                fontSize="md"
                color={accentColor}
                fontWeight="medium"
                sx={{
                  animation: prefersReducedMotion ? 'none' : 'pulseDot 1.5s ease-in-out infinite',
                  animationDelay: '0.2s',
                }}
              >
                •
              </Text>
              <Text
                as="span"
                fontSize="md"
                color={accentColor}
                fontWeight="medium"
                sx={{
                  animation: prefersReducedMotion ? 'none' : 'pulseDot 1.5s ease-in-out infinite',
                  animationDelay: '0.4s',
                }}
              >
                •
              </Text>
            </HStack>
          </Box>
        </VStack>
      </VStack>
    </Box>
  );
};

export default LoadingState;
