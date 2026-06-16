/* eslint-disable react/prop-types */
import React, { useState, useContext } from 'react';
import {
  Select, useDisclosure, VStack, HStack, Text, Box, Icon, Spinner
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CountriesContext } from '../../context/CountriesContext';
import { motion, AnimatePresence } from 'framer-motion';
import BaseModal from '../modals/BaseModal';
import ModalButton from '../modals/ModalButton';
import { FaSearch, FaGlobe, FaCalendar, FaInfoCircle, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useLandingTokens } from './landing/landingUI';

const MotionBox = motion.create(Box);
const MONO = "'Spline Sans Mono', ui-monospace, SFMono-Regular, monospace";

const TONES = {
  amber: { icon: '#EBB572', soft: 'rgba(235,181,114,0.10)', border: 'rgba(235,181,114,0.40)', glow: 'rgba(235,181,114,0.16)' },
  teal:  { icon: '#6FD0C4', soft: 'rgba(111,208,196,0.10)', border: 'rgba(111,208,196,0.40)', glow: 'rgba(111,208,196,0.16)' },
  rose:  { icon: '#E58A7B', soft: 'rgba(229,138,123,0.10)', border: 'rgba(229,138,123,0.40)', glow: 'rgba(229,138,123,0.16)' },
};

const selectSx = (t) => ({
  option: {
    bg: '#11151E',
    color: '#ECE7DC',
  },
  '&:focus': { outline: 'none' },
  '&::-webkit-scrollbar': { width: '6px' },
  '&::-webkit-scrollbar-thumb': { background: 'rgba(235,181,114,0.28)', borderRadius: '3px' },
});

export default function SearchForm({ onSearch, onClose: externalOnClose }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { countriesWithPhotos, availableYears } = useContext(CountriesContext);
  const t = useLandingTokens();

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const navigate = useNavigate();

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
      } else if (selectedYear) {
        navigate(`/timeline/${selectedYear}`);
      } else {
        setValidationError('Select a country or a year to continue.');
        setIsLoading(false);
        return;
      }
      setTimeout(() => {
        onClose();
        setIsLoading(false);
        externalOnClose?.();
      }, 600);
    } catch {
      setValidationError('An error occurred. Please try again.');
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

  const SelectCard = ({ tone, icon, label, value, onChange, disabled, placeholder }) => {
    const active = !!value;
    const tn = TONES[tone];
    return (
      <Box
        p={4}
        borderRadius="14px"
        bg={t.surface}
        border="1px solid"
        borderColor={active ? tn.border : disabled ? t.hairline : t.hairline}
        boxShadow={active ? `0 0 0 1px ${tn.border}, 0 8px 24px -12px ${tn.glow}` : 'none'}
        opacity={disabled ? 0.48 : 1}
        transition="all .2s ease"
        _hover={disabled ? {} : { borderColor: tn.border }}
      >
        <HStack spacing={3} mb={3}>
          <Box
            p={1.5}
            borderRadius="8px"
            bg={tn.soft}
            border={`1px solid ${tn.border}`}
            color={tn.icon}
            display="inline-flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={icon} boxSize={3.5} />
          </Box>
          <Text
            fontFamily={MONO}
            fontSize="11px"
            fontWeight="700"
            letterSpacing="0.08em"
            color={t.textMuted}
            textTransform="uppercase"
          >
            {label}
          </Text>
          {active && (
            <Box ml="auto" display="flex" alignItems="center" gap="4px">
              <Icon as={FaCheckCircle} boxSize={3} color={tn.icon} />
              <Text fontFamily={MONO} fontSize="10px" color={tn.icon} fontWeight="700">
                Selected
              </Text>
            </Box>
          )}
        </HStack>
        <Select
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          borderRadius="10px"
          borderColor={active ? tn.border : t.hairline}
          bg="rgba(10,12,17,0.60)"
          color={t.text}
          fontFamily={MONO}
          fontSize="13px"
          _focus={{ borderColor: tn.icon, boxShadow: `0 0 0 2px ${tn.glow}` }}
          _hover={{ borderColor: tn.border }}
          _placeholder={{ color: t.textMuted }}
          sx={selectSx(t)}
        >
          {label === 'Country'
            ? (countriesWithPhotos || []).length > 0
              ? countriesWithPhotos.map((c) => (
                  <option key={c.countryId || c.id} value={c.countryId || c.id}>
                    {c.countryName || c.name}
                  </option>
                ))
              : <option disabled>No countries available yet</option>
            : (availableYears || []).length > 0
              ? availableYears.map((yr) => (
                  <option key={yr} value={yr}>{yr}</option>
                ))
              : <option disabled>No years available</option>
          }
        </Select>
      </Box>
    );
  };

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
        <VStack spacing={5} align="stretch">

          {/* Hint */}
          <HStack
            spacing={3}
            p={3}
            borderRadius="12px"
            bg={t.primarySoftBg}
            border="1px solid"
            borderColor="rgba(235,181,114,0.20)"
          >
            <Icon as={FaInfoCircle} color={t.primary} boxSize={4} flexShrink={0} />
            <Text fontFamily={MONO} fontSize="11px" color={t.textSoft} letterSpacing="0.03em">
              Choose <strong>country</strong> to view photos by location, or a <strong>year</strong> to browse the timeline.
            </Text>
          </HStack>

          <form id="search-form" onSubmit={handleSubmit}>
            <VStack spacing={3}>
              <SelectCard
                tone="amber"
                icon={FaGlobe}
                label="Country"
                value={selectedCountry}
                onChange={handleCountryChange}
                disabled={!!selectedYear}
                placeholder={selectedYear ? 'Clear year to enable' : 'Choose a country…'}
              />

              {/* OR divider */}
              <HStack w="full" spacing={3}>
                <Box flex={1} h="1px" bg={t.hairline} />
                <Text fontFamily={MONO} fontSize="10px" fontWeight="700" color={t.textMuted} letterSpacing="0.12em">
                  OR
                </Text>
                <Box flex={1} h="1px" bg={t.hairline} />
              </HStack>

              <SelectCard
                tone="teal"
                icon={FaCalendar}
                label="Year"
                value={selectedYear}
                onChange={handleYearChange}
                disabled={!!selectedCountry}
                placeholder={selectedCountry ? 'Clear country to enable' : 'Choose a year…'}
              />
            </VStack>
          </form>

          {/* Validation error */}
          <AnimatePresence>
            {validationError && (
              <MotionBox
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                p={3}
                borderRadius="12px"
                bg="rgba(229,138,123,0.10)"
                border="1px solid rgba(229,138,123,0.32)"
              >
                <HStack spacing={2}>
                  <Icon as={FaExclamationTriangle} color="#E58A7B" boxSize={4} />
                  <Text fontFamily={MONO} fontSize="12px" color="#E58A7B">{validationError}</Text>
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Selection summary */}
          <AnimatePresence>
            {hasSelection && (
              <MotionBox
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                p={3}
                borderRadius="12px"
                bg={selectedCountry ? 'rgba(235,181,114,0.08)' : 'rgba(111,208,196,0.08)'}
                border="1px solid"
                borderColor={selectedCountry ? 'rgba(235,181,114,0.28)' : 'rgba(111,208,196,0.28)'}
                textAlign="center"
              >
                <Text
                  fontFamily={MONO}
                  fontSize="11px"
                  color={selectedCountry ? t.primary : t.accent}
                  fontWeight="700"
                  letterSpacing="0.04em"
                >
                  {selectedCountry
                    ? `→ ${countriesWithPhotos?.find((c) => (c.countryId || c.id) === selectedCountry)?.countryName || selectedCountry}`
                    : `→ Timeline ${selectedYear}`}
                </Text>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Footer */}
          <HStack spacing={3} justify="flex-end" pt={1}>
            <ModalButton variant="secondary" onClick={handleClose} disabled={isLoading}>
              Cancel
            </ModalButton>
            <ModalButton
              type="submit"
              form="search-form"
              variant="primary"
              leftIcon={isLoading ? <Spinner size="sm" /> : <FaSearch />}
              isLoading={isLoading}
              disabled={!hasSelection}
            >
              {isLoading ? 'Searching…' : 'Search'}
            </ModalButton>
          </HStack>

        </VStack>
      </BaseModal>
    </>
  );
}
