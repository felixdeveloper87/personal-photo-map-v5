import React from "react";
import { Button, useColorModeValue, HStack, Icon, Text, Box } from "@chakra-ui/react";
import { motion } from "framer-motion";
import {
  FaCrown, FaImages, FaGlobe, FaSignOutAlt,
  FaClock, FaSearch, FaUserPlus, FaSignInAlt, FaUserCircle,
} from "react-icons/fa";

const MotionButton = motion.create(Button);

const MATERIAL_COLORS = {
  blue:   { light: "#2563eb", container: "#eff6ff", dark: "#1d4ed8" },
  green:  { light: "#10b981", container: "#ecfdf5", dark: "#047857" },
  yellow: { light: "#eab308", container: "#fef9c3", dark: "#a16207" },
  red:    { light: "#ef4444", container: "#fef2f2", dark: "#b91c1c" },
  purple: { light: "#8b5cf6", container: "#f5f3ff", dark: "#6d28d9" },
  cyan:   { light: "#06b6d4", container: "#ecfeff", dark: "#0891b2" },
  orange: { light: "#f97316", container: "#fff7ed", dark: "#c2410c" },
  gray:   { light: "#6b7280", container: "#f3f4f6", dark: "#4b5563" },
};

const ICON_SIZE = { xs: 13, sm: 14, md: 16, lg: 18 };

const MaterialButton = ({
  icon, text, tone = "blue", onClick, size = "sm",
  variant = "filled", hideText = false, ...props
}) => {
  const c = MATERIAL_COLORS[tone] || MATERIAL_COLORS.blue;

  // Modern SaaS Glassmorphism styles
  const glassBg = useColorModeValue("rgba(255, 255, 255, 0.45)", "rgba(15, 23, 42, 0.35)");
  const glassBorderColor = useColorModeValue("rgba(226, 232, 240, 0.8)", "rgba(255, 255, 255, 0.08)");
  const glassHoverBorderColor = useColorModeValue("rgba(186, 200, 218, 1)", "rgba(255, 255, 255, 0.18)");
  
  const textColor = useColorModeValue("gray.700", "gray.300");
  const iconColor = useColorModeValue(c.light, c.light);
  
  // Soft glowing shadows instead of harsh dark shadows
  const shadowColor = useColorModeValue(c.light + "1a", c.light + "26");
  const baseShadow = useColorModeValue("0 1px 2px rgba(0,0,0,0.05)", "0 1px 2px rgba(0,0,0,0.2)");
  const hoverShadow = `0 8px 20px ${shadowColor}, 0 2px 4px rgba(0,0,0,0.02)`;

  // Subtle translucent gradients for hover states (adds depth)
  const hoverGradients = {
    blue:   "linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(29, 78, 216, 0.12) 100%)",
    green:  "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(4, 120, 87, 0.12) 100%)",
    yellow: "linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(161, 98, 7, 0.16) 100%)",
    red:    "linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(185, 28, 28, 0.12) 100%)",
    purple: "linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(109, 40, 217, 0.12) 100%)",
    cyan:   "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(8, 145, 178, 0.12) 100%)",
    orange: "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(194, 65, 12) 0.12%)",
    gray:   "linear-gradient(135deg, rgba(107, 114, 128, 0.08) 0%, rgba(75, 85, 99, 0.12) 100%)",
  };

  const hoverBgGradient = hoverGradients[tone] || hoverGradients.blue;

  // We keep Premium & Register (primary actions) as gorgeous solid accent buttons
  const isPremiumAction = tone === "yellow" && text === "Premium";
  const isSignUpAction = tone === "green" && text === "Sign Up";
  const isSolidAction = isPremiumAction || isSignUpAction;

  const solidBg = isPremiumAction
    ? "linear-gradient(135deg, #eab308 0%, #ca8a04 100%)"
    : "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    
  const solidHoverBg = isPremiumAction
    ? "linear-gradient(135deg, #facc15 0%, #eab308 100%)"
    : "linear-gradient(135deg, #34d399 0%, #10b981 100%)";

  const solidColor = isPremiumAction ? "gray.900" : "white";

  // Base and Hover styling depending on whether it is a solid action or a sleek glass button
  const buttonStyle = isSolidAction
    ? {
        bgGradient: solidBg,
        color: solidColor,
        border: "1px solid",
        borderColor: "rgba(255, 255, 255, 0.1)",
        _hover: {
          bgGradient: solidHoverBg,
          borderColor: "rgba(255, 255, 255, 0.25)",
          boxShadow: `0 8px 24px ${useColorModeValue("rgba(234,179,8,0.25)", "rgba(234,179,8,0.45)")}`,
        }
      }
    : {
        bg: glassBg,
        color: textColor,
        border: "1px solid",
        borderColor: glassBorderColor,
        backdropFilter: "blur(12px)",
        _hover: {
          bgGradient: hoverBgGradient,
          borderColor: glassHoverBorderColor,
          color: useColorModeValue("gray.900", "white"),
          boxShadow: hoverShadow,
        }
      };

  const buttonHeight = size === "xs" ? "28px" : size === "sm" ? "34px" : "38px";
  const paddingX = size === "xs" ? 2.5 : size === "sm" ? 4 : 5;

  return (
    <MotionButton
      role="group"
      onClick={onClick}
      h={buttonHeight}
      px={paddingX}
      position="relative"
      overflow="hidden"
      borderRadius="full" // Sleek, modern pills
      fontSize="12px"     // Clean, smaller tech typography
      fontWeight="600"
      letterSpacing="0.1px"
      boxShadow={baseShadow}
      transition={{ duration: 0.2, ease: "easeOut" }}
      whileHover={{ scale: 1.02, translateY: "-1px" }}
      whileTap={{ scale: 0.98, translateY: "0px" }}
      _active={{
        boxShadow: "sm",
      }}
      {...buttonStyle}
      {...props}
    >
      <HStack spacing={hideText ? 0 : 2} position="relative" zIndex={2}>
        {icon && (
          <Icon
            as={icon}
            color={isSolidAction ? "inherit" : iconColor}
            boxSize={`${ICON_SIZE[size] ?? 14}px`}
            transition="transform 0.2s ease"
            _groupHover={{ transform: "scale(1.08)" }}
          />
        )}
        {text && !hideText && <Text>{text}</Text>}
      </HStack>
    </MotionButton>
  );
};

export const PremiumButton       = ({ onClick, ...props }) => (
  <MaterialButton icon={FaCrown}      text="Premium"  tone="yellow"  onClick={onClick} {...props} />
);
export const PhotoStorageButton  = ({ onClick, ...props }) => (
  <MaterialButton icon={FaImages}     text="Photos"   tone="purple"  onClick={onClick} {...props} />
);
export const UserProfileButton   = ({ onClick, ...props }) => (
  <MaterialButton icon={FaUserCircle} text="Profile"  tone="cyan"    onClick={onClick} {...props} />
);
export const LogoutButton        = ({ onClick, ...props }) => (
  <MaterialButton icon={FaSignOutAlt} text="Logout"   tone="red"     onClick={onClick} {...props} />
);
export const TimelineButton      = ({ onClick, ...props }) => (
  <MaterialButton icon={FaClock}      text="Timeline" tone="orange"  onClick={onClick} {...props} />
);
export const SearchButton        = ({ onClick, ...props }) => (
  <MaterialButton icon={FaSearch}     text="Search"   tone="blue"    onClick={onClick} {...props} />
);
export const MapButton           = ({ onClick, ...props }) => (
  <MaterialButton icon={FaGlobe}      text="Map"      tone="blue"    onClick={onClick} {...props} />
);
export const LoginButton         = ({ onClick, size = "sm", ...props }) => (
  <MaterialButton icon={FaSignInAlt}  text="Login"    tone="blue"    variant="tonal" onClick={onClick} size={size} {...props} />
);
export const RegisterButton      = ({ onClick, size = "sm", ...props }) => (
  <MaterialButton icon={FaUserPlus}   text="Sign Up"  tone="green"   onClick={onClick} size={size} {...props} />
);
