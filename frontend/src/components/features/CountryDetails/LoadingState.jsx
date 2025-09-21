import { Box, VStack, Icon, Text } from '@chakra-ui/react';
import { FaGlobe } from 'react-icons/fa';

const LoadingState = ({ mutedTextColor }) => (
  <Box p={6} textAlign="center" minH="100vh" display="flex" alignItems="center" justifyContent="center">
    <VStack spacing={6}>
      <Box className="loading-pulse">
        <Icon as={FaGlobe} boxSize={16} color="blue.500" />
      </Box>
      <Text fontSize="xl" color={mutedTextColor} fontWeight="medium">
        Loading country information...
      </Text>
      <Text fontSize="md" color={mutedTextColor}>
        Gathering data from multiple sources
      </Text>
    </VStack>
  </Box>
);

export default LoadingState;
