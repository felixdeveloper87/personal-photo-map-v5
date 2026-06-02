import React from "react";
import { Button, HStack, Icon, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

// Calm, single-accent header auth buttons (Refined Blue).
// Register = primary action; Login = quiet secondary. No shimmer, no rotate.

const MotionButton = motion.create(Button);

const PRIMARY = "#2563EB";
const PRIMARY_HOVER = "#1D4ED8";

const heightMapping = { xs: "30px", sm: "36px", md: "40px", lg: "46px" };
const paddingXMapping = { xs: 3, sm: 4, md: 5, lg: 6 };
const fontSizeMapping = { xs: "12px", sm: "13px", md: "14px", lg: "15px" };
const iconSizeMapping = { xs: "12px", sm: "13px", md: "14px", lg: "16px" };

const mapSizeProp = (s, mapping) => {
  if (!s) return mapping.md;
  if (typeof s === "string") return mapping[s] || mapping.md;
  if (typeof s === "object") {
    const res = {};
    for (const key in s) res[key] = mapping[s[key]] || mapping.md;
    return res;
  }
  return mapping.md;
};

function useButtonStyle(type) {
  const secondaryText = useColorModeValue("#334155", "#CBD5E1");
  const secondaryBorder = useColorModeValue("#D5DBE3", "rgba(255,255,255,0.16)");
  const secondaryHoverBg = useColorModeValue("rgba(37,99,235,0.06)", "rgba(37,99,235,0.14)");

  if (type === "register") {
    return {
      bg: PRIMARY,
      color: "white",
      borderColor: "transparent",
      boxShadow: "0 1px 2px rgba(15,23,42,0.12)",
      _hover: {
        bg: PRIMARY_HOVER,
        boxShadow: "0 8px 20px -8px rgba(37,99,235,0.5)",
      },
    };
  }
  return {
    bg: "transparent",
    color: secondaryText,
    borderColor: secondaryBorder,
    _hover: {
      bg: secondaryHoverBg,
      borderColor: PRIMARY,
      color: PRIMARY,
    },
  };
}

function ModernButtonBase({ type, variant = "compact", onClick, icon, children, size = "md", ...rest }) {
  const style = useButtonStyle(type);
  const isCompact = variant === "compact";

  const buttonHeight = isCompact ? mapSizeProp(size, heightMapping) : "48px";
  const paddingX = isCompact ? mapSizeProp(size, paddingXMapping) : 7;
  const fontSize = isCompact ? mapSizeProp(size, fontSizeMapping) : "md";
  const iconSize = isCompact ? mapSizeProp(size, iconSizeMapping) : "16px";

  return (
    <MotionButton
      onClick={onClick}
      h={buttonHeight}
      px={paddingX}
      fontWeight="600"
      letterSpacing="0"
      borderRadius="full"
      borderWidth="1px"
      transition="background .2s ease, border-color .2s ease, color .2s ease, box-shadow .2s ease"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      {...style}
      {...rest}
    >
      <HStack spacing={2}>
        {icon && <Icon as={icon} boxSize={iconSize} />}
        <Text fontSize={fontSize} fontWeight="600">{children}</Text>
      </HStack>
    </MotionButton>
  );
}

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
