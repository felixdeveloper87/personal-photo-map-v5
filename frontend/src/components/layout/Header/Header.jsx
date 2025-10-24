import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  useDisclosure,
  useToast,
  IconButton,
  useMediaQuery,
  useColorMode,
  useBreakpointValue,
  useColorModeValue,
  Container,
  HStack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";

import { AuthContext } from "../../../context/AuthContext";
import { CountriesContext } from "../../../context/CountriesContext";
import { buildApiUrl } from "../../../utils/apiConfig";

// Estilos centralizados
import {
  useHeaderStyles,
  headerContainerStyles,
} from "../../../styles/headerStyles";

// Componentes do header
import HeaderLogo from "./HeaderLogo";
import HeaderActions from "./HeaderActions";
import HeaderAuth from "./HeaderAuth";
import HeaderUser from "./HeaderUser";
import HeaderMobile from "./HeaderMobile";
import {
  ModernThemeToggleButton,
  ModernLogoutButton,
  ModernMapButton,
  ModernPhotoStorageButton,
  ModernUserProfileButton,
  ModernSearchButton,
  ModernTimelineButton,
  ModernUpgradeToPremiumButton,
} from "../../ui/buttons/HeaderButtons";

// Modais
import UserProfileModal from "../../modals/UserProfileModal";
import PremiumBenefitsModal from "../../modals/PremiumBenefitsModal";
import PhotoStorageModal from "../../modals/PhotoStorageModal";
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";

const Header = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  // Contextos
  const { isLoggedIn, fullname, isPremium, logout, upgradeToPremium } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } =
    useContext(CountriesContext);

  // Disclosures
  const mobileMenu = useDisclosure();
  const photoStorageModal = useDisclosure();
  const profileModal = useDisclosure();
  const premiumModal = useDisclosure();
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();

  // States
  const [isUpgrading, setIsUpgrading] = useState(false);

  const styles = useHeaderStyles(colorMode);

  // Handle premium upgrade
  const handlePremiumUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }


      const upgradeUrl = buildApiUrl('/api/users/make-premium');


      // Use only PUT method as defined in the backend controller
      const response = await fetch(upgradeUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();

        } catch (readError) {

        }

        // Handle specific HTTP status codes
        if (response.status === 403) {
          throw new Error('Access denied. Premium upgrade is currently restricted. This feature may require admin approval or may not be available for self-service. Please contact support for assistance.');
        } else if (response.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        } else if (response.status === 404) {
          throw new Error('Premium upgrade endpoint not found.');
        } else if (response.status >= 500) {
          throw new Error('Server error. Please try again later.');
        } else {
          throw new Error(errorText || `Upgrade failed with status ${response.status}`);
        }
      }

      // Success! Parse response and update premium status
      const data = await response.json();

      // Update premium status in localStorage and reload
      localStorage.setItem('premium', 'true');

      toast({
        title: "Premium Upgrade Successful! 🎉",
        description: "Welcome to Premium! You now have access to all premium features.",
        status: "success",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });

      premiumModal.onClose();

      // Refresh page to update UI
      window.location.reload();

    } catch (error) {

      let errorMessage = error.message || "Please try again later.";

      // Handle specific error cases
      if (error.message.includes('Access denied') || error.message.includes('restricted')) {
        errorMessage = "Premium upgrade is currently restricted. This feature may require admin approval or may not be available for self-service. Please contact support for assistance.";
        // Don't redirect to login for permission issues
      } else if (error.message.includes('session has expired') || error.message.includes('log in again')) {
        errorMessage = "Your session has expired. Please log in again to continue.";
        // Only redirect to login for actual authentication issues
        setTimeout(() => {
          loginModal.onOpen();
        }, 3000);
      } else if (error.message.includes('Access forbidden')) {
        errorMessage = "You don't have permission to upgrade. Please contact support.";
      }

      toast({
        title: "Upgrade Failed",
        description: errorMessage,
        status: "error",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  // ====== Responsividade completa para todos os botões ======
  // Tamanhos de botões responsivos para TODAS as telas
  const buttonSize = useBreakpointValue({
    base: "xs",    // Mobile pequeno
    sm: "sm",      // Mobile médio
    md: "sm",      // Tablet
    lg: "sm",      // Desktop pequeno
    xl: "md",      // Desktop médio
    "2xl": "lg",   // Desktop grande
  });

  // Espaçamento dos HStacks em desktop
  const stackSpacing = useBreakpointValue({
    base: 2,
    sm: 3,
    md: 4,
    lg: 4,
    xl: 6,
    "2xl": 8,
  });

  // Largura máxima da área central em desktop
  const centerMaxW = useBreakpointValue({
    lg: "800px",
    xl: "960px",
    "2xl": "1140px",
  });

  // Mostrar versão compacta (hamburger + logo map button) em larguras <= 1380px
  const [isCompact] = useMediaQuery("(max-width: 1380px)");

  return (
    <Box as="header" w="100%" position="relative" zIndex={100}>
      <Container maxW="container.2xl" px={{ base: 2, sm: 4, md: 6 }} {...headerContainerStyles(styles)}>
        {/* Primeira linha do header */}
        <Flex align="center" justify="space-between" w="100%" h="auto" gap={{ base: 1, sm: 2, md: 4 }}>
          {/* ESQUERDA: Logo (canto esquerdo) */}
          <HStack spacing={{ base: 0.5, sm: 2, md: 3 }} align="center" flex="0 0 auto">
            <HeaderLogo styles={styles} onClick={() => navigate("/")} />
          </HStack>

          {/* CENTRO: 3 botões (Map, Theme, Logout) para mobile quando logado */}
          {isLoggedIn && isCompact && (
            <HStack spacing={{ base: 1, sm: 1.5, md: 2 }} align="center" flex="0 0 auto">
              <ModernMapButton
                isLoggedIn={isLoggedIn}
                onClick={() => navigate("/map/private")}
                size={buttonSize}
                aria-label="Go to Map"
              />
              <ModernThemeToggleButton
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                styles={styles}
                size={buttonSize}
              />
              <ModernLogoutButton
                onClick={() => {
                  logout();
                  navigate("/");
                  toast({
                    title: "Logged out",
                    status: "info",
                    duration: 3000,
                  });
                }}
                size={buttonSize}
              />
            </HStack>
          )}

          {/* CENTRO: Navegação e ações principais (desktop) */}
          <HStack
            spacing={2}
            align="center"
            flex="1"
            justify="center"
            display={isCompact ? "none" : "flex"}
            maxW={centerMaxW}
          >
            {/* Botão Map - responsivo */}
            <ModernMapButton
              isLoggedIn={isLoggedIn}
              onClick={() =>
                isLoggedIn ? navigate("/map/private") : navigate("/map")
              }
              size={buttonSize}
              aria-label="Go to Map"
            />

            {isLoggedIn && (
              <HeaderUser
                styles={styles}
                fullname={fullname}
                isPremium={isPremium}
                onProfileClick={profileModal.onOpen}
                size={buttonSize}
              />
            )}

            {isLoggedIn && (
              <HeaderActions
                styles={styles}
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                isLoggedIn={isLoggedIn}
                isPremium={isPremium}
                onPremiumClick={premiumModal.onOpen}
                onPhotoStorageClick={photoStorageModal.onOpen}
                countriesWithPhotos={countriesWithPhotos}
                onSearch={(p) =>
                  navigate(`/countries/${p.country}?year=${p.year}`)
                }
                onTimelineClick={() => navigate("/timeline")}
                buttonSize={buttonSize}
              />
            )}
          </HStack>

          {/* DIREITA: Theme Toggle + Auth/Logout */}
          <HStack
            spacing={isCompact ? 1 : stackSpacing}
            align="center"
            flex="0 0 auto"
            display={isLoggedIn && isCompact ? "none" : "flex"}
          >
            {/* Theme toggle - sempre visível */}
            <ModernThemeToggleButton
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
              styles={styles}
              size={buttonSize}
            />

            {/* Auth buttons - sempre visível */}
            {!isLoggedIn ? (
              <HeaderAuth
                styles={styles}
                onLoginClick={loginModal.onOpen}
                onRegisterClick={registerModal.onOpen}
                size={buttonSize}
              />
            ) : (
              <ModernLogoutButton
                onClick={() => {
                  logout();
                  navigate("/"); // Redireciona para a landing page após logout
                  toast({
                    title: "Logged out",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  });
                }}
                size={buttonSize}
              />
            )}
          </HStack>
        </Flex>

        {/* Segunda linha do header - Botões de ação para mobile quando logado */}
        {isLoggedIn && isCompact && (
          <Box
            w="100%"
            pt={2}
            pb={2}
            borderTop="1px solid"
            borderColor={useColorModeValue("rgba(226, 232, 240, 0.3)", "rgba(51, 65, 85, 0.3)")}
          >
            <VStack spacing={{ base: 1, sm: 1.5 }} w="100%">
              {/* Grid de 4 botões principais */}
              <Box
                display="grid"
                gridTemplateColumns="repeat(4, 1fr)"
                gap={{ base: 1, sm: 1.5, md: 2 }}
                w="100%"
              >
                <ModernPhotoStorageButton
                  onClick={photoStorageModal.onOpen}
                  size={buttonSize}
                  display="flex"
                  flexDirection="column"
                />
                
                <ModernUserProfileButton
                  onClick={profileModal.onOpen}
                  size={buttonSize}
                  display="flex"
                  flexDirection="column"
                />
                
                <ModernSearchButton
                  onClick={() => {
                    // Trigger search form
                    const searchInput = document.querySelector('[data-search-trigger]');
                    if (searchInput) searchInput.click();
                  }}
                  size={buttonSize}
                  display="flex"
                  flexDirection="column"
                />
                
                <ModernTimelineButton
                  onClick={() => navigate("/timeline")}
                  size={buttonSize}
                  display="flex"
                  flexDirection="column"
                />
              </Box>

              {/* Botão Premium (se não for premium) */}
              {!isPremium && (
                <ModernUpgradeToPremiumButton
                  onClick={premiumModal.onOpen}
                  w="100%"
                  size={buttonSize}
                />
              )}
            </VStack>
          </Box>
        )}
      </Container>

      {/* MENU MOBILE (aparece somente no base…lg) */}
      <HeaderMobile
        isCompact={isCompact}
        isOpen={mobileMenu.isOpen}
        styles={styles}
        colorMode={colorMode}
        toggleColorMode={toggleColorMode}
        isLoggedIn={isLoggedIn}
        fullname={fullname}
        isPremium={isPremium}
        photoCount={photoCount}
        countryCount={countryCount}
        countriesWithPhotos={countriesWithPhotos}
        buttonSize={buttonSize}
        onProfileClick={() => {
          profileModal.onOpen();
          mobileMenu.onClose();
        }}
        onPremiumClick={() => {
          premiumModal.onOpen();
          mobileMenu.onClose();
        }}
        onPhotoStorageClick={() => {
          photoStorageModal.onOpen();
          mobileMenu.onClose();
        }}
        onTimelineClick={() => {
          navigate("/timeline");
          mobileMenu.onClose();
        }}
        onSearch={(p) => navigate(`/countries/${p.country}?year=${p.year}`)}
        onLoginClick={() => {
          loginModal.onOpen();
          mobileMenu.onClose();
        }}
        onRegisterClick={() => {
          registerModal.onOpen();
          mobileMenu.onClose();
        }}
        onLogout={() => {
          logout();
          navigate("/"); // Redireciona para a landing page após logout
          mobileMenu.onClose();
          toast({
            title: "Logged out",
            status: "info",
            duration: 2000,
            isClosable: true,
          });
        }}
        onClose={mobileMenu.onClose} // ⬅️ fecha pelo X no topo
      />

      {/* MODAIS */}
      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={profileModal.onClose}
        fullname={fullname}
        email={""} // TODO: Adicionar email do usuário quando disponível
        photoCount={photoCount}
        countryCount={countryCount}
        isPremium={isPremium}
      />
      <PremiumBenefitsModal
        isOpen={premiumModal.isOpen}
        onClose={premiumModal.onClose}
        onUpgrade={handlePremiumUpgrade}
        isLoading={isUpgrading}
      />
      <PhotoStorageModal
        isOpen={photoStorageModal.isOpen}
        onClose={photoStorageModal.onClose}
      />
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        onSwitchToRegister={() => {
          loginModal.onClose();
          registerModal.onOpen();
        }}
      />
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onSwitchToLogin={() => {
          registerModal.onClose();
          loginModal.onOpen();
        }}
      />
    </Box>
  );
};

export default Header;
