import React from 'react';
import { HStack, VStack, Box } from '@chakra-ui/react';
import {
  ModernLoginButton,
  ModernRegisterButton,
} from '../../ui/buttons/HeaderButtons';

const HeaderAuth = ({ onLoginClick, onRegisterClick, display, size = "sm", ...props }) => {

  return (
    <Box display={display} {...props}>
      {/* Mobile: Vertical (um em cima do outro) */}
      <VStack 
        display={{ base: size === "xs" ? "flex" : "none", md: "none" }} 
        spacing={0.5}
        align="stretch"
        w="65px"
      >
        <ModernLoginButton 
          onClick={onLoginClick} 
          size="xs" 
          h="20px"
          fontSize="7px"
          px={0.5}
          py={0}
          minW="auto"
          w="full"
        />
        <ModernRegisterButton 
          onClick={onRegisterClick} 
          size="xs"
          h="20px"
          fontSize="7px"
          px={0.5}
          py={0}
          minW="auto"
          w="full"
        />
      </VStack>

      {/* Desktop: Horizontal (lado a lado) */}
      <HStack 
        display={{ base: size === "xs" ? "none" : "flex", md: "flex" }} 
        spacing={0}
      >
        <ModernLoginButton 
          onClick={onLoginClick} 
          size={size} 
          mr={8}
        />
        <ModernRegisterButton 
          onClick={onRegisterClick} 
          size={size}
        />
      </HStack>
    </Box>
  );
};

export default HeaderAuth;
