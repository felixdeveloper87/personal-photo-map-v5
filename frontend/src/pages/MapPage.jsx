import React from 'react';
import { Box } from '@chakra-ui/react';
import Map from '../components/features/map/Map';
import { useLandingTokens } from '../components/features/landing/landingUI';

function MapPage() {
  const t = useLandingTokens();
  return (
    <Box bg={t.bg} minH="100vh">
      <Box
        px={{ base: 3, md: 6, lg: 8 }}
        py={{ base: 3, md: 6, lg: 8 }}
        maxW={{ base: '100%', '2xl': '1800px' }}
        mx="auto"
      >
        <Map />
      </Box>
    </Box>
  );
}

export default MapPage;
