import React from "react";
import { Button, useColorModeValue, Box, Text, HStack, Icon } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaMoon, FaSun, FaCrown, FaImages, FaMap, FaSignOutAlt, FaClock, FaSearch, FaUser, FaGlobe, FaSignInAlt, FaUserPlus, FaUserCircle, FaVideo } from "react-icons/fa";

const MotionButton = motion.create ? motion.create(Button) : motion(Button);

/* =========================
   ModernThemeToggleButton
   ========================= */
export const ModernThemeToggleButton = ({
  colorMode,
  toggleColorMode,
  styles,
  ...props
}) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%, #60a5fa 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #3b82f6 50%, #1d4ed8 75%, #3b82f6 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #3b82f6 50%, #1d4ed8 75%, #3b82f6 100%)",
    "linear-gradient(135deg, #1d4ed8 0%, #1e40af 25%, #1d4ed8 50%, #1e40af 75%, #1d4ed8 100%)"
  );

  const shadowColor = useColorModeValue("rgba(59, 130, 246, 0.4)", "rgba(29, 78, 216, 0.5)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const hoverBorderColor = useColorModeValue("rgba(255, 255, 255, 0.5)", "rgba(255, 255, 255, 0.4)");

  return (
    <MotionButton
      onClick={toggleColorMode}
      bgGradient={bgGradient}
      color="white"
      size="xs"
      px={2}
      py={2}
      minW="40px"
      h="32px"
      borderRadius="lg"
      fontWeight="600"
      letterSpacing="normal"
      position="relative"
      overflow="hidden"
      border="1px solid"
      borderColor={borderColor}
      backdropFilter="blur(10px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${hoverBorderColor}`,
        borderColor: hoverBorderColor,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{
        transform: "translateY(-1px) scale(0.98)",
        boxShadow: `0 10px 25px ${shadowColor}`
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        {colorMode === "light" ? <FaMoon size="14px" /> : <FaSun size="14px" />}
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernUpgradeToPremiumButton
   ========================= */
export const ModernUpgradeToPremiumButton = ({ onClick, children = "Upgrade to Premium", ...props }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #fbbf24 50%, #f59e0b 75%, #fbbf24 100%)",
    "linear-gradient(135deg, #fcd34d 0%, #fbbf24 25%, #fcd34d 50%, #fbbf24 75%, #fcd34d 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #f59e0b 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #f59e0b 100%)",
    "linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #fbbf24 50%, #f59e0b 75%, #fbbf24 100%)"
  );

  const shadowColor = useColorModeValue("rgba(251, 191, 36, 0.35)", "rgba(252, 211, 77, 0.4)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "gray.800");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="md"
      px={6}
      py={3}
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.02)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <HStack spacing={3} position="relative" zIndex={2}>
        <Icon as={FaCrown} boxSize="16px" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))" />
        <Text fontSize="sm" fontWeight="600">{children}</Text>
      </HStack>
    </MotionButton>
  );
};

/* =========================
   ModernPhotoStorageButton
   ========================= */
export const ModernPhotoStorageButton = ({ onClick, children = "Photo Storage", ...props }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 25%, #ec4899 50%, #8b5cf6 75%, #ec4899 100%)",
    "linear-gradient(135deg, #f472b6 0%, #a78bfa 25%, #f472b6 50%, #a78bfa 75%, #f472b6 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #db2777 0%, #7c3aed 25%, #db2777 50%, #7c3aed 75%, #db2777 100%)",
    "linear-gradient(135deg, #ec4899 0%, #8b5cf6 25%, #ec4899 50%, #8b5cf6 75%, #ec4899 100%)"
  );

  const shadowColor = useColorModeValue("rgba(236, 72, 153, 0.35)", "rgba(244, 114, 182, 0.4)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaImages size="20px" />
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernUserProfileButton
   ========================= */
export const ModernUserProfileButton = ({ onClick, children = "Profile", ...props }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #3b82f6 50%, #1d4ed8 75%, #3b82f6 100%)",
    "linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%, #60a5fa 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #1d4ed8 0%, #1e40af 25%, #1d4ed8 50%, #1e40af 75%, #1d4ed8 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #3b82f6 50%, #1d4ed8 75%, #3b82f6 100%)"
  );

  const shadowColor = useColorModeValue("rgba(59, 130, 246, 0.35)", "rgba(96, 165, 250, 0.4)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaUserCircle size="20px" />
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernLogoutButton
   ========================= */
export const ModernLogoutButton = ({ onClick, children = "Logout", ...props }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #ef4444 50%, #dc2626 75%, #ef4444 100%)",
    "linear-gradient(135deg, #f87171 0%, #ef4444 25%, #f87171 50%, #ef4444 75%, #f87171 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #dc2626 0%, #b91c1c 25%, #dc2626 50%, #b91c1c 75%, #dc2626 100%)",
    "linear-gradient(135deg, #ef4444 0%, #dc2626 25%, #ef4444 50%, #dc2626 75%, #ef4444 100%)"
  );

  const shadowColor = useColorModeValue("rgba(239, 68, 68, 0.35)", "rgba(248, 113, 113, 0.4)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaSignOutAlt size="20px" />
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernTimelineButton
   ========================= */
export const ModernTimelineButton = ({ onClick, children = "Timeline", ...props }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #f97316 0%, #ea580c 25%, #f97316 50%, #ea580c 75%, #f97316 100%)",
    "linear-gradient(135deg, #fb923c 0%, #f97316 25%, #fb923c 50%, #f97316 75%, #fb923c 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #ea580c 0%, #c2410c 25%, #ea580c 50%, #c2410c 75%, #ea580c 100%)",
    "linear-gradient(135deg, #f97316 0%, #ea580c 25%, #f97316 50%, #ea580c 75%, #f97316 100%)"
  );

  const shadowColor = useColorModeValue("rgba(249, 115, 22, 0.35)", "rgba(251, 146, 60, 0.4)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaClock size="20px" />
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernSearchButton
   ========================= */
export const ModernSearchButton = ({ onClick, children = "Search", ...props }) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #93c5fd 0%, #7dd3fc 25%, #93c5fd 50%, #7dd3fc 75%, #93c5fd 100%)",
    "linear-gradient(135deg, #60a5fa 0%, #38bdf8 25%, #60a5fa 50%, #38bdf8 75%, #60a5fa 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #7dd3fc 0%, #67e8f9 25%, #7dd3fc 50%, #67e8f9 75%, #7dd3fc 100%)",
    "linear-gradient(135deg, #38bdf8 0%, #22d3ee 25%, #38bdf8 50%, #22d3ee 75%, #38bdf8 100%)"
  );

  const shadowColor = useColorModeValue("rgba(147, 197, 253, 0.35)", "rgba(96, 165, 250, 0.4)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaSearch size="20px" />
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernMapButton
   ========================= */
// Botão Map moderno seguindo o padrão dos contadores
export const ModernMapButton = ({ onClick, isLoggedIn = true, children = "Map", ...props }) => {
  if (!isLoggedIn) return null; // ⬅️ não mostra se não estiver logado

  const bgGradient = useColorModeValue(
    // Light Mode: Gradiente roxo-azul vibrante e único
    "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 25%, #8b5cf6 50%, #3b82f6 75%, #8b5cf6 100%)",
    // Dark Mode: Gradiente roxo-azul mais intenso
    "linear-gradient(135deg, #a78bfa 0%, #60a5fa 25%, #a78bfa 50%, #60a5fa 75%, #a78bfa 100%)"
  );
  
  const hoverGradient = useColorModeValue(
    // Light Mode: Versão mais escura e rica
    "linear-gradient(135deg, #7c3aed 0%, #1d4ed8 25%, #7c3aed 50%, #1d4ed8 75%, #7c3aed 100%)",
    // Dark Mode: Versão mais intensa
    "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 25%, #8b5cf6 50%, #3b82f6 75%, #8b5cf6 100%)"
  );

  const shadowColor = useColorModeValue(
    "rgba(139, 92, 246, 0.4)", // Sombra roxa para light mode
    "rgba(167, 139, 250, 0.5)"   // Sombra roxa para dark mode
  );
  
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaGlobe size="20px" />
      </Box>
    </MotionButton>
  );
};


/* =========================
   ModernHeaderUserButton
   ========================= */
export const ModernHeaderUserButton = ({
  onClick,
  fullname,
  isPremium,
  styles,
  ...props
}) => {
  const bgGradient = useColorModeValue(
    "linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #60a5fa 50%, #3b82f6 75%, #60a5fa 100%)",
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #3b82f6 50%, #1d4ed8 75%, #3b82f6 100%)"
  );

  const hoverGradient = useColorModeValue(
    "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 25%, #3b82f6 50%, #1d4ed8 75%, #3b82f6 100%)",
    "linear-gradient(135deg, #1d4ed8 0%, #1e40af 25%, #1d4ed8 50%, #1e40af 75%, #1d4ed8 100%)"
  );

  const shadowColor = useColorModeValue("rgba(59, 130, 246, 0.35)", "rgba(29, 78, 216, 0.5)");
  const borderColor = useColorModeValue("rgba(255, 255, 255, 0.3)", "rgba(255, 255, 255, 0.2)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="sm"
      px={3}
      py={4}
      minW="70px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Box position="relative" zIndex={2}>
        <FaUser size="20px" />
      </Box>
    </MotionButton>
  );
};

/* =========================
   ModernLoginButton
   ========================= */
export const ModernLoginButton = ({ onClick, children = "Login", ...props }) => {
  const bgGradient = useColorModeValue(
    // Light Mode: Gradiente azul suave e elegante
    "linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #e0f2fe 50%, #bae6fd 75%, #7dd3fc 100%)",
    // Dark Mode: Gradiente azul escuro elegante
    "linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #3b82f6 50%, #60a5fa 75%, #93c5fd 100%)"
  );

  const hoverGradient = useColorModeValue(
    // Light Mode: Versão mais escura
    "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #7dd3fc 75%, #38bdf8 100%)",
    // Dark Mode: Versão mais clara
    "linear-gradient(135deg, #1e40af 0%, #3b82f6 25%, #60a5fa 50%, #93c5fd 75%, #bfdbfe 100%)"
  );

  const shadowColor = useColorModeValue("rgba(59, 130, 246, 0.15)", "rgba(147, 197, 253, 0.25)");
  const borderColor = useColorModeValue("rgba(59, 130, 246, 0.2)", "rgba(147, 197, 253, 0.3)");
  const textColor = useColorModeValue("blue.600", "blue.100");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="md"
      px={4}
      py={4}
      minW="80px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Text fontSize="sm" fontWeight="600" position="relative" zIndex={2}>
        {children}
      </Text>
    </MotionButton>
  );
};

/* =========================
   ModernRegisterButton
   ========================= */
export const ModernRegisterButton = ({ onClick, children = "Register", ...props }) => {
  const bgGradient = useColorModeValue(
    // Light Mode: Gradiente azul mais intenso para destaque
    "linear-gradient(135deg, #3b82f6 0%, #2563eb 25%, #1d4ed8 50%, #1e40af 75%, #1e3a8a 100%)",
    // Dark Mode: Gradiente azul vibrante
    "linear-gradient(135deg, #60a5fa 0%, #3b82f6 25%, #2563eb 50%, #1d4ed8 75%, #1e40af 100%)"
  );

  const hoverGradient = useColorModeValue(
    // Light Mode: Versão mais escura
    "linear-gradient(135deg, #2563eb 0%, #1d4ed8 25%, #1e40af 50%, #1e3a8a 75%, #1e3a8a 100%)",
    // Dark Mode: Versão mais clara
    "linear-gradient(135deg, #93c5fd 0%, #60a5fa 25%, #3b82f6 50%, #2563eb 75%, #1d4ed8 100%)"
  );

  const shadowColor = useColorModeValue("rgba(59, 130, 246, 0.3)", "rgba(96, 165, 250, 0.4)");
  const borderColor = useColorModeValue("rgba(59, 130, 246, 0.4)", "rgba(96, 165, 250, 0.5)");
  const textColor = useColorModeValue("white", "white");

  return (
    <MotionButton
      onClick={onClick}
      bgGradient={bgGradient}
      color={textColor}
      size="md"
      px={4}
      py={4}
      minW="80px"
      borderRadius="2xl"
      fontWeight="700"
      letterSpacing="wider"
      position="relative"
      overflow="hidden"
      border="2px solid"
      borderColor={borderColor}
      backdropFilter="blur(20px)"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        transition: "left 0.8s ease-out"
      }}
      _after={{
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
        width: "200%",
        height: "200%",
        background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
        opacity: 0,
        transition: "opacity 0.3s ease"
      }}
      _hover={{
        bgGradient: hoverGradient,
        transform: "translateY(-3px) scale(1.05)",
        boxShadow: `0 20px 40px ${shadowColor}, 0 0 0 1px ${borderColor}`,
        _before: { left: "100%" },
        _after: { opacity: 1 }
      }}
      _active={{ transform: "translateY(-1px) scale(0.98)", boxShadow: `0 10px 25px ${shadowColor}` }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      {...props}
    >
      <Text fontSize="sm" fontWeight="600" position="relative" zIndex={2}>
        {children}
      </Text>
    </MotionButton>
  );
};
