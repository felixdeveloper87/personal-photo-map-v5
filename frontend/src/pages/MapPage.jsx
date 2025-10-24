import React from 'react';
import { Box } from '@chakra-ui/react';
import Map from '../components/features/map/Map';

function MapPage() {
  return (
    <Box px={4} pt={{ base: 4, md: 6, lg: 8 }}>
      <Map />
    </Box>
  );
}

export default MapPage;
