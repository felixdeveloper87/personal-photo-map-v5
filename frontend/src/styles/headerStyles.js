import { useColorModeValue } from '@chakra-ui/react';

export const useHeaderStyles = () => {
  // Cores de destaque em tons de oceano
  const accentColor = useColorModeValue("blue.500", "blue.300");
  const accentColorHover = useColorModeValue("blue.600", "blue.200");

  // Cores para elementos específicos
  const logoTextColor = useColorModeValue("gray.900", "white");
  const logoSubtextColor = useColorModeValue("gray.600", "gray.300");

  return {
    accentColor,
    accentColorHover,
    logoTextColor,
    logoSubtextColor,
  };
};

export const headerContainerStyles = () => ({
  w: "100%",
  backdropFilter: "blur(24px)",
  borderBottom: "2px solid",
  borderColor: "rgba(39, 143, 195, 0.2)",
  py: { base: 2, sm: 3, md: 5 }, 
});

export const logoStyles = (themeStyles = {}) => ({
  align: "center",
  cursor: "pointer",
  _hover: { 
    transform: "scale(1.02)",
    filter: "brightness(1.05)"
  },
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  flexShrink: 0,
  minW: { base: "auto", sm: "220px" }
});
