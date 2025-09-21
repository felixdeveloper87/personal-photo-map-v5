import { useColorModeValue } from '@chakra-ui/react';

export const useHeaderStyles = () => {
  // Gradientes em tons de oceano para ambos os temas
  const bgGradient = useColorModeValue(
    // Light Mode: Gradiente suave em tons de oceano
    "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 25%, #81d4fa 50%, #4fc3f7 75%, #29b6f6 100%)",
    // Dark Mode: Gradiente profundo em tons de oceano escuro
    "linear-gradient(135deg, #0c1e35 0%, #1a365d 25%, #2d5a87 50%, #1e4a8a 75%, #0f3a5f 100%)"
  );

  // Cores de texto otimizadas para melhor legibilidade
  const textColor = useColorModeValue("gray.800", "gray.100");
  const textColorSecondary = useColorModeValue("gray.600", "gray.300");
  const textColorMuted = useColorModeValue("gray.500", "gray.400");

  // Cores de destaque em tons de oceano
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const accentColorHover = useColorModeValue("blue.600", "blue.200");
  const successColor = useColorModeValue("green.500", "green.300");
  const warningColor = useColorModeValue("orange.500", "orange.300");

  // Efeitos glassmorphism aprimorados
  const cardBg = useColorModeValue(
    "rgba(255, 255, 255, 0.9)", 
    "rgba(15, 20, 30, 0.9)"
  );
  const cardHover = useColorModeValue(
    "rgba(255, 255, 255, 0.95)", 
    "rgba(15, 20, 30, 0.95)"
  );
  const cardBorder = useColorModeValue(
    "rgba(226, 232, 240, 0.8)", 
    "rgba(51, 65, 85, 0.8)"
  );

  // Sombras modernas e sutis - mais suaves para mobile
  const boxShadow = useColorModeValue(
    "0 6px 24px rgba(0, 0, 0, 0.08), 0 3px 12px rgba(0, 0, 0, 0.06)",
    "0 6px 24px rgba(0, 0, 0, 0.3), 0 3px 12px rgba(0, 0, 0, 0.25)"
  );
  const cardShadow = useColorModeValue(
    "0 3px 15px rgba(0, 0, 0, 0.06), 0 1px 6px rgba(0, 0, 0, 0.04)",
    "0 3px 15px rgba(0, 0, 0, 0.25), 0 1px 6px rgba(0, 0, 0, 0.15)"
  );
  const cardShadowHover = useColorModeValue(
    "0 8px 25px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08)",
    "0 8px 25px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)"
  );

  // Gradientes premium modernizados
  const premiumGradient = useColorModeValue(
    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
  );
  const premiumGradientHover = useColorModeValue(
    "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    "linear-gradient(135deg, #d97706 0%, #b45309 100%)"
  );
  
  const premiumBorderColor = useColorModeValue(
    "rgba(251, 191, 36, 0.3)",
    "rgba(245, 158, 11, 0.4)"
  );
  const premiumBadgeBg = useColorModeValue(
    "rgba(251, 191, 36, 0.95)",
    "rgba(245, 158, 11, 0.95)"
  );

  // Padrão de fundo sutil em tons de oceano
  const backgroundPattern = useColorModeValue(
    'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23666" fill-opacity="0.03"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23fff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
  );

  // Cores para elementos específicos
  const logoTextColor = useColorModeValue("gray.900", "white");
  const logoSubtextColor = useColorModeValue("gray.600", "gray.300");
  const themeToggleBg = useColorModeValue(
    "rgba(255, 255, 255, 0.9)", 
    "rgba(15, 20, 30, 0.9)"
  );
  const themeToggleHover = useColorModeValue(
    "rgba(255, 255, 255, 1)", 
    "rgba(15, 20, 30, 1)"
  );

  return {
    bgGradient,
    textColor,
    textColorSecondary,
    textColorMuted,
    accentColor,
    accentColorHover,
    successColor,
    warningColor,
    cardBg,
    cardHover,
    cardBorder,
    boxShadow,
    cardShadow,
    cardShadowHover,
    premiumGradient,
    premiumGradientHover,
    premiumBorderColor,
    premiumBadgeBg,
    backgroundPattern,
    logoTextColor,
    logoSubtextColor,
    themeToggleBg,
    themeToggleHover
  };
};

export const headerContainerStyles = (backgroundPattern) => ({
  w: "100%",
  position: "sticky",
  top: 0,
  zIndex: 1000,
  backdropFilter: "blur(24px)",
  borderBottom: "1px solid",
  borderColor: "rgba(226, 232, 240, 0.2)",
  py: 2, // Reduced from default padding
  _before: {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    bg: backgroundPattern,
    opacity: 0.4,
    zIndex: -1
  }
});

export const cardStyles = (isPremium = false, premiumStyles = {}, themeStyles = {}) => ({
  bg: isPremium ? premiumStyles.gradient : themeStyles.cardBg,
  px: 3,
  py: 2,
  borderRadius: "xl",
  cursor: "pointer",
  _hover: {
    bg: isPremium ? premiumStyles.gradientHover : themeStyles.cardHover,
    transform: "translateY(-2px)",
    boxShadow: themeStyles.cardShadowHover
  },
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  backdropFilter: "blur(20px)",
  border: "1px solid",
  borderColor: isPremium ? premiumStyles.borderColor : themeStyles.cardBorder,
  position: "relative",
  overflow: "hidden",
  _before: {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
    transition: "left 0.6s ease",
    zIndex: 1
  },
  _hover: {
    _before: {
      left: "100%"
    }
  }
});

export const mobileMenuStyles = (themeStyles = {}) => ({
  pb: 2,
  pt: 0,
  borderRadius: "lg",
  backdropFilter: "blur(20px)",
  border: "1px solid",
  borderColor: themeStyles.cardBorder,
  mt: 1,
  bg: themeStyles.cardBg,
  boxShadow: themeStyles.cardShadow,
  // Performance optimizations
  willChange: "transform, opacity",
  perspective: 1000,
  // Smooth animations
  transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  // Responsive design
  maxW: { base: "98vw", sm: "95vw" },
  mx: "auto",
  // Prevent horizontal scroll on very small screens
  overflowX: "hidden",
  // Z-index ajustado para evitar conflitos
  zIndex: 999
});

// Novos estilos para elementos específicos
export const logoStyles = (themeStyles = {}) => ({
  align: "center",
  cursor: "pointer",
  _hover: { 
    transform: "scale(1.02)",
    filter: "brightness(1.05)"
  },
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  flexShrink: 0,
  minW: "220px"
});

export const themeToggleStyles = (themeStyles = {}) => ({
  "aria-label": "Toggle Theme",
  variant: "ghost",
  size: "md",
  bg: themeStyles.themeToggleBg,
  border: "1px solid",
  borderColor: themeStyles.cardBorder,
  borderRadius: "xl",
  _hover: {
    bg: themeStyles.themeToggleHover,
    transform: "scale(1.05)",
    boxShadow: themeStyles.cardShadow
  },
  transition: "all 0.2s ease",
  backdropFilter: "blur(20px)"
});

export const counterCardStyles = (themeStyles = {}) => ({
  bg: themeStyles.cardBg,
  px: 3,
  py: 2,
  borderRadius: "xl",
  cursor: "pointer",
  _hover: {
    bg: themeStyles.cardHover,
    transform: "translateY(-2px)",
    boxShadow: themeStyles.cardShadowHover
  },
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  backdropFilter: "blur(20px)",
  border: "1px solid",
  borderColor: themeStyles.cardBorder,
  position: "relative",
  overflow: "hidden"
});

export const userProfileCardStyles = (themeStyles = {}) => ({
  bg: themeStyles.cardBg,
  px: 2.5,
  py: 1.5,
  borderRadius: "md",
  cursor: "pointer",
  _hover: {
    bg: themeStyles.cardHover,
    transform: "translateY(-0.5px)",
    boxShadow: themeStyles.cardShadowHover,
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  transition: "all 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  backdropFilter: "blur(20px)",
  border: "1px solid",
  borderColor: themeStyles.cardBorder,
  position: "relative",
  overflow: "hidden",
  // Performance optimizations
  willChange: "transform",
  // Ultra compact
  minH: "45px"
});

export const counterCardEnhancedStyles = (themeStyles = {}) => ({
  bg: themeStyles.cardBg,
  px: 3,
  py: 2,
  borderRadius: "lg",
  cursor: "pointer",
  _hover: {
    bg: themeStyles.cardHover,
    transform: "translateY(-1px)",
    boxShadow: themeStyles.cardShadowHover,
    borderColor: "rgba(255, 255, 255, 0.3)"
  },
  transition: "all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  backdropFilter: "blur(16px)",
  border: "1px solid",
  borderColor: themeStyles.cardBorder,
  position: "relative",
  overflow: "hidden",
  // Performance optimizations
  willChange: "transform"
});
