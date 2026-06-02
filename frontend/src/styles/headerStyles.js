import { useColorModeValue } from '@chakra-ui/react';

export const useHeaderStyles = () => {
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const accentColorHover = useColorModeValue("blue.600", "blue.200");
  const logoTextColor = useColorModeValue("gray.900", "white");
  const logoSubtextColor = useColorModeValue("gray.500", "gray.400");
  return { accentColor, accentColorHover, logoTextColor, logoSubtextColor };
};

export const useHeaderContainerStyles = () => {
  const bg = useColorModeValue("rgba(255,255,255,0.88)", "rgba(10,11,16,0.9)");
  const borderColor = useColorModeValue("gray.200", "whiteAlpha.100");
  const boxShadow = useColorModeValue(
    "0 1px 16px rgba(0,0,0,0.07)",
    "0 1px 16px rgba(0,0,0,0.5)"
  );
  return {
    w: "100%",
    bg,
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid",
    borderColor,
    boxShadow,
    py: { base: 2, sm: 3, md: 4 },
  };
};

export const logoStyles = () => ({
  align: "center",
  cursor: "pointer",
  userSelect: "none",
  transition: "all 0.2s ease",
  flexShrink: 0,
});
