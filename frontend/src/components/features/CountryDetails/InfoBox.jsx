import {
  Box,
  VStack,
  Icon,
  Text,
  useColorModeValue,
  useBreakpointValue,
  Skeleton,
  Tooltip,
} from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion.create(Box);

export default function InfoBox({
  icon,
  label,
  value,
  colorScheme = "blue",
  onClick,
  size = "default",
  isLoading = false,
  tooltip = null,
  variant = "elevated",
  sx = {},
}) {
  const tone = useColorModeValue("light", "dark");

  // === Refined Soft Color Palettes ===
  const colorSchemes = {
    blue: tone === "light"
      ? { icon: "#1a73e8", bg: "#f7f9ff", border: "#e0e7ff" }
      : { icon: "#8ab4f8", bg: "#0c1424", border: "#1e3a8a" },
    green: tone === "light"
      ? { icon: "#188038", bg: "#f6faf8", border: "#d8eee0" }
      : { icon: "#81c995", bg: "#0f1d12", border: "#1f3d28" },
    orange: tone === "light"
      ? { icon: "#d97706", bg: "#fff9f2", border: "#f4e3c5" }
      : { icon: "#f9ab00", bg: "#1e1500", border: "#3d2e00" },
    red: tone === "light"
      ? { icon: "#d93025", bg: "#fff6f5", border: "#f5d4d2" }
      : { icon: "#f28b82", bg: "#1e0f0f", border: "#3b0d0c" },
  };
  const currentColors = colorSchemes[colorScheme] || colorSchemes.blue;

  // === Sizes ===
  const isMobile = useBreakpointValue({ base: true, sm: false });
  const sizes = {
    default: {
      p: isMobile ? 3 : 4,
      borderRadius: "16px",
      iconSize: isMobile ? 6 : 8,
      labelFontSize: isMobile ? "xs" : "sm",
      valueFontSize: isMobile ? "sm" : "md",
    },
    compact: {
      p: isMobile ? 2 : 3,
      borderRadius: "12px",
      iconSize: isMobile ? 5 : 6,
      labelFontSize: isMobile ? "10px" : "xs",
      valueFontSize: isMobile ? "xs" : "sm",
    },
  };
  const currentSize = sizes[size];

  // === Variants ===
  const variants = {
    flat: {
      bg: useColorModeValue("white", "gray.800"),
      border: `1px solid ${useColorModeValue("#e0e0e0", "#333")}`,
      shadow: "none",
    },
    elevated: {
      bg: currentColors.bg,
      border: `1px solid ${currentColors.border}`,
      shadow: useColorModeValue(
        "0 2px 6px rgba(0,0,0,0.08)",
        "0 2px 6px rgba(0,0,0,0.4)"
      ),
    },
    outlined: {
      bg: "transparent",
      border: `1px solid ${currentColors.icon}`,
      shadow: "none",
    },
  };
  const currentVariant = variants[variant] || variants.elevated;

  // === Motion Variants ===
  const boxMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" } },
    hover: {
      y: -3,
      transition: { duration: 0.18, ease: "easeInOut" },
      boxShadow: useColorModeValue(
        "0 6px 14px rgba(0,0,0,0.08)",
        "0 6px 14px rgba(0,0,0,0.4)"
      ),
    },
    tap: { scale: 0.985 },
  };

  // === Typography ===
  const labelColor = useColorModeValue("gray.700", "gray.300");
  const valueColor = useColorModeValue("gray.900", "gray.100");

  // === Texture (subtle carbon lines) ===
  const texturePattern = useColorModeValue(
    `repeating-linear-gradient(
      45deg,
      rgba(0, 0, 0, 0.015) 0px,
      rgba(0, 0, 0, 0.015) 10px,
      transparent 10px,
      transparent 20px
    )`,
    `repeating-linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.03) 0px,
      rgba(255, 255, 255, 0.03) 10px,
      transparent 10px,
      transparent 20px
    )`
  );

  const dotOverlay = useColorModeValue(
    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.06) 1px, transparent 0)",
    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)"
  );

  const boxContent = (
    <VStack
      spacing={1.5}
      align="center"
      justify="center"
      textAlign="center"
      position="relative"
      zIndex={1}
    >
      <Icon as={icon} boxSize={currentSize.iconSize} color={currentColors.icon} />
      <Text
        fontSize={currentSize.labelFontSize}
        fontWeight="medium"
        color={labelColor}
        letterSpacing="0.4px"
      >
        {label}
      </Text>
      <Text
        fontSize={currentSize.valueFontSize}
        fontWeight="600"
        color={valueColor}
        noOfLines={2}
        lineHeight="short"
      >
        {isLoading ? <Skeleton height="14px" width="60%" mx="auto" /> : value || "—"}
      </Text>
    </VStack>
  );

  const box = (
    <MotionBox
      variants={boxMotion}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      p={currentSize.p}
      borderRadius={currentSize.borderRadius}
      bg={currentVariant.bg}
      border={currentVariant.border}
      boxShadow={currentVariant.shadow}
      cursor={onClick ? "pointer" : "default"}
      onClick={onClick}
      transition="all 0.2s ease"
      _focusWithin={{
        outline: "2px solid",
        outlineColor: currentColors.icon,
      }}
      sx={{
        minW: 0,
        position: "relative",
        overflow: "hidden",
        backgroundImage: `${texturePattern}, ${dotOverlay}`,
        backgroundSize: "20px 20px, 12px 12px",
        backgroundBlendMode: "overlay",
        pointerEvents: "auto",
        ...sx,
      }}
    >
      {boxContent}
    </MotionBox>
  );

  return tooltip ? (
    <Tooltip label={tooltip} hasArrow>
      {box}
    </Tooltip>
  ) : (
    box
  );
}
