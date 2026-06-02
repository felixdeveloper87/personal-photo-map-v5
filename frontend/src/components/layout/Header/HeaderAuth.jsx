import React from 'react';
import { HStack, Box } from '@chakra-ui/react';
import {
  ModernLoginButton,
  ModernRegisterButton,
} from '../../ui/buttons/ModernButtons';

const HeaderAuth = ({ onLoginClick, onRegisterClick, display, size = "sm", ...props }) => {

  return (
    <Box display={display} {...props}>
      {/* Horizontal (lado a lado) em todas as telas */}
      <HStack 
        spacing={{ base: 2, sm: 2, md: 3, lg: 4, xl: 4, "2xl": 4 }}
      >
        <ModernLoginButton 
          onClick={onLoginClick} 
          variant="compact"
          size={size}
        />
        <ModernRegisterButton 
          onClick={onRegisterClick} 
          variant="compact"
          size={size}
        />
      </HStack>
    </Box>
  );
};

export default HeaderAuth;
