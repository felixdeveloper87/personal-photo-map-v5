import React from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Avatar,
  Badge,
  IconButton,
  Collapse,
  Flex,
  Center,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaImages, FaMap, FaUser, FaSignOutAlt, FaMoon, FaSun, FaTimes, FaUserCircle } from "react-icons/fa";
import { 
  PhotoStorageButton,
  UserProfileButton,
  SearchButton,
  TimelineButton
} from "../../ui/buttons/HeaderButtons";
import SearchForm from "../../features/SearchForm";
import {
  userProfileCardStyles,
  mobileMenuStyles,
  themeToggleStyles,
  counterCardEnhancedStyles,
} from "../../../styles/headerStyles";
import { useNavigate } from "react-router-dom";

/**
 * HeaderMobile
 * Responsável SOMENTE pela renderização do menu mobile.
 * Recebe todos os dados e handlers via props; não mantém estado de modais nem contexto.
 */
const HeaderMobile = ({
  isOpen,
  styles,
  colorMode,
  toggleColorMode,
  isLoggedIn,
  fullname,
  isPremium,
  photoCount,
  countryCount,
  countriesWithPhotos,
  buttonSize = "xs",
  onProfileClick,
  onPremiumClick,
  onPhotoStorageClick,
  onTimelineClick,
  onSearch,
  onLoginClick,
  onRegisterClick,
  onLogout,
  onClose,
}) => {
  const navigate = useNavigate();

  return (
    <Box display={{ base: "block", xl: "none" }}>
      <Collapse in={isOpen} animateOpacity transition={{ duration: 0.2, ease: "easeInOut" }}>
        <Box
          {...mobileMenuStyles(styles)}
          position="absolute"
          top="100%"
          left={0}
          right={0}
          zIndex={999}
          w="100%"
          mt={0}
          boxShadow="0 6px 20px rgba(0,0,0,0.15)"
          backdropFilter="blur(16px)"
          overflow="hidden"
        >
          {isLoggedIn ? (
            <VStack align="stretch" spacing={{ base: 1, sm: 1.5 }} px={{ base: 1.5, sm: 2 }} pt={0.5} pb={{ base: 1.5, sm: 2 }}>
              {/* Perfil do Usuário - Apenas visual, não clicável */}
              <Flex
                {...userProfileCardStyles(styles)}
                align="center"
                w="full"
                justify="space-between"
                py={{ base: 1, sm: 1.5 }}
                px={{ base: 2, sm: 2.5 }}
                minH={{ base: "40px", sm: "45px" }}
                cursor="default"
              >
                {/* Lado esquerdo: Avatar e informações do usuário */}
                <Flex align="center" flex={1}>
                  <Avatar
                    size="xs"
                    name={fullname}
                    mr={{ base: 2, sm: 2.5 }}
                    bg={isPremium ? styles.premiumGradient : styles.accentColor}
                    color="white"
                    ring="1px"
                    ringColor={isPremium ? styles.premiumBorderColor : "rgba(255, 255, 255, 0.3)"}
                    transition="all 0.2s ease"
                  />
                  <Box flex={1}>
                    <Text 
                      color={styles.textColor} 
                      fontSize={{ base: "xs", sm: "sm" }} 
                      fontWeight="600" 
                      lineHeight="1.2"
                      noOfLines={1}
                    >
                      {fullname}
                    </Text>
                    {isPremium && (
                      <Badge
                        mt={0.5}
                        colorScheme="yellow"
                        variant="solid"
                        borderRadius="full"
                        px={{ base: 1, sm: 1.5 }}
                        py={0}
                        fontSize={{ base: "10px", sm: "xs" }}
                        h={{ base: "14px", sm: "16px" }}
                      >
                        PREMIUM
                      </Badge>
                    )}
                  </Box>
                </Flex>

                {/* Lado direito: Controle de Fechar */}
                <HStack spacing={1} ml={2}>
                  {/* Botão de Fechar */}
                  <IconButton
                    aria-label="Close menu"
                    icon={<FaTimes />}
                    onClick={onClose}
                    size="xs"
                    variant="ghost"
                    color={styles.warningColor}
                    borderRadius="lg"
                    bg="rgba(239, 68, 68, 0.1)"
                    border="1px solid"
                    borderColor="rgba(239, 68, 68, 0.2)"
                    _hover={{
                      bg: "rgba(239, 68, 68, 0.2)",
                      transform: "scale(1.05)",
                      borderColor: "rgba(239, 68, 68, 0.3)"
                    }}
                    w="28px"
                    h="28px"
                    minW="28px"
                    minH="28px"
                  />
                </HStack>
              </Flex>

              {/* Botão My Profile - Explícito e separado */}
              

              {/* Botões responsivos - Grid adaptável */}
              <Box w="full">
                {/* Em telas muito pequenas (< 320px): 2x2, em telas pequenas (>= 320px): 4x1 */}
                <Box
                  display="grid"
                  gridTemplateColumns={{ base: "1fr 1fr", sm: "repeat(4, 1fr)" }}
                  gap={{ base: 1, sm: 1 }}
                  w="full"
                >
                  {/* Photo Storage Button */}
                  <PhotoStorageButton
                    onClick={onPhotoStorageClick}
                    size={buttonSize}
                    w="full"
                    borderRadius="md"
                    display="flex"
                    flexDirection={{ base: "column", sm: "row" }}
                    alignItems="center"
                    justifyContent="center"
                  />

                  {/* User Profile Button */}
                  <UserProfileButton
                    onClick={onProfileClick}
                    size={buttonSize}
                    w="full"
                    borderRadius="md"
                    display="flex"
                    flexDirection={{ base: "column", sm: "row" }}
                    alignItems="center"
                    justifyContent="center"
                  />

                  {/* Search Button */}
                  <SearchButton
                    onClick={() => {
                      const searchTrigger = document.querySelector('[data-search-trigger]');
                      if (searchTrigger) {
                        searchTrigger.click();
                      }
                    }}
                    size={buttonSize}
                    w="full"
                    borderRadius="md"
                    display="flex"
                    flexDirection={{ base: "column", sm: "row" }}
                    alignItems="center"
                    justifyContent="center"
                  />

                  {/* Timeline Button */}
                  <TimelineButton
                    onClick={onTimelineClick}
                    size={buttonSize}
                    w="full"
                    borderRadius="md"
                    display="flex"
                    flexDirection={{ base: "column", sm: "row" }}
                    alignItems="center"
                    justifyContent="center"
                  />
                </Box>
              </Box>

              {/* SearchForm para usuários logados */}
              <SearchForm
                countriesWithPhotos={countriesWithPhotos}
                onSearch={onSearch}
                onClose={onClose}
              />
            </VStack>
          ) : (
            // Usuário não logado - não mostra nada no menu hamburguer
            // Os botões de Login/Register estão no header principal
            <Box display="none" />
          )}
        </Box>
      </Collapse>
    </Box>
  );
};

export default React.memo(HeaderMobile);
