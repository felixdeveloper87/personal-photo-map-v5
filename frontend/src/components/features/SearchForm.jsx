import React, { useState, useContext } from 'react';
import {
  Select,
  useDisclosure,
  useColorModeValue,
  VStack,
  HStack,
  Text,
  Box,
  Divider,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Badge,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CountriesContext } from '../../context/CountriesContext';
import { motion, AnimatePresence } from 'framer-motion';
import BaseModal from '../modals/BaseModal';
import ModalButton from '../modals/ModalButton';
import { FaSearch, FaGlobe, FaCalendar, FaInfoCircle } from 'react-icons/fa';

const MotionBox = motion.create(Box);
const MotionVStack = motion.create(VStack);

export default function SearchForm({ onSearch, onClose: externalOnClose }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { countriesWithPhotos, availableYears } = useContext(CountriesContext);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

  // 🎨 Theme-aware colors
  const cardBg = useColorModeValue('rgba(255,255,255,0.7)', 'rgba(0,0,0,0.45)');
  const borderColor = useColorModeValue('rgba(0,0,0,0.1)', 'rgba(255,255,255,0.15)');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const successColor = useColorModeValue('green.500', 'green.400');

  const handleCountryChange = (v) => {
    setSelectedCountry(v);
    if (v) setSelectedYear('');
    setValidationError('');
  };

  const handleYearChange = (v) => {
    setSelectedYear(v);
    if (v) setSelectedCountry('');
    setValidationError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError('');

    try {
      if (selectedCountry) {
        onSearch?.({ country: selectedCountry });
        toast({
          title: 'Search initiated',
          description: 'Redirecting to country details...',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else if (selectedYear) {
        navigate(`/timeline/${selectedYear}`);
        toast({
          title: 'Timeline search',
          description: `Redirecting to ${selectedYear} timeline...`,
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } else {
        setValidationError('Please select either a country or a year.');
        setIsLoading(false);
        return;
      }

      setTimeout(() => {
        onClose();
        setIsLoading(false);
        externalOnClose?.();
      }, 800);
    } catch {
      setValidationError('An error occurred during the search.');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCountry('');
    setSelectedYear('');
    setValidationError('');
    setIsLoading(false);
    onClose();
    externalOnClose?.();
  };

  const hasSelection = selectedCountry || selectedYear;
  const isFormValid = hasSelection && !validationError;

  return (
    <>
      <Box data-search-trigger onClick={onOpen} display="none" />

      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Search Photos"
        icon={FaSearch}
        size={{ base: 'sm', sm: 'md', md: 'lg' }}
      >
        <MotionVStack
          spacing={6}
          align="stretch"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Info Alert */}
          <Alert
            status="info"
            variant="subtle"
            borderRadius="xl"
            bg={useColorModeValue('rgba(219,234,254,0.6)', 'rgba(30,58,138,0.4)')}
            border="1px solid"
            borderColor={useColorModeValue('rgba(59,130,246,0.3)', 'rgba(147,197,253,0.3)')}
            backdropFilter="blur(6px)"
          >
            <AlertIcon />
            <Box>
              <AlertTitle fontWeight="semibold">Search Options</AlertTitle>
              <AlertDescription fontSize="sm">
                Choose <strong>either</strong> a country to see photos from that location, or a year to browse by timeline.
              </AlertDescription>
            </Box>
          </Alert>

          <form id="search-form" onSubmit={handleSubmit}>
            {/* Country Selection */}
            <MotionBox
              p={4}
              borderRadius="xl"
              bg={cardBg}
              border="1px solid"
              borderColor={selectedCountry ? successColor : borderColor}
              backdropFilter="blur(10px)"
              opacity={selectedYear ? 0.6 : 1}
              _hover={
                selectedYear
                  ? {}
                  : {
                      borderColor: accentColor,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                    }
              }
              transition="all 0.3s ease"
            >
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="md"
                  bgGradient="linear(135deg, blue.400, blue.600)"
                  color="white"
                >
                  <FaGlobe size={14} />
                </Box>
                <Text fontWeight="semibold" color={textColor}>
                  Country
                </Text>
                {selectedCountry && <Badge colorScheme="green">Selected</Badge>}
              </HStack>
              <Select
                placeholder={
                  selectedYear
                    ? 'Clear year selection to enable country'
                    : 'Choose a country...'
                }
                value={selectedCountry}
                onChange={(e) => handleCountryChange(e.target.value)}
                borderRadius="lg"
                borderColor={borderColor}
                bg={useColorModeValue('rgba(255,255,255,0.7)', 'rgba(255,255,255,0.08)')}
                color={useColorModeValue('gray.800', 'gray.100')}
                _focus={{
                  borderColor: accentColor,
                  boxShadow: `0 0 0 2px ${accentColor}40`,
                }}
                _hover={{
                  borderColor: accentColor,
                  transform: 'translateY(-1px)',
                  boxShadow: useColorModeValue(
                    '0 2px 8px rgba(59,130,246,0.2)',
                    '0 2px 8px rgba(59,130,246,0.3)'
                  ),
                }}
                transition="all 0.2s ease"
                disabled={!!selectedYear}
                sx={{
                  option: {
                    bg: useColorModeValue('white', '#1a202c'),
                    color: useColorModeValue('gray.800', 'gray.100'),
                    _hover: { bg: useColorModeValue('blue.50', 'blue.700') },
                    _selected: { bg: useColorModeValue('blue.100', 'blue.600') },
                  },
                }}
              >
                {(countriesWithPhotos || []).length > 0 ? (
                  countriesWithPhotos.map((c) => (
                    <option key={c.countryId || c.id} value={c.countryId || c.id}>
                      {c.countryName || c.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No countries available yet</option>
                )}
              </Select>
            </MotionBox>

            <Divider opacity={0.3} my={4} />

            {/* Year Selection */}
            <MotionBox
              p={4}
              borderRadius="xl"
              bg={cardBg}
              border="1px solid"
              borderColor={selectedYear ? successColor : borderColor}
              backdropFilter="blur(10px)"
              opacity={selectedCountry ? 0.6 : 1}
              _hover={
                selectedCountry
                  ? {}
                  : {
                      borderColor: accentColor,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
                    }
              }
              transition="all 0.3s ease"
            >
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="md"
                  bgGradient="linear(135deg, green.400, teal.500)"
                  color="white"
                >
                  <FaCalendar size={14} />
                </Box>
                <Text fontWeight="semibold" color={textColor}>
                  Year
                </Text>
                {selectedYear && <Badge colorScheme="green">Selected</Badge>}
              </HStack>
              <Select
                placeholder={
                  selectedCountry
                    ? 'Clear country selection to enable year'
                    : 'Choose a year...'
                }
                value={selectedYear}
                onChange={(e) => handleYearChange(e.target.value)}
                borderRadius="lg"
                borderColor={borderColor}
                bg={useColorModeValue('rgba(255,255,255,0.7)', 'rgba(255,255,255,0.08)')}
                color={useColorModeValue('gray.800', 'gray.100')}
                _focus={{
                  borderColor: accentColor,
                  boxShadow: `0 0 0 2px ${accentColor}40`,
                }}
                _hover={{
                  borderColor: accentColor,
                  transform: 'translateY(-1px)',
                  boxShadow: useColorModeValue(
                    '0 2px 8px rgba(59,130,246,0.2)',
                    '0 2px 8px rgba(59,130,246,0.3)'
                  ),
                }}
                transition="all 0.2s ease"
                disabled={!!selectedCountry}
                sx={{
                  option: {
                    bg: useColorModeValue('white', '#1a202c'),
                    color: useColorModeValue('gray.800', 'gray.100'),
                    _hover: { bg: useColorModeValue('blue.50', 'blue.700') },
                    _selected: { bg: useColorModeValue('blue.100', 'blue.600') },
                  },
                }}
              >
                {(availableYears || []).length > 0 ? (
                  availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))
                ) : (
                  <option disabled>No years available</option>
                )}
              </Select>
            </MotionBox>
          </form>

          {/* Validation Error */}
          <AnimatePresence>
            {validationError && (
              <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Alert
                  status="warning"
                  variant="subtle"
                  borderRadius="xl"
                  bg={useColorModeValue('rgba(254,243,199,0.6)', 'rgba(180,83,9,0.35)')}
                  border="1px solid"
                  borderColor={useColorModeValue('orange.300', 'orange.700')}
                  backdropFilter="blur(8px)"
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Warning</AlertTitle>
                    <AlertDescription>{validationError}</AlertDescription>
                  </Box>
                </Alert>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Selection Summary */}
          {hasSelection && (
            <MotionBox
              p={4}
              borderRadius="xl"
              bg={useColorModeValue('rgba(220,252,231,0.7)', 'rgba(21,128,61,0.35)')}
              border="1px solid"
              borderColor={useColorModeValue('green.300', 'green.700')}
              backdropFilter="blur(8px)"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <HStack spacing={2} justify="center">
                <FaInfoCircle color={successColor} />
                <Text fontSize="sm" color={useColorModeValue('green.700', 'green.200')}>
                  {selectedCountry
                    ? `Searching for photos from ${
                        countriesWithPhotos.find((c) => c.id === selectedCountry)?.name
                      }`
                    : `Browsing photos from ${selectedYear}`}
                </Text>
              </HStack>
            </MotionBox>
          )}
        </MotionVStack>

        {/* Footer */}
        <HStack spacing={3} justify="flex-end" mt={6}>
          <ModalButton variant="secondary" onClick={handleClose} size="lg" disabled={isLoading}>
            Cancel
          </ModalButton>
          <ModalButton
            type="submit"
            form="search-form"
            variant="primary"
            size="lg"
            leftIcon={isLoading ? <Spinner size="sm" /> : <FaSearch />}
            isLoading={isLoading}
            disabled={!isFormValid}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </ModalButton>
        </HStack>
      </BaseModal>
    </>
  );
}

