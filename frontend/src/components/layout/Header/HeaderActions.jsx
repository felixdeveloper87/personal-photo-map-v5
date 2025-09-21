import React from 'react';
import { HStack, Box } from '@chakra-ui/react';
import { ModernUpgradeToPremiumButton, ModernPhotoStorageButton, ModernTimelineButton, ModernSearchButton } from '../../ui/buttons/HeaderButtons';
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
            <ModernPhotoStorageButton
              onClick={onPhotoStorageClick}
              size={buttonSize}
              aria-label="Photo Storage"
            />
          </>
        )}

        {/* Botão Premium */}
        {isLoggedIn && !isPremium && (
          <ModernUpgradeToPremiumButton
            onClick={onPremiumClick}
            size={buttonSize}
          />
        )}

        {/* Search e Timeline - Apenas para usuários logados */}
        {isLoggedIn && (
          <>
            {/* Botão de busca visível */}
            <ModernSearchButton
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
            <ModernTimelineButton
              onClick={onTimelineClick}
              size={buttonSize}
              _hover={{
                transform: "translateY(-2px) scale(1.02)",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
              }}
            >
              Timeline
            </ModernTimelineButton>
          </>
        )}
      </HStack>
    </Box>
  );
};

export default React.memo(HeaderActions);
