// import {
//     Text,
//     useDisclosure,
//     VStack,
//     Box,
//     Icon,
//     useColorModeValue,
//     HStack,
//     Badge
// } from '@chakra-ui/react';
// import {
//     FaUsers,
//     FaChartPie,
//     FaWifi,
//     FaCity,
//     FaUserTimes,
//     FaPrayingHands,
//     FaBaby,
//     FaBolt,
//     FaHeartbeat,
//     FaBook,
//     FaPlaneDeparture,
//     FaPercent
// } from 'react-icons/fa';
// import factbookRegionMap from '../../data/factbookRegionMap.json';
// import { isoToGec } from '../../data/isoToGecMap';
// import { SocialInfoButton } from '../ui/buttons/CustomButtons';
// import BaseModal from './BaseModal';

// const getFactbookRegion = (code) => factbookRegionMap[code.toLowerCase()] ?? null;
// const getFactbookCode = (isoCode) => {
//     return isoToGec[isoCode.toLowerCase()] || isoCode.toLowerCase();
// };

// export const fetchFactbookData = async (countryId) => {
//     const region = getFactbookRegion(countryId);
//     if (!region) throw new Error('Region not mapped for this country.');

//     const gecCode = getFactbookCode(countryId);
//     const url = `https://raw.githubusercontent.com/factbook/factbook.json/master/${region}/${gecCode}.json`;

//     const response = await fetch(url);

//     if (response.status === 404) {
//         throw new Error(`Factbook data not found for country code "${countryId}"`);
//     }

//     if (!response.ok) {
//         throw new Error('Failed to fetch factbook data.');
//     }

//     const data = await response.json();

//     return {
//         religion:
//             typeof data?.["People and Society"]?.["Religions"] === 'object'
//                 ? data["People and Society"]["Religions"].text ?? null
//                 : data?.["People and Society"]?.["Religions"] ?? null,
//     };
// };

// const SocialModal = ({ indicatorsData, factbookData, factbookError }) => {
//     const { isOpen, onOpen, onClose } = useDisclosure();

//     if (!indicatorsData) return null;

//     return (
//         <>
//             <SocialInfoButton onClick={onOpen} />

//             <BaseModal
//                 isOpen={isOpen}
//                 onClose={onClose}
//                 size="md"
//                 maxHeight="80vh"
//             >
//                 <VStack spacing={6} align="stretch">
//                     {/* Header Section */}
//                     <Box
//                         p={5}
//                         borderRadius="xl"
//                         bgGradient={useColorModeValue(
//                             "linear(to-r, purple.50, pink.50)",
//                             "linear(to-r, purple.900, pink.900)"
//                         )}
//                         border="1px solid"
//                         borderColor={useColorModeValue("purple.200", "purple.700")}
//                         position="relative"
//                         overflow="hidden"
//                     >
//                         <Box
//                             position="absolute"
//                             top={-1}
//                             right={-1}
//                             w="80px"
//                             h="80px"
//                             borderRadius="full"
//                             bg={useColorModeValue("purple.100", "purple.800")}
//                             opacity={0.2}
//                         />
//                         <HStack spacing={4} align="center">
//                             <Box
//                                 p={2}
//                                 borderRadius="lg"
//                                 bg={useColorModeValue("white", "purple.800")}
//                                 shadow="sm"
//                             >
//                                 <Icon as={FaUsers} color="purple.500" boxSize={5} />
//                             </Box>
//                             <VStack align="start" spacing={1}>
//                                 <Text fontSize="xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
//                                     Social Overview
//                                 </Text>
//                                 <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
//                                     Population, health, and social development metrics
//                                 </Text>
//                             </VStack>
//                         </HStack>
//                     </Box>

//                     {/* Life Expectancy */}
//                     <Box
//                         p={4}
//                         borderRadius="lg"
//                         bg={useColorModeValue("pink.50", "pink.900")}
//                         border="1px solid"
//                         borderColor={useColorModeValue("pink.200", "pink.700")}
//                     >
//                         <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("pink.700", "pink.200")} mb={2}>
//                             Life Expectancy
//                         </Text>
//                         <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("pink.800", "pink.100")}>
//                             {indicatorsData.lifeExpectancy.value} years
//                         </Text>
//                         <Text fontSize="sm" color={useColorModeValue("pink.600", "pink.300")}>
//                             {indicatorsData.lifeExpectancy.year}
//                         </Text>
//                     </Box>

//                     {/* Internet Usage */}
//                     {indicatorsData.internetUsers && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("blue.50", "blue.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("blue.200", "blue.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("blue.700", "blue.200")} mb={2}>
//                                 Internet Usage
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("blue.800", "blue.100")}>
//                                 {indicatorsData.internetUsers.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("blue.600", "blue.300")}>
//                                 {indicatorsData.internetUsers.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Urban Population */}
//                     {indicatorsData.urbanPopulation && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("green.50", "green.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("green.200", "green.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("green.700", "green.200")} mb={2}>
//                                 Urban Population
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("green.800", "green.100")}>
//                                 {indicatorsData.urbanPopulation.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("green.600", "green.300")}>
//                                 {indicatorsData.urbanPopulation.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Unemployment */}
//                     {indicatorsData.unemployment && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("red.50", "red.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("red.200", "red.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("red.700", "red.200")} mb={2}>
//                                 Unemployment Rate
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("red.800", "red.100")}>
//                                 {indicatorsData.unemployment.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("red.600", "red.300")}>
//                                 {indicatorsData.unemployment.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Religion */}
//                     {factbookData?.religion ? (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("purple.50", "purple.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("purple.200", "purple.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("purple.700", "purple.200")} mb={2}>
//                                 Major Religions
//                             </Text>
//                             <Text fontSize="md" color={useColorModeValue("purple.700", "purple.200")}>
//                                 {String(factbookData.religion)}
//                             </Text>
//                         </Box>
//                     ) : factbookError && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("red.50", "red.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("red.200", "red.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("red.700", "red.200")} mb={2}>
//                                 Major Religions
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("red.700", "red.200")}>
//                                 Error loading religious data
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Fertility Rate */}
//                     {indicatorsData.fertilityRate && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("teal.50", "teal.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("teal.200", "teal.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("teal.700", "teal.200")} mb={2}>
//                                 Fertility Rate
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("teal.800", "teal.100")}>
//                                 {indicatorsData.fertilityRate.value}
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("teal.600", "teal.300")}>
//                                 {indicatorsData.fertilityRate.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Electricity Access */}
//                     {indicatorsData.accessToEletricity && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("yellow.50", "yellow.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("yellow.200", "yellow.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("yellow.700", "yellow.200")} mb={2}>
//                                 Access to Electricity
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("yellow.800", "yellow.100")}>
//                                 {indicatorsData.accessToEletricity.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("yellow.600", "yellow.300")}>
//                                 {indicatorsData.accessToEletricity.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Health Expenditure */}
//                     {indicatorsData.healthExpenses && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("red.50", "red.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("red.200", "red.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("red.700", "red.200")} mb={2}>
//                                 Health Expenditure
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("red.800", "red.100")}>
//                                 {indicatorsData.healthExpenses.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("red.600", "red.300")}>
//                                 {indicatorsData.healthExpenses.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Literacy Rate */}
//                     <Box
//                         p={4}
//                         borderRadius="lg"
//                         bg={useColorModeValue("indigo.50", "indigo.900")}
//                         border="1px solid"
//                         borderColor={useColorModeValue("indigo.200", "indigo.700")}
//                     >
//                         <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("indigo.700", "indigo.200")} mb={2}>
//                             Literacy Rate
//                         </Text>
//                         {indicatorsData.education ? (
//                             <>
//                                 <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("indigo.800", "indigo.100")}>
//                                     {indicatorsData.education.value}%
//                                 </Text>
//                                 <Text fontSize="sm" color={useColorModeValue("indigo.600", "indigo.300")}>
//                                     {indicatorsData.education.year}
//                                 </Text>
//                             </>
//                         ) : (
//                             <Text fontSize="sm" color={useColorModeValue("indigo.600", "indigo.300")} fontStyle="italic">
//                                 No data available for this indicator
//                             </Text>
//                         )}
//                     </Box>

//                     {/* Net Migration */}
//                     {indicatorsData.netMigration ? (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("sky.50", "sky.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("sky.200", "sky.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("sky.700", "sky.200")} mb={2}>
//                                 Net Migration
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("sky.800", "sky.100")}>
//                                 {indicatorsData.netMigration.value}
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("sky.600", "sky.300")}>
//                                 {indicatorsData.netMigration.year}
//                             </Text>
//                         </Box>
//                     ) : (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("gray.50", "gray.700")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("gray.200", "gray.600")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("gray.700", "gray.300")} mb={2}>
//                                 Net Migration
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.400")} fontStyle="italic">
//                                 No data available for this indicator
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Inflation Rate */}
//                     {indicatorsData.inflationCPI && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("orange.50", "orange.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("orange.200", "orange.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("orange.700", "orange.200")} mb={2}>
//                                 Inflation Rate (CPI)
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("orange.800", "orange.100")}>
//                                 {indicatorsData.inflationCPI.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("orange.600", "orange.300")}>
//                                 {indicatorsData.inflationCPI.year}
//                             </Text>
//                         </Box>
//                     )}
//                 </VStack>
//             </BaseModal>
//         </>
//     );
// };

// export default SocialModal;
