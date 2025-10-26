// import React from 'react';
// import {
//   Box,
//   SimpleGrid,
//   Text,
//   Flex,
//   VStack,
//   useColorModeValue,
//   Icon,
// } from '@chakra-ui/react';
// import {
//   FaDollarSign,
//   FaChartLine,
//   FaBalanceScale,
//   FaHandHoldingUsd,
//   FaPercent,
// } from 'react-icons/fa';
// import InfoBox from '../features/CountryDetails/InfoBox';

// export default function EconomicModal({ indicatorsData, exchangeRate, countryInfo }) {
//   const textColor = useColorModeValue('gray.700', 'gray.200');
//   const sectionTitle = useColorModeValue('gray.800', 'white');
//   const dividerColor = useColorModeValue('gray.200', 'gray.600');

//   const compactBoxProps = {
//     size: 'compact',
//     sx: {
//       p: { base: 2.5, sm: 3 },
//       minH: { base: '70px', sm: '80px', md: '100px' },
//       fontSize: { base: 'xs', sm: 'sm' },
//       '.chakra-icon': { fontSize: { base: '14px', sm: '16px', md: '18px' } },
//       '.chakra-text': {
//         fontSize: { base: '10px', sm: '11px', md: 'xs' },
//       },
//     },
//   };

//   return (
//     <VStack spacing={6} w="100%">
//       {/* Economic Indicators */}
//       <Box w="100%">
//         <Flex align="center" mb={4} gap={2}>
//           <Icon as={FaDollarSign} color="green.500" fontSize="xl" />
//           <Text
//             fontSize={{ base: 'lg', sm: 'xl' }}
//             fontWeight="bold"
//             color={sectionTitle}
//           >
//             Economic Indicators
//           </Text>
//         </Flex>

//         <SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} gap={3}>
//           <InfoBox
//             icon={FaChartLine}
//             label="GDP Growth"
//             value={indicatorsData?.gdpGrowth?.value ? `${indicatorsData.gdpGrowth.value}%` : 'N/A'}
//             colorScheme="green"
//             {...compactBoxProps}
//           />
          
//           <InfoBox
//             icon={FaHandHoldingUsd}
//             label="GDP per Capita"
//             value={indicatorsData?.gdpPerCapitaCurrent?.value 
//               ? `$${indicatorsData.gdpPerCapitaCurrent.value.toLocaleString()}` 
//               : 'N/A'}
//             colorScheme="green"
//             {...compactBoxProps}
//           />
          
//           <InfoBox
//             icon={FaDollarSign}
//             label="Exchange Rate"
//             value={exchangeRate ? `£1 = ${exchangeRate} ${countryInfo?.currency || 'USD'}` : 'N/A'}
//             colorScheme="teal"
//             {...compactBoxProps}
//           />
          
//           <InfoBox
//             icon={FaBalanceScale}
//             label="Public Debt"
//             value={indicatorsData?.debtToGDP?.value ? `${indicatorsData.debtToGDP.value}%` : 'N/A'}
//             colorScheme="orange"
//             {...compactBoxProps}
//           />
          
//           <InfoBox
//             icon={FaPercent}
//             label="Inflation"
//             value={indicatorsData?.inflationCPI?.value ? `${indicatorsData.inflationCPI.value}%` : 'N/A'}
//             colorScheme="red"
//             {...compactBoxProps}
//           />
//         </SimpleGrid>
//       </Box>
//     </VStack>
//   );
// }

