import React from 'react';
import { HStack, Box } from '@chakra-ui/react';
import { PhotoStorageButton, TimelineButton, SearchButton } from '../../ui/buttons/HeaderButtons';
import SearchForm from '../../features/SearchForm';

const HeaderActions = ({ 
  styles, 
  colorMode, 
  toggleColorMode, 
  isLoggedIn, 
  isPremium, 
  onPremiumClick,
  onPhotoStorageClick,
  countriesWithPhotos,
  onSearch,
  onTimelineClick,
  buttonSize = "sm"
}) => {
  return (
    <Box my={2}>
      <HStack spacing={6} align="center">
        {/* Botões de funcionalidades para usuários logados - Counters */}
        {isLoggedIn && (
          <>
            <PhotoStorageButton
              onClick={onPhotoStorageClick}
              size={buttonSize}
              aria-label="Photo Storage"
            />
          </>
        )}

        {/* Search e Timeline - Apenas para usuários logados */}
        {isLoggedIn && (
          <>
            {/* Botão de busca visível */}
            <SearchButton
              onClick={() => {
                // Encontrar e clicar no botão oculto do SearchForm
                const searchTrigger = document.querySelector('[data-search-trigger]');
                if (searchTrigger) {
                  searchTrigger.click();
                }
              }}
              size={buttonSize}
              aria-label="Search Photos"
            />
            
            <SearchForm
              countriesWithPhotos={countriesWithPhotos}
              onSearch={onSearch}
            />
            <TimelineButton
              onClick={onTimelineClick}
              size={buttonSize}
            />
          </>
        )}
      </HStack>
    </Box>
  );
};

export default React.memo(HeaderActions);
