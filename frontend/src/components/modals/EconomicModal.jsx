import {
    Text,
    useDisclosure,
    VStack,
    Box,
    Icon,
    useColorModeValue,
    HStack,
    Badge
} from '@chakra-ui/react';
import {
    FaChartLine,
    FaExchangeAlt,
    FaMoneyBillWave,
    FaUniversity,
    FaHandHoldingUsd,
    FaGlobeAmericas,
    FaBalanceScale
} from 'react-icons/fa';
import { EconomicInfoButton } from '../ui/buttons/CustomButtons';
import BaseModal from './BaseModal';

// const EconomicModal = ({ indicatorsData, exchangeRate, currency }) => {
//     const { isOpen, onOpen, onClose } = useDisclosure();

//     if (!indicatorsData) return null;

//     return (
//         <>
//             <EconomicInfoButton onClick={onOpen} />

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
//                             "linear(to-r, blue.50, indigo.50)",
//                             "linear(to-r, blue.900, indigo.900)"
//                         )}
//                         border="1px solid"
//                         borderColor={useColorModeValue("blue.200", "blue.700")}
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
//                             bg={useColorModeValue("blue.100", "blue.800")}
//                             opacity={0.2}
//                         />
//                         <HStack spacing={4} align="center">
//                             <Box
//                                 p={2}
//                                 borderRadius="lg"
//                                 bg={useColorModeValue("white", "blue.800")}
//                                 shadow="sm"
//                             >
//                                 <Icon as={FaChartLine} color="blue.500" boxSize={5} />
//                             </Box>
//                             <VStack align="start" spacing={1}>
//                                 <Text fontSize="xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
//                                     Economic Overview
//                                 </Text>
//                                 <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
//                                     Key financial indicators and economic metrics
//                                 </Text>
//                             </VStack>
//                         </HStack>
//                     </Box>

//                     {/* Exchange Rate */}
//                     {exchangeRate && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("blue.50", "blue.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("blue.200", "blue.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("blue.700", "blue.200")} mb={2}>
//                                 Exchange Rate
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("blue.800", "blue.100")}>
//                                 1 £ = {exchangeRate} {currency}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* GDP */}
//                     {indicatorsData.gdp && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("green.50", "green.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("green.200", "green.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("green.700", "green.200")} mb={2}>
//                                 Gross Domestic Product
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("green.800", "green.100")}>
//                                 {indicatorsData.gdp.value}
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("green.600", "green.300")}>
//                                 {indicatorsData.gdp.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* GDP Per Capita */}
//                     {indicatorsData.gdpPerCapitaCurrent && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("purple.50", "purple.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("purple.200", "purple.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("purple.700", "purple.200")} mb={2}>
//                                 GDP Per Capita
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("purple.800", "purple.100")}>
//                                 {indicatorsData.gdpPerCapitaCurrent.value}
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("purple.600", "purple.300")}>
//                                 {indicatorsData.gdpPerCapitaCurrent.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* GNI Per Capita */}
//                     {indicatorsData.gniPerCapita && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("orange.50", "orange.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("orange.200", "orange.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("orange.700", "orange.200")} mb={2}>
//                                 GNI Per Capita
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("orange.800", "orange.100")}>
//                                 {indicatorsData.gniPerCapita.value}
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("orange.600", "orange.300")}>
//                                 {indicatorsData.gniPerCapita.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* GNI PPP */}
//                     {indicatorsData.hdiProxy && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue("teal.50", "teal.900")}
//                             border="1px solid"
//                             borderColor={useColorModeValue("teal.200", "teal.700")}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("teal.700", "teal.200")} mb={2}>
//                                 GNI Per Capita (PPP)
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("teal.800", "teal.100")}>
//                                 {indicatorsData.hdiProxy.value}
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("teal.600", "teal.300")}>
//                                 {indicatorsData.hdiProxy.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* GDP Growth */}
//                     {indicatorsData.gdpGrowth && (
//                         <Box
//                             p={4}
//                             borderRadius="lg"
//                             bg={useColorModeValue(
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.50" : "red.50",
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.900" : "red.900"
//                             )}
//                             border="1px solid"
//                             borderColor={useColorModeValue(
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.200" : "red.200",
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.700" : "red.700"
//                             )}
//                         >
//                             <Text fontWeight="semibold" fontSize="md" color={useColorModeValue(
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.700" : "red.700",
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.200" : "red.200"
//                             )} mb={2}>
//                                 GDP Growth Rate
//                             </Text>
//                             <Text fontSize="lg" fontWeight="bold" color={useColorModeValue(
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.800" : "red.800",
//                                 parseFloat(indicatorsData.gdpGrowth.value) >= 0 ? "green.100" : "red.100"
//                             )}>
//                                 {indicatorsData.gdpGrowth.value}%
//                             </Text>
//                             <Text fontSize="sm" color={useColorModeValue("gray.600", "gray.300")}>
//                                 {indicatorsData.gdpGrowth.year}
//                             </Text>
//                         </Box>
//                     )}

//                     {/* Public Debt */}
//                     <Box
//                         p={4}
//                         borderRadius="lg"
//                         bg={useColorModeValue("red.50", "red.900")}
//                         border="1px solid"
//                         borderColor={useColorModeValue("red.200", "red.700")}
//                     >
//                         <Text fontWeight="semibold" fontSize="md" color={useColorModeValue("red.700", "red.200")} mb={2}>
//                             Public Debt (% of GDP)
//                         </Text>
//                         {indicatorsData.debtToGDP ? (
//                             <>
//                                 <Text fontSize="lg" fontWeight="bold" color={useColorModeValue("red.800", "red.100")}>
//                                     {indicatorsData.debtToGDP.value}%
//                                 </Text>
//                                 <Text fontSize="sm" color={useColorModeValue("red.600", "red.300")}>
//                                     {indicatorsData.debtToGDP.year}
//                                 </Text>
//                             </>
//                         ) : (
//                             <Text fontSize="sm" color={useColorModeValue("red.600", "red.300")} fontStyle="italic">
//                                 No data available for this indicator
//                             </Text>
//                         )}
//                     </Box>
//                 </VStack>
//             </BaseModal>
//         </>
//     );
// };

// export default EconomicModal;
