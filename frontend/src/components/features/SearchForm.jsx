/* eslint-disable react/prop-types */
import { useContext, useMemo, useRef, useState } from 'react';
import { Box, HStack, Icon, SimpleGrid, Text, VStack, useBreakpointValue, useDisclosure } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import {
  HiArrowRight,
  HiCalendarDays,
  HiCamera,
  HiCheckCircle,
  HiGlobeAmericas,
  HiMagnifyingGlass,
} from 'react-icons/hi2';
import { CountriesContext } from '../../context/CountriesContext';
import BaseModal from '../modals/BaseModal';
import ModalButton from '../modals/ModalButton';
import { Chip, ModalActions, ModalField, ModalSection, ModalState, Segmented } from '../modals/ModalKit';
import EnhancedFlag from './CountryDetails/EnhancedFlag';
import { color, radius, type } from '../../design/tokens';

const countryKey = (c) => String(c.countryId || c.id || '');
const countryLabel = (c) => c.countryName || c.name || countryKey(c).toUpperCase();

/** One selectable country row (defined at module level so it never remounts). */
const CountryRow = ({ country, isSelected, onSelect, onConfirm }) => {
  const id = countryKey(country);
  return (
    <HStack
      as="button"
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(id)}
      onDoubleClick={() => onConfirm(id)}
      w="full"
      spacing={3}
      px={3}
      py={2.5}
      borderRadius={radius.md}
      border="1px solid"
      borderColor={isSelected ? color.primarySoftBorder : 'transparent'}
      bg={isSelected ? color.primarySoftBg : 'transparent'}
      textAlign="left"
      transition="background .15s ease, border-color .15s ease"
      _hover={isSelected ? undefined : { bg: color.surfaceHover }}
      _focusVisible={{ outline: 'none', boxShadow: `0 0 0 3px ${color.focusRing}` }}
    >
      <Box w="30px" h="21px" flexShrink={0} borderRadius="4px" overflow="hidden">
        <EnhancedFlag countryCode={id.toUpperCase()} />
      </Box>
      <Text flex={1} minW={0} fontSize="sm" fontWeight={isSelected ? 700 : 500} color={isSelected ? color.text : color.textSoft} noOfLines={1}>
        {countryLabel(country)}
      </Text>
      {country.photoCount > 0 && (
        <HStack spacing={1} color={color.textMuted} flexShrink={0}>
          <Icon as={HiCamera} boxSize={3} />
          <Text {...type.label}>{country.photoCount}</Text>
        </HStack>
      )}
      <Icon
        as={HiCheckCircle}
        boxSize={4.5}
        color={color.primary}
        opacity={isSelected ? 1 : 0}
        transition="opacity .15s ease"
        flexShrink={0}
      />
    </HStack>
  );
};

export default function SearchForm({ onSearch, onClose: externalOnClose }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { countriesWithPhotos, availableYears } = useContext(CountriesContext);
  const navigate = useNavigate();
  const queryRef = useRef(null);
  const isDesktop = useBreakpointValue({ base: false, sm: true }, { ssr: false });

  const [mode, setMode] = useState('country'); // 'country' | 'year'
  const [query, setQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  const countries = useMemo(
    () => [...(countriesWithPhotos || [])].sort((a, b) => countryLabel(a).localeCompare(countryLabel(b))),
    [countriesWithPhotos]
  );
  const years = useMemo(() => [...(availableYears || [])].sort((a, b) => Number(b) - Number(a)), [availableYears]);

  const filteredCountries = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return countries;
    return countries.filter((c) => countryLabel(c).toLowerCase().includes(q) || countryKey(c).toLowerCase() === q);
  }, [countries, query]);

  const selectedCountryName = useMemo(() => {
    const c = countries.find((x) => countryKey(x) === selectedCountry);
    return c ? countryLabel(c) : '';
  }, [countries, selectedCountry]);

  const reset = () => {
    setMode('country');
    setQuery('');
    setSelectedCountry('');
    setSelectedYear('');
  };

  const handleClose = () => {
    reset();
    onClose();
    externalOnClose?.();
  };

  const go = ({ country = selectedCountry, year = selectedYear } = {}) => {
    if (mode === 'country' && country) {
      onSearch?.({ country });
    } else if (mode === 'year' && year) {
      navigate(`/timeline/${year}`);
    } else {
      return;
    }
    handleClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Enter in the filter with a single match opens it directly.
    if (mode === 'country' && !selectedCountry && filteredCountries.length === 1) {
      go({ country: countryKey(filteredCountries[0]) });
      return;
    }
    go();
  };

  const canSubmit = mode === 'country' ? !!selectedCountry : !!selectedYear;
  const submitLabel =
    mode === 'country'
      ? selectedCountryName
        ? `Open ${selectedCountryName}`
        : 'Choose a country'
      : selectedYear
        ? `View ${selectedYear}`
        : 'Choose a year';

  return (
    <>
      <Box data-search-trigger onClick={onOpen} display="none" />

      <BaseModal
        isOpen={isOpen}
        onClose={handleClose}
        eyebrow="Find photos"
        title="Search your map"
        subtitle="Jump to a country's photos, or browse everything from one year."
        icon={HiMagnifyingGlass}
        size={{ base: 'full', sm: 'md', md: 'lg' }}
        // Desktop: focus the filter straight away. Mobile: don't pop the keyboard over the list.
        initialFocusRef={isDesktop && mode === 'country' ? queryRef : undefined}
        footer={
          <ModalActions>
            <ModalButton variant="secondary" onClick={handleClose}>
              Cancel
            </ModalButton>
            <ModalButton type="submit" form="search-form" variant="primary" rightIcon={<HiArrowRight />} isDisabled={!canSubmit}>
              {submitLabel}
            </ModalButton>
          </ModalActions>
        }
      >
        <form id="search-form" onSubmit={handleSubmit} noValidate>
          <VStack spacing={5} align="stretch">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'country', label: 'By country', icon: HiGlobeAmericas },
                { value: 'year', label: 'By year', icon: HiCalendarDays },
              ]}
            />

            {mode === 'country' ? (
              countries.length === 0 ? (
                <ModalState kind="empty" icon={HiGlobeAmericas} title="No countries yet" py={8}>
                  Upload photos to a country and it will show up here.
                </ModalState>
              ) : (
                <VStack spacing={3} align="stretch">
                  <ModalField
                    ref={queryRef}
                    icon={HiMagnifyingGlass}
                    placeholder={`Filter ${countries.length} countries…`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Filter countries"
                    autoComplete="off"
                  />
                  <ModalSection
                    title={query ? `${filteredCountries.length} match${filteredCountries.length === 1 ? '' : 'es'}` : 'Your countries'}
                    spacing={2}
                  >
                    {filteredCountries.length === 0 ? (
                      <Text fontSize="sm" color={color.textMuted} px={1} py={4} textAlign="center">
                        No country matches “{query}”.
                      </Text>
                    ) : (
                      <VStack
                        role="radiogroup"
                        aria-label="Countries"
                        spacing={1}
                        align="stretch"
                        maxH={{ base: '46vh', sm: '300px' }}
                        overflowY="auto"
                        mx={-1}
                        px={1}
                      >
                        {filteredCountries.map((c) => (
                          <CountryRow
                            key={countryKey(c)}
                            country={c}
                            isSelected={countryKey(c) === selectedCountry}
                            onSelect={setSelectedCountry}
                            onConfirm={(id) => go({ country: id })}
                          />
                        ))}
                      </VStack>
                    )}
                  </ModalSection>
                </VStack>
              )
            ) : years.length === 0 ? (
              <ModalState kind="empty" icon={HiCalendarDays} title="No years yet" py={8}>
                Your photo years will appear here once you upload.
              </ModalState>
            ) : (
              <ModalSection title={`${years.length} year${years.length === 1 ? '' : 's'} with photos`} spacing={3}>
                <SimpleGrid columns={{ base: 3, sm: 4 }} spacing={2} role="radiogroup" aria-label="Years">
                  {years.map((y) => (
                    <Chip
                      key={y}
                      role="radio"
                      aria-pressed={undefined}
                      aria-checked={String(y) === String(selectedYear)}
                      isActive={String(y) === String(selectedYear)}
                      onClick={() => setSelectedYear(String(y))}
                      onDoubleClick={() => go({ year: String(y) })}
                      fontFamily="mono"
                      h="40px"
                    >
                      {y}
                    </Chip>
                  ))}
                </SimpleGrid>
              </ModalSection>
            )}
          </VStack>
        </form>
      </BaseModal>
    </>
  );
}
