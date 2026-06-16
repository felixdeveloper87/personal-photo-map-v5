/* eslint-disable react/prop-types */
import { forwardRef } from "react";
import {
  Box,
  Button,
  Flex,
  Icon,
  Link,
  Text,
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

const LANDING_NAV = [
  { label: "Features", href: "#features" },
  { label: "Gallery", href: "#gallery" },
  { label: "Workflow", href: "#workflow" },
];

const Header = forwardRef(({ nav, isLandingHeader = false }, ref) => {
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

  if (isLandingHeader) {
    return (
      <Box
        ref={ref}
        as="header"
        w="100%"
        position="fixed"
        top={{ base: "10px", md: "16px" }}
        left="0"
        right="0"
        zIndex={1000}
        px={{ base: 3, md: 6 }}
      >
        <Container maxW="container.xl" px={0}>
          <Flex
            align="center"
            justify="space-between"
            gap={{ base: 3, md: 6 }}
            bg="rgba(14,17,24,0.72)"
            border="1px solid"
            borderColor="rgba(236,231,220,0.12)"
            boxShadow="0 18px 54px rgba(0,0,0,0.38)"
            backdropFilter="blur(18px)"
            borderRadius={{ base: "12px", md: "999px" }}
            px={{ base: 3, sm: 4, md: 5 }}
            py={{ base: 2.5, md: 3 }}
          >
            <Flex
              align="center"
              gap={2.5}
              minW="max-content"
              cursor="pointer"
              onClick={() => nav.navigate("/")}
              role="group"
            >
              <Box
                w="10px"
                h="10px"
                borderRadius="50% 50% 50% 0"
                bg="#EBB572"
                transform="rotate(-45deg)"
                boxShadow="0 0 18px rgba(235,181,114,0.45)"
              />
              <Text
                fontFamily="'Instrument Serif', Georgia, serif"
                fontSize={{ base: "21px", md: "24px" }}
                lineHeight="1"
                color="#ECE7DC"
                whiteSpace="nowrap"
              >
                Photo<Text as="span" color="#EBB572" fontStyle="italic">Map</Text>
              </Text>
            </Flex>

            <HStack
              as="nav"
              spacing={{ base: 3, lg: 6 }}
              display={{ base: "none", md: "flex" }}
              flex="1"
              justify="center"
            >
              {LANDING_NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  color="#8B90A0"
                  fontSize="13px"
                  fontWeight="600"
                  textDecoration="none"
                  _hover={{ color: "#ECE7DC", textDecoration: "none" }}
                >
                  {item.label}
                </Link>
              ))}
            </HStack>

            <HStack spacing={{ base: 2, md: 3 }} minW="max-content">
              <Button
                onClick={nav.loginModal.onOpen}
                variant="ghost"
                h={{ base: "34px", md: "38px" }}
                px={{ base: 3, md: 4 }}
                borderRadius="8px"
                color="#ECE7DC"
                fontSize="13px"
                fontWeight="600"
                bg="transparent"
                _hover={{ bg: "rgba(236,231,220,0.07)", color: "#EBB572" }}
                _active={{ bg: "rgba(236,231,220,0.10)" }}
              >
                Log in
              </Button>
              <Button
                onClick={nav.registerModal.onOpen}
                h={{ base: "34px", md: "38px" }}
                px={{ base: 3.5, md: 5 }}
                borderRadius="8px"
                bg="#EBB572"
                color="#0A0C11"
                fontSize="13px"
                fontWeight="700"
                rightIcon={<Icon as={FaGlobe} boxSize={3.5} display={{ base: "none", sm: "block" }} />}
                _hover={{ bg: "#F1C98D", transform: "translateY(-1px)", boxShadow: "0 14px 34px rgba(235,181,114,0.22)" }}
                _active={{ bg: "#D79A55", transform: "translateY(0)" }}
              >
                Create map
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  }

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
