import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  useDisclosure,
  useToast,
  useMediaQuery,
  useColorMode,
  useBreakpointValue,
  useColorModeValue,
  Container,
  HStack,
  VStack,
} from "@chakra-ui/react";

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
import HeaderAuth from "./HeaderAuth";
import SearchForm from "../../features/SearchForm";
import {
  ThemeToggleButton,
  LogoutButton,
  MapButton,
  PhotoStorageButton,
  UserProfileButton,
  SearchButton,
  TimelineButton,
  PremiumButton,
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
  const { isLoggedIn, fullname, isPremium, logout, togglePremiumStatus } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } =
    useContext(CountriesContext);

  // Disclosures
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
      // Use the togglePremiumStatus function from AuthContext
      await togglePremiumStatus(true);

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
      } else if (error.message.includes('session has expired') || error.message.includes('log in again') || error.message.includes('Unauthorized')) {
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

  // Handle premium deactivation
  const handlePremiumDeactivate = async () => {
    setIsUpgrading(true);
    try {
      // Use the togglePremiumStatus function from AuthContext
      await togglePremiumStatus(false);

      toast({
        title: "Premium Deactivated",
        description: "You have successfully deactivated your premium status.",
        status: "info",
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
      if (error.message.includes('session has expired') || error.message.includes('log in again') || error.message.includes('Unauthorized')) {
        errorMessage = "Your session has expired. Please log in again to continue.";
        setTimeout(() => {
          loginModal.onOpen();
        }, 3000);
      }

      toast({
        title: "Deactivation Failed",
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
    lg: "md",      // Desktop pequeno
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
  const [isCompact] = useMediaQuery("(max-width: 1100px)");

  return (
    <Box as="header" w="100%" position="relative" zIndex={100}>
      <Container maxW="container.2xl" px={{ base: 2, sm: 4, md: 6 }} {...headerContainerStyles(styles)}>
        {/* Primeira linha do header */}
        <Flex align="center" justify="space-between" w="100%" h="auto" gap={{ base: 1, sm: 2, md: 4 }}>
          {/* ESQUERDA: Logo (canto esquerdo) */}
          <HStack spacing={{ base: 0.5, sm: 2, md: 3 }} align="center" flex="0 0 auto">
            <HeaderLogo styles={styles} onClick={() => navigate("/")} />
          </HStack>

          {/* CENTRO: botões para mobile quando logado - Theme, Map e Logout */}
          {isLoggedIn && isCompact && (
            <HStack spacing={{ base: 1, sm: 1.5, md: 2 }} align="center" flex="0 0 auto">
              <ThemeToggleButton
                colorMode={colorMode}
                toggleColorMode={toggleColorMode}
                styles={styles}
                size={buttonSize}
                hideText={true}
              />
              <MapButton
                isLoggedIn={isLoggedIn}
                onClick={() => navigate("/map/private")}
                size={buttonSize}
                hideText={true}
                aria-label="Go to Map"
              />
              <LogoutButton
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
                hideText={true}
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
            {/* Botão Premium (antes do Map) - sempre visível se logado */}
            {isLoggedIn && (
              <PremiumButton
                onClick={premiumModal.onOpen}
                size={buttonSize}
              />
            )}

            {/* Botão Map - responsivo - apenas para usuários logados */}
            {isLoggedIn && (
              <MapButton
                isLoggedIn={isLoggedIn}
                onClick={() =>
                  isLoggedIn ? navigate("/map/private") : navigate("/map")
                }
                size={buttonSize}
                aria-label="Go to Map"
              />
            )}

            {isLoggedIn && (
              <UserProfileButton
                onClick={profileModal.onOpen}
                size={buttonSize}
              />
            )}

            {isLoggedIn && (
              <>
                <PhotoStorageButton
                  onClick={photoStorageModal.onOpen}
                  size={buttonSize}
                  aria-label="Photo Storage"
                />
                <SearchButton
                  onClick={() => {
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
                  onSearch={(p) => navigate(`/countries/${p.country}?year=${p.year}`)}
                />
                <TimelineButton
                  onClick={() => navigate("/timeline")}
                  size={buttonSize}
                />
              </>
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
            <ThemeToggleButton
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
              <LogoutButton
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

        {/* Segunda linha do header - Todos os botões de ação para mobile quando logado */}
        {isLoggedIn && isCompact && (
          <Box
            w="100%"
            pt={4}
            pb={2}
            borderTop="1px solid"
            borderColor={useColorModeValue("rgba(226, 232, 240, 0.3)", "rgba(51, 65, 85, 0.3)")}
          >
            <VStack spacing={{ base: 1, sm: 1.5 }} w="100%">
              {/* Grid de 5 botões em 1 linha */}
              <Box
                display="grid"
                gridTemplateColumns="repeat(5, 1fr)"
                gap={{ base: 0.5, sm: 1.5, md: 2 }}
                w="100%"
              >
                {/* Botão Premium - sempre visível se logado */}
                {isLoggedIn && (
                  <PremiumButton
                    onClick={premiumModal.onOpen}
                    size="xs"
                    hideText={true}
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    w="100%"
                    h={{ base: "44px", sm: "52px" }}
                    minW="0"
                    px={{ base: 1, sm: 2 }}
                  />
                )}
                
                <PhotoStorageButton
                  onClick={photoStorageModal.onOpen}
                  size="xs"
                  hideText={true}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  h={{ base: "44px", sm: "52px" }}
                  minW="0"
                  px={{ base: 1, sm: 2 }}
                />
                
                <UserProfileButton
                  onClick={profileModal.onOpen}
                  size="xs"
                  hideText={true}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  h={{ base: "44px", sm: "52px" }}
                  minW="0"
                  px={{ base: 1, sm: 2 }}
                />
                
                <SearchButton
                  onClick={() => {
                    // Trigger search form
                    const searchInput = document.querySelector('[data-search-trigger]');
                    if (searchInput) searchInput.click();
                  }}
                  size="xs"
                  hideText={true}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  h={{ base: "44px", sm: "52px" }}
                  minW="0"
                  px={{ base: 1, sm: 2 }}
                />
                
                <TimelineButton
                  onClick={() => navigate("/timeline")}
                  size="xs"
                  hideText={true}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  w="100%"
                  h={{ base: "44px", sm: "52px" }}
                  minW="0"
                  px={{ base: 1, sm: 2 }}
                />
              </Box>
            </VStack>
          </Box>
        )}
      </Container>

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
        onDeactivate={handlePremiumDeactivate}
        isLoading={isUpgrading}
        isPremium={isPremium}
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
