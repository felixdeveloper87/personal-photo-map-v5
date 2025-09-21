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
  Flex,
  useToast
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CountriesContext } from '../../context/CountriesContext';
import { motion, AnimatePresence } from 'framer-motion';
import BaseModal from '../modals/BaseModal';
import ModalButton from '../modals/ModalButton';
import { FaSearch, FaGlobe, FaCalendar, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';

// Motion components
const MotionBox = motion(Box);
const MotionVStack = motion(VStack);

/**
 * SearchForm Component
 *
 * Opens a modal to allow the user to pick a country or year, then either:
 * - Navigates to /countries/[countryId]?year=[year], or
 * - Navigates to /timeline/[year], if only a year is selected.
 *
 * @param {function} onSearch - A callback function triggered when a country is selected (extra logic if needed).
 * @param {function} onClose - Optional callback function to be called when the modal is closed.
 * @returns {JSX.Element}
 */
export default function SearchForm({ onSearch, onClose: externalOnClose }) {
  // Chakra UI modal controls
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  // Retrieve country data and available years from context
  const { countriesWithPhotos, availableYears } = useContext(CountriesContext);

  // Local states for selected country and year
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // React Router navigation
  const navigate = useNavigate();

  // Theme-aware colors
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('blue.500', 'blue.400');
  const successColor = useColorModeValue('green.500', 'green.400');
  const warningColor = useColorModeValue('orange.500', 'orange.400');

  // Clear validation error when selections change
  // Also clear the other selection to enforce single choice
  const handleCountryChange = (value) => {
    setSelectedCountry(value);
    if (value) {
      setSelectedYear(''); // Clear year when country is selected
    }
    setValidationError('');
  };

  const handleYearChange = (value) => {
    setSelectedYear(value);
    if (value) {
      setSelectedCountry(''); // Clear country when year is selected
    }
    setValidationError('');
  };

  /**
   * Handles the form submission when the user clicks "Search".
   * - If a country is selected, call onSearch (if provided).
   * - If only a year is selected, navigate to /timeline/[year] with year as route parameter.
   * - If neither is selected, prompt the user to pick an option.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setValidationError('');

    try {
      if (selectedCountry) {
        if (onSearch) {
          await onSearch({ country: selectedCountry });
        }
        toast({
          title: "Search initiated",
          description: "Redirecting to country details...",
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else if (selectedYear) {
        navigate(`/timeline/${selectedYear}`);
        toast({
          title: "Timeline search",
          description: `Redirecting to ${selectedYear} timeline...`,
          status: "success",
          duration: 2000,
          isClosable: true,
        });
      } else {
        setValidationError('Please select either a country or a year to continue.');
        return;
      }

      // Close the modal after a successful search
      setTimeout(() => {
        onClose();
        setIsLoading(false);
        // Chamar função externa se fornecida
        if (externalOnClose) {
          externalOnClose();
        }
      }, 1000);
    } catch (error) {
      setValidationError('An error occurred during the search. Please try again.');
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setSelectedCountry('');
    setSelectedYear('');
    setValidationError('');
    setIsLoading(false);
    onClose();
    // Chamar função externa se fornecida
    if (externalOnClose) {
      externalOnClose();
    }
  };

  const hasSelection = selectedCountry || selectedYear;
  const isFormValid = hasSelection && !validationError;

  return (
    <>
      {/* Hidden trigger button that can be clicked by external components */}
      <Box
        data-search-trigger
        onClick={onOpen}
        display="none"
        aria-hidden="true"
      />

      {/* Modal for selecting a country/year */}
      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        title="Search Photos"
        icon={FaSearch}
        size="md"
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
            borderRadius="lg"
            bg={useColorModeValue("blue.50", "blue.900")}
            border="1px solid"
            borderColor={useColorModeValue("blue.200", "blue.700")}
          >
            <AlertIcon />
            <Box>
              <AlertTitle>Search Options</AlertTitle>
              <AlertDescription>
                Choose <strong>either</strong> a country to see photos from that location, <strong>or</strong> select a year to browse photos by timeline. You can only select one option at a time.
              </AlertDescription>
            </Box>
          </Alert>

          <form id="search-form" onSubmit={handleSubmit}>
            {/* Country Selection */}
            <MotionBox
              p={4}
              borderRadius="xl"
              bg={bgColor}
              border="2px solid"
              borderColor={selectedCountry ? successColor : borderColor}
              opacity={selectedYear ? 0.6 : 1}
              _hover={selectedYear ? {} : { 
                borderColor: selectedCountry ? successColor : accentColor,
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: selectedYear ? 0.6 : 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={useColorModeValue("blue.100", "blue.900")}
                  color={useColorModeValue("blue.600", "blue.300")}
                >
                  <FaGlobe size={16} />
                </Box>
                <Text fontWeight="semibold" color={textColor}>
                  Country
                </Text>
                {selectedCountry && (
                  <Badge colorScheme="green" variant="subtle">
                    Selected
                  </Badge>
                )}
              </HStack>
              
              <Tooltip 
                label="Select a country to view photos from that location"
                placement="top"
                hasArrow
              >
                <Select
                  placeholder={selectedYear ? "Clear year selection to enable country" : "Choose a country..."}
                  value={selectedCountry}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  borderColor={selectedCountry ? successColor : borderColor}
                  _focus={{ 
                    borderColor: accentColor, 
                    boxShadow: `0 0 0 3px ${accentColor}20` 
                  }}
                  _hover={{ borderColor: accentColor }}
                  transition="all 0.2s ease"
                  disabled={!!selectedYear}
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
              </Tooltip>
            </MotionBox>

            <Divider />

            {/* Year Selection */}
            <MotionBox
              p={4}
              borderRadius="xl"
              bg={bgColor}
              border="2px solid"
              borderColor={selectedYear ? successColor : borderColor}
              opacity={selectedCountry ? 0.6 : 1}
              _hover={selectedCountry ? {} : { 
                borderColor: selectedYear ? successColor : accentColor,
                transform: "translateY(-2px)",
                shadow: "lg"
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: selectedCountry ? 0.6 : 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <HStack spacing={3} mb={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg={useColorModeValue("green.100", "green.900")}
                  color={useColorModeValue("green.600", "green.300")}
                >
                  <FaCalendar size={16} />
                </Box>
                <Text fontWeight="semibold" color={textColor}>
                  Year
                </Text>
                {selectedYear && (
                  <Badge colorScheme="green" variant="subtle">
                    Selected
                  </Badge>
                )}
              </HStack>
              
              <Tooltip 
                label="Select a year to browse photos from that time period"
                placement="top"
                hasArrow
              >
                <Select
                  placeholder={selectedCountry ? "Clear country selection to enable year" : "Choose a year..."}
                  value={selectedYear}
                  onChange={(e) => handleYearChange(e.target.value)}
                  size="lg"
                  borderRadius="lg"
                  borderColor={selectedYear ? successColor : borderColor}
                  _focus={{ 
                    borderColor: accentColor, 
                    boxShadow: `0 0 0 3px ${accentColor}20` 
                  }}
                  _hover={{ borderColor: accentColor }}
                  transition="all 0.2s ease"
                  disabled={!!selectedCountry}
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
              </Tooltip>
            </MotionBox>
          </form>

          {/* Validation Error */}
          <AnimatePresence>
            {validationError && (
              <MotionBox
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                overflow="hidden"
              >
                <Alert
                  status="warning"
                  variant="subtle"
                  borderRadius="lg"
                  bg={useColorModeValue("orange.50", "orange.900")}
                  border="1px solid"
                  borderColor={useColorModeValue("orange.200", "orange.700")}
                >
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Please fix the following:</AlertTitle>
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
              borderRadius="lg"
              bg={useColorModeValue("green.50", "green.900")}
              border="1px solid"
              borderColor={useColorModeValue("green.200", "green.700")}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <HStack spacing={2} justify="center">
                <FaInfoCircle color={successColor} />
                <Text fontSize="sm" color={useColorModeValue("green.700", "green.300")}>
                  {selectedCountry 
                    ? `Searching for photos from ${countriesWithPhotos.find(c => c.id === selectedCountry)?.name}`
                    : `Browsing photos from ${selectedYear}`
                  }
                </Text>
              </HStack>
            </MotionBox>
          )}
        </MotionVStack>

        {/* Footer with action buttons */}
        <HStack spacing={3} justify="flex-end" mt={6}>
          <ModalButton 
            variant="secondary" 
            onClick={handleClose}
            size="lg"
            disabled={isLoading}
          >
            Cancel
          </ModalButton>
          <ModalButton 
            type="submit" 
            form="search-form"
            variant="primary"
            size="lg"
            leftIcon={isLoading ? <Spinner size="sm" /> : <FaSearch />}
            isLoading={isLoading}
            loadingText="Searching..."
            disabled={!isFormValid}
          >
            {isLoading ? "Searching..." : "Search"}
          </ModalButton>
        </HStack>
      </BaseModal>
    </>
  );
}
