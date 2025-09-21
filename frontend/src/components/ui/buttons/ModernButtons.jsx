import React from "react";
import {
  Button,
  Text,
  HStack,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

// =======================================================
// Motion
// =======================================================
const MotionButton = motion(Button);

// =======================================================
// Hooks de estilo
// =======================================================

/** Paletas por tipo de botão */
function useButtonColors(type) {
  const light = {
    login: {
      bg: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 25%,#3b82f6 50%,#1d4ed8 75%,#3b82f6 100%)",
      hover: "linear-gradient(135deg,#1d4ed8 0%,#1e40af 25%,#1d4ed8 50%,#1e40af 75%,#1d4ed8 100%)",
      shadow: "rgba(59,130,246,0.4)",
      text: "white",
    },
    register: {
      bg: "linear-gradient(135deg,#10b981 0%,#059669 25%,#10b981 50%,#059669 75%,#10b981 100%)",
      hover: "linear-gradient(135deg,#059669 0%,#047857 25%,#059669 50%,#047857 75%,#059669 100%)",
      shadow: "rgba(16,185,129,0.4)",
      text: "white",
    },
  };

  const dark = {
    login: {
      bg: "linear-gradient(135deg,#60a5fa 0%,#3b82f6 25%,#60a5fa 50%,#3b82f6 75%,#60a5fa 100%)",
      hover: "linear-gradient(135deg,#3b82f6 0%,#1d4ed8 25%,#3b82f6 50%,#1d4ed8 75%,#3b82f6 100%)",
      shadow: "rgba(96,165,250,0.5)",
      text: "white",
    },
    register: {
      bg: "linear-gradient(135deg,#22c55e 0%,#16a34a 25%,#22c55e 50%,#16a34a 75%,#22c55e 100%)",
      hover: "linear-gradient(135deg,#16a34a 0%,#15803d 25%,#16a34a 50%,#15803d 75%,#16a34a 100%)",
      shadow: "rgba(34,197,94,0.5)",
      text: "white",
    },
  };

  const isLight = useColorModeValue(true, false);
  return (isLight ? light : dark)[type];
}

/** Borda com contraste no tema */
function useBorderColor() {
  return useColorModeValue("rgba(255,255,255,0.3)", "rgba(255,255,255,0.2)");
}

// =======================================================
// Estilos base e utilitários
// =======================================================

const BASE_MOTION = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.4, ease: "easeOut" },
};

const SWEEP_EFFECTS = {
  _before: {
        content: '""',
        position: "absolute",
        top: 0,
        left: "-100%",
    w: "100%",
    h: "100%",
    bg: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
    transition: "left 0.8s ease-out",
  },
  _after: {
        content: '""',
        position: "absolute",
        top: "-50%",
        left: "-50%",
    w: "200%",
    h: "200%",
    bg: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
        opacity: 0,
    transition: "opacity 0.3s ease",
  },
  _hover: {
    _before: { left: "100%" },
    _after: { opacity: 1 },
  },
};

// Mapeia ajustes por variante visual
const VARIANT_PRESETS = {
  full: { px: 8, py: 4, borderWidth: 2, radius: "3xl", textSize: "lg" },
  compact: { px: 6, py: 3, borderWidth: 1, radius: "2xl", textSize: "sm" },
};

// =======================================================
// Componente genérico
// =======================================================

function ModernButtonBase({
  type,
  variant = "full",
  onClick,
  icon,
  children,
  iconAnimation, // CSS transform para _groupHover
  ...rest
}) {
  const colors = useButtonColors(type);
  const borderColor = useBorderColor();
  const preset = VARIANT_PRESETS[variant] || VARIANT_PRESETS.full;

  // Leve ajuste de motion para compact
  const motionTweaks =
    variant === "compact"
      ? { whileHover: { scale: 1.03 }, whileTap: { scale: 0.97 }, transition: { duration: 0.3, ease: "easeOut" } }
      : BASE_MOTION;

  return (
    <MotionButton
      role="group"
      onClick={onClick}
      position="relative"
      overflow="hidden"
      backdropFilter="blur(20px)"
      fontWeight="700"
      letterSpacing="wider"
      size="md"
      px={preset.px}
      py={preset.py}
      borderRadius={preset.radius}
      borderWidth={preset.borderWidth}
      borderColor={borderColor}
      color={colors.text}
      bgGradient={colors.bg}
      _hover={{
        bgGradient: colors.hover,
        transform: variant === "compact" ? "translateY(-3px)" : "translateY(-4px) scale(1.02)",
        boxShadow:
          variant === "compact"
            ? `0 15px 35px ${colors.shadow}`
            : `0 25px 50px ${colors.shadow}, 0 0 0 1px ${borderColor}`,
        borderColor: variant === "compact" ? "rgba(255,255,255,0.4)" : borderColor,
        ...SWEEP_EFFECTS._hover,
      }}
      _active={{
        transform: variant === "compact" ? "translateY(-1px)" : "translateY(-2px) scale(0.98)",
        boxShadow: variant === "compact" ? `0 10px 25px ${colors.shadow}` : `0 15px 30px ${colors.shadow}`,
      }}
      {...SWEEP_EFFECTS}
      {...motionTweaks}
      {...rest}
    >
      <HStack spacing={variant === "compact" ? 3 : 4} position="relative" zIndex={2}>
        {icon && (
        <Icon
            as={icon}
            boxSize={variant === "compact" ? "16px" : "18px"}
            filter={`drop-shadow(0 ${variant === "compact" ? 1 : 2}px ${variant === "compact" ? 2 : 4}px rgba(0,0,0,0.3))`}
            transition="all 0.25s ease"
            _groupHover={iconAnimation ? { transform: iconAnimation } : undefined}
          />
        )}
        <Text 
          fontSize={preset.textSize}
          fontWeight={variant === "compact" ? "600" : "700"}
          textShadow={["search", "timeline"].includes(variant) ? "0 1px 2px rgba(0,0,0,0.3)" : undefined}
          filter={!["search", "timeline", "compact"].includes(variant) ? "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" : undefined}
        >
          {children}
        </Text>
      </HStack>
    </MotionButton>
  );
}

// =======================================================
// Exports específicos
// =======================================================

export const ModernLoginButton = ({ onClick, children = "Log in", ...props }) => (
  <ModernButtonBase type="login" onClick={onClick} icon={FaSignInAlt} {...props}>
    {children}
  </ModernButtonBase>
);

export const ModernRegisterButton = ({ onClick, children = "Register", ...props }) => (
  <ModernButtonBase type="register" onClick={onClick} icon={FaUserPlus} {...props}>
    {children}
  </ModernButtonBase>
);
