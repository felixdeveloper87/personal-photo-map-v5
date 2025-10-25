import React from "react";
import {
  Button,
  useColorModeValue,
  Box,
  HStack,
  Icon,
  Text,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaMoon,
  FaSun,
  FaCrown,
  FaImages,
  FaMap,
  FaSignOutAlt,
  FaClock,
  FaSearch,
  FaUser,
  FaUserPlus,
  FaSignInAlt,
  FaUserCircle,
  FaGlobe,
} from "react-icons/fa";

const MotionButton = motion(Button);

/* =====================================
   🎨 Material Theme Palette
   ===================================== */
const MATERIAL_COLORS = {
  blue: { light: "#1a73e8", container: "#e8f0fe", dark: "#174ea6" },
  green: { light: "#188038", container: "#e6f4ea", dark: "#0d652d" },
  yellow: { light: "#f9ab00", container: "#fef7e0", dark: "#c27800" },
  red: { light: "#d93025", container: "#fce8e6", dark: "#a50e0e" },
  purple: { light: "#9334e6", container: "#f3e8fd", dark: "#681da8" },
  cyan: { light: "#039be5", container: "#e1f3fb", dark: "#01579b" },
  gray: { light: "#5f6368", container: "#f1f3f4", dark: "#3c4043" },
};

/* =====================================
   🔹 Base: ModernMaterialButton
   ===================================== */
const ModernMaterialButton = ({
  icon,
  text,
  tone = "blue",
  onClick,
  size = "sm",
  variant = "filled", // "filled" | "outlined" | "tonal"
  ...props
}) => {
  const mode = useColorModeValue("light", "dark");
  const c = MATERIAL_COLORS[tone] || MATERIAL_COLORS.blue;

  // Dynamic palette per mode
  const bg = useColorModeValue(c.container, c.dark);
  const color = useColorModeValue(c.light, "#fff");
  const border = useColorModeValue(c.light + "40", c.container);
  const hoverBg = useColorModeValue(c.light + "1A", c.light + "33");

  const boxShadow = useColorModeValue(
    "0 1px 3px rgba(60,64,67,0.25)",
    "0 2px 6px rgba(0,0,0,0.35)"
  );

  const iconSize = { xs: 12, sm: 14, md: 18, lg: 20 }[size] || 16;

  const variantStyles =
    variant === "outlined"
      ? {
          bg: "transparent",
          color: color,
          border: `1px solid ${border}`,
        }
      : variant === "tonal"
      ? {
          bg: bg,
          color: useColorModeValue(c.light, "#fff"),
          border: "none",
        }
      : {
          bg: c.light,
          color: "#fff",
          border: "none",
        };

  return (
    <MotionButton
      onClick={onClick}
      size={size}
      borderRadius="xl"
      fontWeight="600"
      letterSpacing="0.3px"
      px={4}
      py={2}
      transition="all 0.2s ease-in-out"
      boxShadow={boxShadow}
      _hover={{
        bg: hoverBg,
        transform: "translateY(-1px)",
      }}
      _active={{
        transform: "translateY(0)",
        boxShadow: "inset 0 2px 4px rgba(0,0,0,0.15)",
      }}
      {...variantStyles}
      {...props}
    >
      <HStack spacing={2}>
        {icon && <Icon as={icon} boxSize={`${iconSize}px`} />}
        {text && <Text fontSize="sm">{text}</Text>}
      </HStack>
    </MotionButton>
  );
};

/* =====================================
   🔹 Specific Buttons (Material Edition)
   ===================================== */

export const ThemeToggleButton = ({ colorMode, toggleColorMode }) => (
  <ModernMaterialButton
    icon={colorMode === "light" ? FaMoon : FaSun}
    tone="blue"
    variant="tonal"
    onClick={toggleColorMode}
    aria-label="Toggle theme"
  />
);

export const PremiumButton = ({ onClick }) => (
  <ModernMaterialButton
    icon={FaCrown}
    text=""
    tone="yellow"
    onClick={onClick}
  />
);

export const PhotoStorageButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaImages} text="Photos" tone="purple" onClick={onClick} />
);

export const UserProfileButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaUserCircle} text="Profile" tone="cyan" onClick={onClick} />
);

export const LogoutButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaSignOutAlt} text="" tone="red" onClick={onClick} />
);

export const TimelineButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaClock} text="Timeline" tone="orange" onClick={onClick} />
);

export const SearchButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaSearch} text="Search" tone="blue" onClick={onClick} />
);

export const MapButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaGlobe} text="" tone="blue" onClick={onClick} />
);

export const LoginButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaSignInAlt} text="" tone="blue" variant="tonal" onClick={onClick} />
);

export const RegisterButton = ({ onClick }) => (
  <ModernMaterialButton icon={FaUserPlus} text="" tone="green" onClick={onClick} />
);
