import React from 'react';
import { useParams } from 'react-router-dom';
import { CountryDetails } from '../components/features';

/**
 * Countries Component
 * 
 * This component serves as a container for displaying details of a selected country.
 * It extracts the `countryId` parameter from the URL and passes it to the `CountryDetails` component.
 * 
 * Note: CountryDetails already has its own responsive padding and maxWidth,
 * so no wrapper styling is needed here.
 * 
 * @returns {JSX.Element} A wrapper that dynamically loads the country details.
 */
function Countries() {
  // Extract the country ID from the URL parameters
  const { countryId } = useParams();

  return <CountryDetails countryId={countryId} />;
}

export default Countries;
