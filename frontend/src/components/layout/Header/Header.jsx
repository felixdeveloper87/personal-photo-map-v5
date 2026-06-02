import React, { forwardRef } from "react";
import {
  Box,
  Flex,
  useMediaQuery,
  useBreakpointValue,
  Container,
  HStack,
} from "@chakra-ui/react";
import { FaClock, FaCrown, FaGlobe, FaImages, FaMoon, FaSearch, FaSignOutAlt, FaSun, FaUserCircle } from "react-icons/fa";

import { useHeaderStyles, useHeaderContainerStyles } from "../../../styles/headerStyles";

import HeaderLogo from "./HeaderLogo";
import HeaderAuth from "./HeaderAuth";
import SettingsMenu from "../SettingsMenu";
import {
  ThemeToggleButton,
  LogoutButton,
  MapButton,
  SearchButton,
  TimelineButton,
  PremiumButton,
} from "../../ui/buttons/HeaderButtons";

const Header = forwardRef(({ nav }, ref) => {
  const styles = useHeaderStyles();
  const containerStyles = useHeaderContainerStyles();
  const [isCompact] = useMediaQuery("(max-width: 1100px)");
  const isLoggedIn = nav.isLoggedIn;

  const buttonSize = useBreakpointValue({
    base: "xs", sm: "sm", md: "sm", lg: "md", xl: "md", "2xl": "lg",
  });

  const stackSpacing = useBreakpointValue({
    base: 2, sm: 3, md: 4, lg: 4, xl: 6, "2xl": 8,
  });

  const centerMaxW = useBreakpointValue({
    lg: "800px", xl: "960px", "2xl": "1140px",
  });

  const mobileMenuItems = [
    { icon: FaCrown, label: "Premium", onClick: nav.premiumModal.onOpen },
    { icon: FaGlobe, label: "Map", onClick: () => nav.navigate("/map/private") },
    { icon: FaSearch, label: "Search", onClick: nav.handleSearchTrigger },
    { icon: FaClock, label: "Timeline", onClick: () => nav.navigate("/timeline") },
    { icon: FaUserCircle, label: "Profile", onClick: nav.profileModal.onOpen },
    { icon: FaImages, label: "Photos", onClick: nav.photoStorageModal.onOpen },
    { icon: nav.colorMode === "light" ? FaMoon : FaSun, label: "Theme", onClick: nav.toggleColorMode },
    { icon: FaSignOutAlt, label: "Logout", onClick: nav.handleLogout, danger: true },
  ];

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
          {/* Logo Brand */}
          <HStack spacing={{ base: 0.5, sm: 2, md: 3 }} align="center" flex="0 0 auto">
            <HeaderLogo styles={styles} />
          </HStack>

          {/* Controls visible on mobile top-row when logged-in */}
          {isLoggedIn && isCompact && (
            <HStack spacing={{ base: 1.5, sm: 2 }} align="center" flex="0 0 auto">
              <SettingsMenu
                items={mobileMenuItems}
                title="Menu"
                variant="icon"
                size="sm"
                hideText
                aria-label="Open menu"
              />
            </HStack>
          )}

          {/* Desktop Menu - Center Nav Links (Hidden on Mobile) */}
          <HStack
            spacing={2}
            align="center"
            flex="1"
            justify="center"
            display={isCompact ? "none" : "flex"}
            maxW={centerMaxW}
          >
            {isLoggedIn && <PremiumButton onClick={nav.premiumModal.onOpen} size={buttonSize} />}
            {isLoggedIn && <MapButton onClick={() => nav.navigate("/map/private")} size={buttonSize} aria-label="Go to Map" />}
            {isLoggedIn && <SearchButton onClick={nav.handleSearchTrigger} size={buttonSize} aria-label="Search Photos" />}
            {isLoggedIn && <TimelineButton onClick={() => nav.navigate("/timeline")} size={buttonSize} />}
            {isLoggedIn && (
              <SettingsMenu
                onProfile={nav.profileModal.onOpen}
                onPhotos={nav.photoStorageModal.onOpen}
                size={buttonSize}
              />
            )}
          </HStack>

          {/* Right Side Control Bar (Desktop or Logged Out Mobile) */}
          <HStack
            spacing={isCompact ? 1 : stackSpacing}
            align="center"
            flex="0 0 auto"
            display={isLoggedIn && isCompact ? "none" : "flex"}
          >
            <ThemeToggleButton colorMode={nav.colorMode} toggleColorMode={nav.toggleColorMode} styles={styles} size={buttonSize} />
            {!isLoggedIn ? (
              <HeaderAuth
                styles={styles}
                onLoginClick={nav.loginModal.onOpen}
                onRegisterClick={nav.registerModal.onOpen}
                size={buttonSize}
              />
            ) : (
              <LogoutButton onClick={nav.handleLogout} size={buttonSize} />
            )}
          </HStack>
        </Flex>

      </Container>
    </Box>
  );
});

Header.displayName = "Header";
export default Header;
