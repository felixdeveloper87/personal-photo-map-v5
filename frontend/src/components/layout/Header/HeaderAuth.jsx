import React from 'react';
import { HStack, Box } from '@chakra-ui/react';
import {
  ModernLoginButton,
  ModernRegisterButton,
} from '../../ui/buttons/HeaderButtons';

const HeaderAuth = ({ onLoginClick, onRegisterClick, display, size = "sm", ...props }) => {

  return (
    <Box display={display} {...props}>
      {/* Horizontal (lado a lado) em todas as telas */}
      <HStack 
        spacing={{ base: 1, sm: 2, md: 3 }}
      >
        <ModernLoginButton 
          onClick={onLoginClick} 
          size={size}
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
