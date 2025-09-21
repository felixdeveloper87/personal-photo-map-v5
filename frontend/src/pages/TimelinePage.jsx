import React from 'react';
import { Box } from '@chakra-ui/react'; // Importing Chakra UI for layout styling
import { useSearchParams, useParams } from 'react-router-dom'; // Hook to retrieve URL query parameters and route parameters
import Timeline from '../components/features/Timeline'; // Importing the Timeline component

/**
 * TimelinePage Component
 * 
 * This component serves as a wrapper for the `Timeline` component.
 * It extracts the `year` parameter from either the URL query string or route parameters
 * and passes it as a prop to `Timeline`, allowing dynamic rendering based on the selected year.
 * 
 * @returns {JSX.Element} A responsive container that renders the Timeline component.
 */
function TimelinePage() {
  // Extract the `year` parameter from both URL query string and route parameters
  const [searchParams] = useSearchParams();
  const { year: routeYear } = useParams();
  const queryYear = searchParams.get('year');
  
  // Priority: route parameter first, then query parameter
  const year = routeYear || queryYear;

  return (
    <Box px={4} maxW="1600px" mx="auto"> {/* Responsive centered container */}
      <Timeline selectedYear={year} /> {/* Passes the selected year to Timeline */}
    </Box>
  );
}

export default TimelinePage;
