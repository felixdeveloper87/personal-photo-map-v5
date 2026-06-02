import React, { useContext, useState, forwardRef } from "react";
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
} from "@chakra-ui/react";

import { AuthContext } from "../../../context/AuthContext";
import { CountriesContext } from "../../../context/CountriesContext";
import { useHeaderStyles, useHeaderContainerStyles } from "../../../styles/headerStyles";

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

import UserProfileModal from "../../modals/UserProfileModal";
import PremiumBenefitsModal from "../../modals/PremiumBenefitsModal";
import PhotoStorageModal from "../../modals/PhotoStorageModal";
import LoginModal from "../../modals/LoginModal";
import RegisterModal from "../../modals/RegisterModal";

const Header = forwardRef((props, ref) => {
  const navigate = useNavigate();
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();

  const { isLoggedIn, fullname, isPremium, logout, togglePremiumStatus } = useContext(AuthContext);
  const { countriesWithPhotos, photoCount, countryCount } = useContext(CountriesContext);

  const photoStorageModal = useDisclosure();
  const profileModal = useDisclosure();
  const premiumModal = useDisclosure();
  const loginModal = useDisclosure();
  const registerModal = useDisclosure();

  const [isUpgrading, setIsUpgrading] = useState(false);

  const styles = useHeaderStyles();
  const containerStyles = useHeaderContainerStyles();
  const mobileDividerColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const [isCompact] = useMediaQuery("(max-width: 1100px)");

  const buttonSize = useBreakpointValue({
    base: "xs", sm: "sm", md: "sm", lg: "md", xl: "md", "2xl": "lg",
  });

  const stackSpacing = useBreakpointValue({
    base: 2, sm: 3, md: 4, lg: 4, xl: 6, "2xl": 8,
  });

  const centerMaxW = useBreakpointValue({
    lg: "800px", xl: "960px", "2xl": "1140px",
  });

  const mobileButtonProps = {
    size: "xs",
    hideText: true,
    w: "100%",
    h: { base: "44px", sm: "52px" },
    minW: "0",
    px: { base: 1, sm: 2 },
  };

  const handleSearchTrigger = () => {
    document.querySelector('[data-search-trigger]')?.click();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast({ title: "Logged out", status: "info", duration: 2000, isClosable: true });
  };

  const handlePremiumUpgrade = async () => {
    setIsUpgrading(true);
    try {
      await togglePremiumStatus(true);
      toast({
        title: "Premium Upgrade Successful!",
        description: "Welcome to Premium! You now have access to all premium features.",
        status: "success",
        duration: 8000,
        isClosable: true,
        position: "top-right",
      });
      premiumModal.onClose();
      window.location.reload();
    } catch (error) {
      let description = error.message || "Please try again later.";
      if (error.message.includes('session has expired') || error.message.includes('Unauthorized')) {
        description = "Your session has expired. Please log in again.";
        setTimeout(() => loginModal.onOpen(), 3000);
      } else if (error.message.includes('Access denied') || error.message.includes('Access forbidden')) {
        description = "You don't have permission to upgrade. Please contact support.";
      }
      toast({ title: "Upgrade Failed", description, status: "error", duration: 8000, isClosable: true, position: "top-right" });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handlePremiumDeactivate = async () => {
    setIsUpgrading(true);
    try {
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
      window.location.reload();
    } catch (error) {
      let description = error.message || "Please try again later.";
      if (error.message.includes('session has expired') || error.message.includes('Unauthorized')) {
        description = "Your session has expired. Please log in again.";
        setTimeout(() => loginModal.onOpen(), 3000);
      }
      toast({ title: "Deactivation Failed", description, status: "error", duration: 8000, isClosable: true, position: "top-right" });
    } finally {
      setIsUpgrading(false);
    }
  };

  return (
    <Box ref={ref} as="header" w="100%" position="fixed" top="0" left="0" right="0" zIndex={1000}>
      <Container
        maxW="container.2xl"
        px={{ base: 2, sm: 4, md: 6 }}
        {...containerStyles}
        pb={isLoggedIn && isCompact ? 2 : undefined}
      >
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          gap={{ base: 1, sm: 2, md: 4 }}
        >
          <HStack spacing={{ base: 0.5, sm: 2, md: 3 }} align="center" flex="0 0 auto">
            <HeaderLogo styles={styles} />
          </HStack>

          {isLoggedIn && isCompact && (
            <HStack spacing={{ base: 1, sm: 1.5 }} align="center" flex="0 0 auto">
              <ThemeToggleButton colorMode={colorMode} toggleColorMode={toggleColorMode} styles={styles} size={buttonSize} hideText />
              <MapButton onClick={() => navigate("/map/private")} size={buttonSize} hideText aria-label="Go to Map" />
              <LogoutButton onClick={handleLogout} size={buttonSize} hideText />
            </HStack>
          )}

          <HStack
            spacing={2}
            align="center"
            flex="1"
            justify="center"
            display={isCompact ? "none" : "flex"}
            maxW={centerMaxW}
          >
            {isLoggedIn && <PremiumButton      onClick={premiumModal.onOpen}               size={buttonSize} />}
            {isLoggedIn && <MapButton          onClick={() => navigate("/map/private")}    size={buttonSize} aria-label="Go to Map" />}
            {isLoggedIn && <UserProfileButton  onClick={profileModal.onOpen}               size={buttonSize} />}
            {isLoggedIn && <PhotoStorageButton onClick={photoStorageModal.onOpen}          size={buttonSize} aria-label="Photo Storage" />}
            {isLoggedIn && <SearchButton       onClick={handleSearchTrigger}               size={buttonSize} aria-label="Search Photos" />}
            {isLoggedIn && (
              <SearchForm
                countriesWithPhotos={countriesWithPhotos}
                onSearch={(p) => navigate(`/countries/${p.country}?year=${p.year}`)}
              />
            )}
            {isLoggedIn && <TimelineButton onClick={() => navigate("/timeline")} size={buttonSize} />}
          </HStack>

          <HStack
            spacing={isCompact ? 1 : stackSpacing}
            align="center"
            flex="0 0 auto"
            display={isLoggedIn && isCompact ? "none" : "flex"}
          >
            <ThemeToggleButton colorMode={colorMode} toggleColorMode={toggleColorMode} styles={styles} size={buttonSize} />
            {!isLoggedIn ? (
              <HeaderAuth
                styles={styles}
                onLoginClick={loginModal.onOpen}
                onRegisterClick={registerModal.onOpen}
                size={buttonSize}
              />
            ) : (
              <LogoutButton onClick={handleLogout} size={buttonSize} />
            )}
          </HStack>
        </Flex>

        {isLoggedIn && isCompact && (
          <Box
            w="100%"
            mt={3}
            pt={3}
            pb={1}
            borderTop="1px solid"
            borderColor={mobileDividerColor}
            display="grid"
            gridTemplateColumns="repeat(5, 1fr)"
            gap={{ base: 1, sm: 1.5 }}
          >
            <PremiumButton      onClick={premiumModal.onOpen}          {...mobileButtonProps} />
            <PhotoStorageButton onClick={photoStorageModal.onOpen}     {...mobileButtonProps} />
            <UserProfileButton  onClick={profileModal.onOpen}          {...mobileButtonProps} />
            <SearchButton       onClick={handleSearchTrigger}          {...mobileButtonProps} />
            <TimelineButton     onClick={() => navigate("/timeline")}  {...mobileButtonProps} />
          </Box>
        )}
      </Container>

      <UserProfileModal
        isOpen={profileModal.isOpen}
        onClose={profileModal.onClose}
        fullname={fullname}
        email=""
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
      <PhotoStorageModal isOpen={photoStorageModal.isOpen} onClose={photoStorageModal.onClose} />
      <LoginModal
        isOpen={loginModal.isOpen}
        onClose={loginModal.onClose}
        onSwitchToRegister={() => { loginModal.onClose(); registerModal.onOpen(); }}
      />
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={registerModal.onClose}
        onSwitchToLogin={() => { registerModal.onClose(); loginModal.onOpen(); }}
      />
    </Box>
  );
});

Header.displayName = "Header";
export default Header;
