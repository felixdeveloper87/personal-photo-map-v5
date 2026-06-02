import React from "react";
import { Button, useColorModeValue, HStack, Icon, Text } from "@chakra-ui/react";
import {
  FaMoon, FaSun, FaCrown, FaImages, FaGlobe, FaSignOutAlt,
  FaClock, FaSearch, FaUserPlus, FaSignInAlt, FaUserCircle,
} from "react-icons/fa";

const MATERIAL_COLORS = {
  blue:   { light: "#1a73e8", container: "#e8f0fe", dark: "#174ea6" },
  green:  { light: "#188038", container: "#e6f4ea", dark: "#0d652d" },
  yellow: { light: "#f9ab00", container: "#fef7e0", dark: "#c27800" },
  red:    { light: "#d93025", container: "#fce8e6", dark: "#a50e0e" },
  purple: { light: "#9334e6", container: "#f3e8fd", dark: "#681da8" },
  cyan:   { light: "#039be5", container: "#e1f3fb", dark: "#01579b" },
  orange: { light: "#e8710a", container: "#fce8d5", dark: "#b55309" },
  gray:   { light: "#5f6368", container: "#f1f3f4", dark: "#3c4043" },
};

const ICON_SIZE = { xs: 14, sm: 15, md: 17, lg: 19 };

const MaterialButton = ({
  icon, text, tone = "blue", onClick, size = "sm",
  variant = "filled", hideText = false, ...props
}) => {
  const c = MATERIAL_COLORS[tone] || MATERIAL_COLORS.blue;
  const bg = useColorModeValue(c.container, c.dark);
  const color = useColorModeValue(c.light, "#fff");
  const borderColor = useColorModeValue(c.light + "40", c.container);
  const hoverBg = useColorModeValue(c.light + "22", c.light + "44");
  const boxShadow = useColorModeValue(
    "0 1px 3px rgba(60,64,67,0.2)",
    "0 2px 6px rgba(0,0,0,0.3)"
  );

  const variantStyles =
    variant === "outlined"
      ? { bg: "transparent", color, border: `1px solid ${borderColor}` }
      : variant === "tonal"
      ? { bg, color, border: "none" }
      : { bg: c.light, color: "#fff", border: "none" };

  return (
    <Button
      onClick={onClick}
      size={size}
      borderRadius="lg"
      fontWeight="600"
      letterSpacing="0.2px"
      transition="all 0.18s ease"
      boxShadow={boxShadow}
      _hover={{ bg: hoverBg, transform: "translateY(-1px)", boxShadow: "md" }}
      _active={{ transform: "translateY(0)", boxShadow: "sm" }}
      {...variantStyles}
      {...props}
    >
      <HStack spacing={hideText ? 0 : 1.5}>
        {icon && <Icon as={icon} boxSize={`${ICON_SIZE[size] ?? 15}px`} />}
        {text && !hideText && <Text fontSize="sm">{text}</Text>}
      </HStack>
    </Button>
  );
};

export const ThemeToggleButton = ({ colorMode, toggleColorMode, ...props }) => (
  <MaterialButton
    icon={colorMode === "light" ? FaMoon : FaSun}
    tone="blue"
    variant="tonal"
    onClick={toggleColorMode}
    aria-label="Toggle theme"
    {...props}
  />
);

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
